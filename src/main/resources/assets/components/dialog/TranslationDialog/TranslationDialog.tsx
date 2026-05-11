import { cn, Dialog } from '@enonic/ui';
import { useStore } from '@nanostores/react';
import { useTranslation } from 'react-i18next';

import { useShadowHost } from '@/shadow/ShadowHostContext';
import { $dialog, setDialogVisible } from '@/store/dialog';
import { stopTranslation } from '@/store/websocket';

import { DialogBody } from './DialogBody/DialogBody';
import { DialogFooter } from './DialogFooter/DialogFooter';

const TRANSLATION_DIALOG_NAME = 'TranslationDialog';

export type TranslationDialogProps = {
  className?: string;
};

export function TranslationDialog({ className }: TranslationDialogProps): React.ReactNode {
  const { visible } = useStore($dialog, { keys: ['visible'] });

  const { t } = useTranslation();

  const shadowHost = useShadowHost();

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
      <Dialog.Portal container={shadowHost ?? undefined}>
        <Dialog.Overlay />
        <Dialog.Content
          data-component={TRANSLATION_DIALOG_NAME}
          className={cn('TranslationDialog max-w-3xl rounded-lg', className)}
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
