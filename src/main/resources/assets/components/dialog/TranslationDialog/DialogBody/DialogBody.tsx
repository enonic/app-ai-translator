import { Dialog } from '@enonic/ui';
import { useStore } from '@nanostores/react';

import { CompletedView } from '@/components/dialog/view/CompletedView/CompletedView';
import { PreparationView } from '@/components/dialog/view/PreparationView/PreparationView';
import { ProcessingView } from '@/components/dialog/view/ProcessingView/ProcessingView';
import { $dialog, type DialogView } from '@/store/dialog';

const DIALOG_BODY_NAME = 'DialogBody';

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

export function DialogBody(): React.ReactNode {
  const { view } = useStore($dialog, { keys: ['view'] });

  return (
    <Dialog.Body
      data-component={DIALOG_BODY_NAME}
      className="-mx-2 -mb-2 flex flex-col gap-4 px-2 pb-2"
    >
      {renderView(view)}
    </Dialog.Body>
  );
}

DialogBody.displayName = DIALOG_BODY_NAME;
