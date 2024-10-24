import {computed, map} from 'nanostores';

import {addGlobalOpenDialogHandler, AiEvents, dispatch} from '../common/events';
import {$config} from './config';

export type Dialog = {
    visible: boolean;
    instructions?: string;
};

export const $dialog = map<Dialog>({
    visible: false,
});

export const $visible = computed($dialog, state => state.visible);
export const $instructions = computed([$dialog, $config], (dialog, config) => {
    return dialog.instructions ?? config.instructions ?? '';
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
    dispatch($visible.get() ? AiEvents.DIALOG_HIDDEN : AiEvents.DIALOG_SHOWN);
    $dialog.setKey('visible', !$dialog.get().visible);
};

addGlobalOpenDialogHandler(() => {
    if (!$visible.get()) {
        toggleDialog();
    }
});
