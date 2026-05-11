import { cn } from '@enonic/ui';

const FRAMED_TEXT_NAME = 'FramedText';

export type FramedTextProps = {
  className?: string;
  children?: React.ReactNode;
};

export function FramedText({ children, className }: FramedTextProps): React.ReactNode {
  return (
    <span data-component={FRAMED_TEXT_NAME} className={cn('font-semibold', className)}>
      {children}
    </span>
  );
}

FramedText.displayName = FRAMED_TEXT_NAME;
