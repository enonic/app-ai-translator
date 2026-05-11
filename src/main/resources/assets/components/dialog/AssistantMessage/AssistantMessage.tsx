import { Avatar, cn } from '@enonic/ui';
import { useTranslation } from 'react-i18next';

import JukeIcon from '@/ui/primitives/JukeIcon';

type Props = {
  className?: string;
  children?: React.ReactNode;
};

export default function AssistantMessage({ className, children }: Props): React.ReactNode {
  const { t } = useTranslation();

  return (
    <section
      className={cn('grid-cols-fit-1fr grid-rows-auto grid gap-x-4 gap-y-1 pl-2.5', className)}
    >
      <Avatar.Root size="md" shape="circle" className="row-span-2 mt-2 bg-transparent">
        <Avatar.Fallback className="bg-transparent p-0">
          <JukeIcon className="h-full w-full" />
        </Avatar.Fallback>
      </Avatar.Root>
      <h6 className="cursor-default text-sm font-semibold">{t('text.assistant.name')}</h6>
      <article className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500 ease-out">
        {children}
      </article>
    </section>
  );
}
