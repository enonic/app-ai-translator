import { Avatar, cn } from '@enonic/ui';
import { useTranslation } from 'react-i18next';

import { JukeIcon } from '@/ui/primitives/JukeIcon';

const ASSISTANT_MESSAGE_NAME = 'AssistantMessage';

export type AssistantMessageProps = {
  className?: string;
  children?: React.ReactNode;
};

export function AssistantMessage({ className, children }: AssistantMessageProps): React.ReactNode {
  const { t } = useTranslation();

  return (
    <section
      data-component={ASSISTANT_MESSAGE_NAME}
      className={cn('grid-cols-fit-1fr grid-rows-auto grid gap-x-4 gap-y-1 pl-2.5', className)}
    >
      <Avatar.Root size="md" shape="circle" className="row-span-2 mt-2 bg-transparent">
        <Avatar.Fallback className="bg-transparent p-0">
          <JukeIcon className="h-full w-full" />
        </Avatar.Fallback>
      </Avatar.Root>
      <h6 className="cursor-default text-sm font-semibold">{t('text.assistant.name')}</h6>
      <article>{children}</article>
    </section>
  );
}

AssistantMessage.displayName = ASSISTANT_MESSAGE_NAME;
