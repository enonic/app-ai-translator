import * as taskLib from '/lib/xp/task';
import cron from '/lib/cron';

export type QueuedTask = {
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
        if (this.queue.length > 0) {
            if (this.activeTasks.size < this.activeAllowed) {
                const task = this.queue.shift();

                if (task) {
                    const taskId = taskLib.executeFunction({
                        description: task.description ?? 'app-ai-translator-queued-task',
                        func: task.func,
                    });

                    this.activeTasks.set(taskId, task);
                    this.startPolling();
                }
            }
        } else {
            this.stopPolling();
        }
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
                log.info('Active tasks: ' + this.activeTasks.size + ', queue length: ' + this.queue.length);

                this.activeTasks.forEach((task, taskId) => {
                    this.updateTaskState(task, taskId, taskLib.get(taskId));
                });

                this.runNextTask();
            },
        });
    }

    private updateTaskState(task: QueuedTask, taskId: string, taskInfo: taskLib.TaskInfo | null): void {
        if (taskInfo) {
            if (taskInfo.state === 'FINISHED') {
                this.activeTasks.delete(taskId);
                task.onSuccess?.();
            } else if (taskInfo.state === 'FAILED') {
                this.activeTasks.delete(taskId);
                task.onError?.();
            }
        }
    }

    private stopPolling(): void {
        if (this.isPolling) {
            cron.unschedule({name: this.name});
        }

        this.isPolling = false;
    }
}
