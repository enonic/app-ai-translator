import { Dialog } from '@enonic/ui';
import { useStore } from '@nanostores/react';
import { useTranslation } from 'react-i18next';

import { $dialog, setDialogVisible } from '@/store/dialog';
import { stopTranslation } from '@/store/websocket';

import { DialogBody } from './DialogBody/DialogBody';
import { DialogFooter } from './DialogFooter/DialogFooter';

const TRANSLATION_DIALOG_NAME = 'TranslationDialog';

export function TranslationDialog(): React.ReactNode {
  const { visible } = useStore($dialog, { keys: ['visible'] });

  const { t } = useTranslation();

  return (
    <Dialog.Root
      open={visible}
      onOpenChange={(open) => {
        if (!open) {
          stopTranslation();
          setDialogVisible(false);
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content
          data-component={TRANSLATION_DIALOG_NAME}
          className="TranslationDialog max-w-3xl rounded-lg"
        >
          <Dialog.DefaultHeader title={t('field.title')} withClose />
          <DialogBody />
          <DialogFooter />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

TranslationDialog.displayName = TRANSLATION_DIALOG_NAME;
