import type { AiFieldPath } from '@shared/ai-protocol';

export type ItemsState = 'initial' | 'processing' | 'completed' | 'failed';

export type FailedItem = {
  path: AiFieldPath;
  reason: string;
};

export type Items = {
  paths: AiFieldPath[];
  remaining: AiFieldPath[];
  succeeded: AiFieldPath[];
  failed: FailedItem[];
  globalFailure?: string;
};
