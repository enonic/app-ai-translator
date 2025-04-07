import * as taskLib from '/lib/xp/task';
import cron from '/lib/cron';



import { TRANSLATION_POOL_SIZE } from '../config';
import { logDebug, LogDebugGroups } from '../logger';





type Task = {
    description?: string;
    func: () => void;
    onError: () => void;
};

type Group = {
    id: string;
    tasks: Task[];
};

class TaskQueue {
    private groups: Group[] = [];

    addTask(task: Task, groupId: string): void {
        for (const group of this.groups) {
            if (group.id === groupId) {
                group.tasks.push(task);
                return;
            }
        }

        this.groups.push({
            id: groupId,
            tasks: [task],
        } satisfies Group);
    }

    takeTask(): Task | undefined {
        if (this.groups.length === 0) {
            return undefined;
        }

        const nextGroupToExecute = this.groups.shift();
        if (!nextGroupToExecute) {
            return undefined;
        }

        const nextTask = nextGroupToExecute.tasks.shift();
        if (!nextTask) {
            return undefined;
        }

        if (nextGroupToExecute.tasks.length > 0) {
            // adding the group to the back of the queue if it still has tasks
            this.groups.push(nextGroupToExecute);
        }

        return nextTask;
    }

    isEmpty(): boolean {
        return this.groups.length === 0;
    }

    size(): number {
        return this.groups.length;
    }
}

class TaskHandler {
    private static TASK_NAME = 'ai-translator-task';

    private readonly poolSize: number;

    private readonly taskQueue = new TaskQueue();

    private readonly activeTasks: Map<string, Task>;

    private isPolling: boolean;

    private synchronizer: Synchronizer;

    constructor() {
        this.poolSize = TRANSLATION_POOL_SIZE;
        this.isPolling = false;
        this.synchronizer = __.newBean('com.enonic.app.ai.translator.internal.Synchronizer');
        this.taskQueue = new TaskQueue();
        this.activeTasks = new Map();
    }

    addTask(task: Task, groupId: string): void {
        this.runFuncThreadSafely(() => {
            this.taskQueue.addTask(task, groupId);

            this.runNextTask();
        });
    }

    private runNextTask(): boolean {
        const hasNoTasks = this.taskQueue.isEmpty() && this.activeTasks.size === 0;

        if (hasNoTasks) {
            this.stopPolling();
            return false;
        }

        const isActiveTasksLimitReached = this.activeTasks.size >= this.poolSize;
        if (isActiveTasksLimitReached) {
            return false;
        }

        const nextTask = this.taskQueue.takeTask();

        if (!nextTask) {
            return false;
        }

        const taskId = taskLib.executeFunction({
            description: nextTask.description ?? 'app-ai-translator-queued-task',
            func: nextTask.func,
        });

        this.activeTasks.set(taskId, nextTask);

        this.startPolling();

        return true;
    }

    private startPolling(): void {
        if (this.isPolling) {
            return;
        }

        this.isPolling = true;

        cron.schedule({
            name: TaskHandler.TASK_NAME,
            fixedDelay: 1000,
            delay: 1000,
            times: 480,
            callback: () => {
                logDebug(
                    LogDebugGroups.CRON,
                    `Active tasks: ${this.activeTasks.size}, queue length: ${this.taskQueue.size()}`,
                );

                this.runFuncThreadSafely(() => {
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
                });
            },
        });
    }

    private runNextTasks(): void {
        while (this.runNextTask()) {
            // Run tasks while possible
        }
    }

    private stopPolling(): void {
        if (this.isPolling) {
            cron.unschedule({name: TaskHandler.TASK_NAME});
        }

        this.isPolling = false;
    }

    private runFuncThreadSafely(func: () => void): void {
        this.synchronizer.sync(__.toScriptValue(func));
    }
}

const taskHandler = new TaskHandler();

export function addTask(task: Task, groupId: string): void {
    taskHandler.addTask(task, groupId);
}
