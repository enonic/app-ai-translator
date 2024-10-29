import {computed, map} from 'nanostores';

import {addGlobalOpenDialogHandler, AiEvents, dispatch} from '../common/events';
import {$config} from './config';

export type Dialog = {
    visible: boolean;
    instructions?: string;
    instructionsEnabled: boolean;
    instructionsVisible: boolean;
};

export const $dialog = map<Dialog>({
    visible: false,
    instructionsEnabled: false,
    instructionsVisible: false,
});

export const $instructions = computed([$dialog, $config], (dialog, config) => {
    return dialog.instructions ?? config.instructions ?? '';
});

$instructions.subscribe(instructions => {
    if (instructions) {
        $dialog.setKey('instructionsEnabled', true);
    }
});

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
    dispatch($dialog.get().visible ? AiEvents.DIALOG_HIDDEN : AiEvents.DIALOG_SHOWN);
    $dialog.setKey('visible', !$dialog.get().visible);
};

export const toggleDialogInstructions = (): void => {
    $dialog.setKey('instructionsVisible', !$dialog.get().instructionsVisible);
};

export const enableInstructions = (): void => {
    $dialog.setKey('instructionsEnabled', true);
    $dialog.setKey('instructionsVisible', true);
};

addGlobalOpenDialogHandler(() => {
    if (!$dialog.get().visible) {
        toggleDialog();
    }
});
