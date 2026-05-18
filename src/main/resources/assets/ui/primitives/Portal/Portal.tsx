import { createPortal } from 'react-dom';

import type { ReactNode } from 'react';

export const Portal = ({ children }: { children?: ReactNode }): ReactNode => {
  return typeof document === 'object' ? createPortal(children, document.body) : null;
};
