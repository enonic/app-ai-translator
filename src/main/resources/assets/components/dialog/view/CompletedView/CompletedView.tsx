import React from 'react';

import AssistantMessage from '@/components/dialog/AssistantMessage/AssistantMessage';
import TranslationResult from '@/components/dialog/view/TranslationResult/TranslationResult';

export default function CompletedView(): React.ReactNode {
  return (
    <AssistantMessage>
      <p className="bg-surface-neutral-hover mr-auto inline-block rounded-3xl px-3 py-2 text-sm">
        <TranslationResult />
      </p>
    </AssistantMessage>
  );
}
