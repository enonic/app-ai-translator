import { cn } from '@enonic/ui';
import { Globe } from 'lucide-react';

type Props = {
  className?: string;
  children?: React.ReactNode;
};

export default function FramedText({ children, className }: Props): React.ReactNode {
  return (
    <span
      className={cn(
        'inline-flex max-w-xs items-center gap-1 align-middle',
        'bg-surface-neutral-hover rounded-sm px-1 py-px',
        'text-main text-sm font-semibold',
        className,
      )}
    >
      <Globe className="text-subtle size-3.5 shrink-0" strokeWidth={2} />
      <span className="truncate">{children}</span>
    </span>
  );
}
