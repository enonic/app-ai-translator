import { useStore } from '@nanostores/react';
import { Trans } from 'react-i18next';

import { AssistantMessage } from '@/components/dialog/AssistantMessage/AssistantMessage';
import { InstructionsInput } from '@/components/dialog/InstructionsInput/InstructionsInput';
import { $content } from '@/store/content';
import { FramedText } from '@/ui/primitives/FramedText';

const PREPARATION_VIEW_NAME = 'PreparationView';

export function PreparationView(): React.ReactNode {
  const { language } = useStore($content, { keys: ['language'] });

  return (
    <div data-component={PREPARATION_VIEW_NAME} className="flex flex-col gap-6">
      <AssistantMessage>
        <p className="text-main text-base">
          <Trans
            i18nKey="text.greeting"
            components={[<FramedText key="language">{language.name}</FramedText>]}
          />
        </p>
      </AssistantMessage>
      <InstructionsInput />
    </div>
  );
}

PreparationView.displayName = PREPARATION_VIEW_NAME;
