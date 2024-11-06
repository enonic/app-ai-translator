import * as taskLib from '/lib/xp/task';
import cron from '/lib/cron';
import type {TaskStateType} from '/lib/xp/task';

import {TRANSLATION_POOL_SIZE} from '../config';
import {logDebug, LogDebugGroups, logError} from '../logger';

type QueuedTask = {
    description?: string;
    func: () => void;
    onError: () => void;
};

class TaskQueue {
    private static TASK_NAME = 'ai-translator-task';

    private readonly poolSize: number;

    private readonly queue: QueuedTask[];

    private readonly activeTasks: Map<string, QueuedTask>;

    private isPolling: boolean;

    constructor() {
        this.poolSize = TRANSLATION_POOL_SIZE;
        this.isPolling = false;
        this.queue = [];
        this.activeTasks = new Map();
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

        const isActiveTasksLimitReached = this.activeTasks.size >= this.poolSize;
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
            name: TaskQueue.TASK_NAME,
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
                break;
            case 'FAILED':
                this.activeTasks.delete(taskId);
                task.onError?.();
                break;
        }
    }

    private stopPolling(): void {
        if (this.isPolling) {
            cron.unschedule({name: TaskQueue.TASK_NAME});
        }

        this.isPolling = false;
    }
}

const taskQueue = new TaskQueue();

export function addTask(task: QueuedTask): void {
    taskQueue.addTask(task);
}
