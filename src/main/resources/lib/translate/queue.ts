import cron from '/lib/cron';
import * as taskLib from '/lib/xp/task';

import type { TranslateFieldPayload } from './results';

import { toKey } from '../../shared/ai-field-path';
import { ERRORS } from '../../shared/errors';
import { TRANSLATION_POOL_SIZE } from '../config';
import { logDebug, LogDebugGroups, logError } from '../logger';
import { putOutcome } from './results';

export const TRANSLATE_FIELD_DESCRIPTOR = 'translateField';

type QueuedTask = {
  descriptor: string;
  config: { payload: string };
};

type Group = {
  id: string;
  tasks: QueuedTask[];
};

class TaskQueue {
  private groups: Group[] = [];

  addTask(task: QueuedTask, groupId: string): void {
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

  takeTask(): QueuedTask | undefined {
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

  private readonly activeTasks: Map<string, QueuedTask>;

  private isPolling: boolean;

  private synchronizer: Synchronizer;

  constructor() {
    this.poolSize = TRANSLATION_POOL_SIZE;
    this.isPolling = false;
    this.synchronizer = __.newBean('com.enonic.app.ai.translator.internal.Synchronizer');
    this.taskQueue = new TaskQueue();
    this.activeTasks = new Map();
  }

  addTask(task: QueuedTask, groupId: string): void {
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

    const taskId = taskLib.submitTask({
      descriptor: nextTask.descriptor,
      config: nextTask.config,
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

    try {
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
                  this.reportFieldFailure(task.config.payload);
                  break;
              }
            });

            this.runNextTasks();
          });
        },
      });
    } catch (e) {
      this.isPolling = false;
      logError('queue.startPolling: cron.schedule threw:');
      logError(e);
    }
  }

  private runNextTasks(): void {
    while (this.runNextTask()) {
      // Run tasks while possible
    }
  }

  private stopPolling(): void {
    if (this.isPolling) {
      try {
        cron.unschedule({ name: TaskHandler.TASK_NAME });
      } catch (e) {
        logError('queue.stopPolling: cron.unschedule threw:');
        logError(e);
      }
    }

    this.isPolling = false;
  }

  private reportFieldFailure(payloadJson: string): void {
    try {
      const payload = JSON.parse(payloadJson) as TranslateFieldPayload;
      putOutcome(payload.sessionId, toKey(payload.path), {
        status: 'failed',
        path: payload.path,
        code: ERRORS.UNKNOWN_ERROR.code,
        message: 'Translation task execution failed',
      });
    } catch (e) {
      logError('queue.reportFieldFailure: could not report failure for task payload');
      logError(e);
    }
  }

  private runFuncThreadSafely(func: () => void): void {
    this.synchronizer.sync(__.toScriptValue(func));
  }
}

const taskHandler = new TaskHandler();

export function addTask(task: QueuedTask, groupId: string): void {
  taskHandler.addTask(task, groupId);
}
