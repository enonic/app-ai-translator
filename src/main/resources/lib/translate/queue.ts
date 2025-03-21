import * as taskLib from '/lib/xp/task';
import cron from '/lib/cron';

import {TRANSLATION_POOL_SIZE} from '../config';
import {logDebug, LogDebugGroups} from '../logger';

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

    private runNextTask(): boolean {
        const hasNoTasks = this.queue.length === 0 && this.activeTasks.size === 0;
        if (hasNoTasks) {
            this.stopPolling();
            return false;
        }

        const isActiveTasksLimitReached = this.activeTasks.size >= this.poolSize;
        if (isActiveTasksLimitReached) {
            return false;
        }

        const task = this.queue.shift();
        if (!task) {
            return false;
        }

        const taskId = taskLib.executeFunction({
            description: task.description ?? 'app-ai-translator-queued-task',
            func: task.func,
        });

        this.activeTasks.set(taskId, task);

        this.startPolling();

        return true;
    }

    private runNextTasks(): void {
        while (this.runNextTask()) {
            // Run tasks while possible
        }
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
            times: 480,
            callback: () => {
                logDebug(
                    LogDebugGroups.CRON,
                    `Active tasks: ${this.activeTasks.size}, queue length: ${this.queue.length}`,
                );

                this.activeTasks.forEach((task, taskId) => {
                    const state = taskLib.get(taskId)?.state ?? 'FINISHED';
                    switch (state) {
                        case 'FINISHED':
                            this.activeTasks.delete(taskId);
                            break;
                        case 'FAILED':
                            this.activeTasks.delete(taskId);
                            task.onError?.();
                            break;
                    }
                });

                this.runNextTasks();
            },
        });
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
