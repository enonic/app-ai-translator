import { cn } from '@enonic/ui';
import { useStore } from '@nanostores/react';
import React from 'react';
import { Trans } from 'react-i18next';

import { $content } from '@/store/content';
import { $items } from '@/store/items';
import FramedText from '@/ui/primitives/FramedText';

import AssistantMessage from '@/components/dialog/AssistantMessage/AssistantMessage';

export default function ProcessingView(): React.ReactNode {
  const { paths, remaining } = useStore($items);
  const { language } = useStore($content, { keys: ['language'] });

  const countTotal = paths.length;
  const countRemaining = countTotal - remaining.length;
  const isPreparing = countTotal === 0;

  return (
    <AssistantMessage>
      <p className="bg-surface-neutral-hover mr-auto inline-block rounded-3xl px-3 py-2 text-sm">
        <span
          className={cn(
            'bg-gradient-middle from-main to-decorative bg-size-[200%_100%]',
            'animate-move-gradient bg-clip-text text-transparent',
            'pl-1 text-left text-sm',
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
        </span>
      </p>
    </AssistantMessage>
  );
}
