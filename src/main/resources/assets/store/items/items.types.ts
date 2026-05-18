export type ItemsState = 'initial' | 'processing' | 'completed' | 'failed';

export type FailedItem = {
  path: string;
  reason: string;
};

export type Items = {
  paths: string[];
  remaining: string[];
  succeeded: string[];
  failed: FailedItem[];
  globalFailure?: string;
};
