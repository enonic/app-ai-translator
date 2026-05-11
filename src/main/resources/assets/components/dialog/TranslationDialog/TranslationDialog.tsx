import { Button, Dialog } from '@enonic/ui';
import { useStore } from '@nanostores/react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { $dialog, setDialogView, setDialogVisible, type DialogView } from '@/store/dialog';
import { $translating, startTranslation, stopTranslation } from '@/store/websocket';

import CompletedView from '@/components/dialog/view/CompletedView/CompletedView';
import PreparationView from '@/components/dialog/view/PreparationView/PreparationView';
import ProcessingView from '@/components/dialog/view/ProcessingView/ProcessingView';

const TRANSLATION_DIALOG_NAME = 'TranslationDialog';

export default function TranslationDialog(): React.ReactNode {
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

//
// * Body
//

function renderView(view: DialogView): React.ReactNode {
  switch (view) {
    case 'preparation':
      return <PreparationView />;
    case 'processing':
      return <ProcessingView />;
    case 'completed':
      return <CompletedView />;
  }
}

function DialogBody(): React.ReactNode {
  const { view } = useStore($dialog, { keys: ['view'] });

  return (
    <Dialog.Body className="-mx-2 -mb-2 flex flex-col gap-4 px-2 pb-2">
      {renderView(view)}
    </Dialog.Body>
  );
}

//
// * Footer
//

function DialogFooter(): React.ReactNode {
  const isTranslating = useStore($translating);
  const { view } = useStore($dialog, { keys: ['view'] });
  const isPreparing = view === 'preparation';

  const { t } = useTranslation();
  const ref = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <Dialog.Footer className="gap-2.5 px-2.5">
      <Dialog.Close asChild>
        <Button
          variant="outline"
          size="md"
          label={t(view === 'completed' ? 'action.close' : 'action.cancel')}
        />
      </Dialog.Close>
      {isPreparing && (
        <Button
          ref={ref}
          variant="solid"
          size="md"
          label={t('action.translate')}
          disabled={isTranslating}
          onClick={() => {
            startTranslation();
            setDialogView('processing');
          }}
        />
      )}
    </Dialog.Footer>
  );
}
