import { useEffect } from 'react';

import type { AiFieldPath } from '@shared/ai-protocol';

import { setLanguage } from '@/store/content';
import { addSucceeded, resetItems, setPaths } from '@/store/items';

import type { Meta, StoryObj } from '@storybook/preact-vite';

import { ProcessingView } from './ProcessingView';

const field = (name: string): AiFieldPath => ({ kind: 'data', field: name });

const useSeeded = (paths: AiFieldPath[] = [], succeeded: AiFieldPath[] = []): void => {
  useEffect(() => {
    setLanguage({ tag: 'no', name: 'Norwegian (Norway, Nynorsk)' });
    setPaths(paths);
    succeeded.forEach((path) => addSucceeded(path));
    return () => resetItems();
    // eslint-disable-next-line react/exhaustive-deps
  }, []);
};

const meta = {
  title: 'Translator/Dialog/Views/ProcessingView',
  component: ProcessingView,
  decorators: [
    (Story) => (
      <div className="flex max-w-150 justify-center">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProcessingView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preparing: Story = {
  name: 'States / Preparing',
  render: function Preparing() {
    useSeeded();
    return <ProcessingView />;
  },
};

export const Progress: Story = {
  name: 'States / Progress',
  render: function Progress() {
    useSeeded(
      ['a', 'b', 'c', 'd', 'e'].map(field),
      ['a', 'b'].map(field),
    );
    return <ProcessingView />;
  },
};
