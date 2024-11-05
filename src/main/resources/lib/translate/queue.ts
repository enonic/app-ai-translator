import * as taskLib from '/lib/xp/task';
import cron from '/lib/cron';
import type {TaskStateType} from '/lib/xp/task';

import {logDebug, LogDebugGroups, logError} from '../logger';

type QueuedTask = {
    description?: string;
    func: () => void;
    onSuccess?: () => void;
    onError?: () => void;
};

export class TaskQueue {
    private static instance: TaskQueue;

    private readonly activeAllowed: number;

    private readonly queue: QueuedTask[];

    private readonly activeTasks: Map<string, QueuedTask>;

    private readonly name: string;

    private isPolling: boolean;

    private constructor(name: string, activeAllowed: number) {
        this.name = name;
        this.activeAllowed = activeAllowed;
        this.isPolling = false;
        this.queue = [];
        this.activeTasks = new Map();
    }

    static getTaskQueue(name: string, poolSize: number): TaskQueue {
        if (!TaskQueue.instance) {
            TaskQueue.instance = new TaskQueue(name, poolSize);
        }

        return TaskQueue.instance;
    }

    addTask(task: QueuedTask): void {
        this.queue.push(task);

        this.runNextTask();
    }

    private runNextTask(): void {
        const isQueueEmpty = this.queue.length === 0;
        if (isQueueEmpty) {
            this.stopPolling();
            return;
        }

        const isActiveTasksLimitReached = this.activeTasks.size >= this.activeAllowed;
        if (isActiveTasksLimitReached) {
            return;
        }

        const task = this.queue.shift();
        if (!task) {
            logError('Undefined task received from non empty queue');
            return;
        }

        const taskId = taskLib.executeFunction({
            description: task.description ?? 'app-ai-translator-queued-task',
            func: task.func,
        });

        this.activeTasks.set(taskId, task);
        this.startPolling();
    }

    private startPolling(): void {
        if (this.isPolling) {
            return;
        }

        this.isPolling = true;

        cron.schedule({
            name: this.name,
            fixedDelay: 1000,
            delay: 1000,
            times: 60,
            callback: () => {
                logDebug(
                    LogDebugGroups.CRON,
                    `Active tasks: ${this.activeTasks.size}, queue length: ${this.queue.length}`,
                );

                this.activeTasks.forEach((task, taskId) => {
                    const taskInfo = taskLib.get(taskId);
                    if (taskInfo) {
                        this.updateTaskState(task, taskId, taskInfo.state);
                    }
                });

                this.runNextTask();
            },
        });
    }

    private updateTaskState(task: QueuedTask, taskId: string, state: TaskStateType): void {
        switch (state) {
            case 'FINISHED':
                this.activeTasks.delete(taskId);
                task.onSuccess?.();
                break;
            case 'FAILED':
                this.activeTasks.delete(taskId);
                task.onError?.();
                break;
        }
    }

    private stopPolling(): void {
        if (this.isPolling) {
            cron.unschedule({name: this.name});
        }

        this.isPolling = false;
    }
}
