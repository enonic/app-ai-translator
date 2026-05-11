import type { Meta, StoryObj } from '@storybook/preact-vite';
import { useEffect } from 'react';

import { setLanguage } from '@/store/content';
import { addSucceeded, resetItems, setPaths } from '@/store/items';

import { ProcessingView } from './ProcessingView';

const useSeeded = (paths: string[] = [], succeeded: string[] = []): void => {
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
    useSeeded(['/a', '/b', '/c', '/d', '/e'], ['/a', '/b']);
    return <ProcessingView />;
  },
};
