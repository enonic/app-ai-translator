import { AssistantMessage } from '@/components/dialog/AssistantMessage/AssistantMessage';
import { TranslationResult } from '@/components/dialog/view/TranslationResult/TranslationResult';

const COMPLETED_VIEW_NAME = 'CompletedView';

export function CompletedView(): React.ReactNode {
  return (
    <AssistantMessage>
      <p data-component={COMPLETED_VIEW_NAME} className="text-sm">
        <TranslationResult />
      </p>
    </AssistantMessage>
  );
}

CompletedView.displayName = COMPLETED_VIEW_NAME;
