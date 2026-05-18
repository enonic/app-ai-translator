import type { DialogView } from './dialog.types';

import { $dialog } from './dialog.store';

export const setDialogVisible = (visible: boolean): void => {
  $dialog.setKey('visible', visible);
  if (!visible) {
    $dialog.setKey('instructions', undefined);
  }
};

export const setDialogInstructions = (instructions: string): void => {
  $dialog.setKey('instructions', instructions);
};

export const toggleDialog = (): void => {
  const { visible } = $dialog.get();
  $dialog.setKey('visible', !visible);
};

export const setDialogView = (view: DialogView): void => {
  $dialog.setKey('view', view);
};
