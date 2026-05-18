import { cn } from '@enonic/ui';
import { useStore } from '@nanostores/react';
import { Trans } from 'react-i18next';

import { AssistantMessage } from '@/components/dialog/AssistantMessage/AssistantMessage';
import { $content } from '@/store/content';
import { $items } from '@/store/items';
import { FramedText } from '@/ui/primitives/FramedText';

const PROCESSING_VIEW_NAME = 'ProcessingView';

export function ProcessingView(): React.ReactNode {
  const { paths, remaining } = useStore($items);
  const { language } = useStore($content, { keys: ['language'] });

  const countTotal = paths.length;
  const countRemaining = countTotal - remaining.length;
  const isPreparing = countTotal === 0;

  return (
    <AssistantMessage>
      <p
        data-component={PROCESSING_VIEW_NAME}
        className={cn(
          'bg-gradient-middle from-main to-muted bg-size-[200%_100%]',
          'animate-move-gradient bg-clip-text text-transparent',
          'text-sm',
        )}
      >
        <Trans
          i18nKey={isPreparing ? 'text.translating.preparing' : 'text.translating.progress'}
          values={
            isPreparing
              ? {}
              : {
                  language: language.name,
                  progress: countRemaining,
                  total: countTotal,
                }
          }
          components={{
            framed: <FramedText />,
            bold: <span className="font-bold" />,
          }}
        />
      </p>
    </AssistantMessage>
  );
}

ProcessingView.displayName = PROCESSING_VIEW_NAME;
