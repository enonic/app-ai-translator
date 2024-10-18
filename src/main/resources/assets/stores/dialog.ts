import {computed, map} from 'nanostores';

import {addGlobalOpenDialogHandler, AiEvents, dispatch} from '../common/events';

export type Dialog = {
    visible: boolean;
};

export const $dialog = map<Dialog>({
    visible: false,
});

export const $visible = computed($dialog, state => state.visible);

export const setDialogVisible = (visible: boolean): void => $dialog.setKey('visible', visible);

export const toggleDialog = (): void => {
    dispatch($visible.get() ? AiEvents.DIALOG_HIDDEN : AiEvents.DIALOG_SHOWN);
    $dialog.setKey('visible', !$dialog.get().visible);
};

addGlobalOpenDialogHandler(() => {
    if (!$visible.get()) {
        toggleDialog();
    }
});
