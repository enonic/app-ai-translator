import { Button, Dialog } from '@enonic/ui';
import { useStore } from '@nanostores/react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { $dialog, setDialogView } from '@/store/dialog';
import { $translating, startTranslation } from '@/store/websocket';

const DIALOG_FOOTER_NAME = 'DialogFooter';

export function DialogFooter(): React.ReactNode {
  const ref = useRef<HTMLButtonElement | null>(null);
  const isTranslating = useStore($translating);
  const { view } = useStore($dialog, { keys: ['view'] });
  const isPreparing = view === 'preparation';

  const { t } = useTranslation();

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <Dialog.Footer data-component={DIALOG_FOOTER_NAME} className="gap-2.5 px-2.5">
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

DialogFooter.displayName = DIALOG_FOOTER_NAME;
