import type { Meta, StoryObj } from '@storybook/preact-vite';
import { useEffect } from 'react';

import { setLanguage } from '@/store/content';
import { addFailed, addSucceeded, resetItems, setGlobalFailure, setPaths } from '@/store/items';
import CompletedView from '@/components/dialog/view/CompletedView/CompletedView';

type Seed = {
  paths?: string[];
  succeeded?: string[];
  failed?: { path: string; reason: string }[];
  globalFailure?: string;
};

const useSeeded = ({ paths = [], succeeded = [], failed = [], globalFailure }: Seed): void => {
  useEffect(() => {
    setLanguage({ tag: 'no', name: 'Norwegian (Norway, Nynorsk)' });
    setPaths(paths);
    succeeded.forEach((path) => addSucceeded(path));
    failed.forEach(({ path, reason }) => addFailed(path, reason));
    if (globalFailure != null) setGlobalFailure(globalFailure);
    return () => resetItems();
    // eslint-disable-next-line react/exhaustive-deps
  }, []);
};

const meta = {
  title: 'Translator/Dialog/Views/CompletedView',
  component: CompletedView,
  decorators: [
    (Story): React.ReactNode => (
      <div className="flex max-w-150 justify-center">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CompletedView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Success: Story = {
  name: 'States / Success',
  render: function Success() {
    useSeeded({ paths: ['/a', '/b'], succeeded: ['/a', '/b'] });
    return <CompletedView />;
  },
};

export const SomeFailed: Story = {
  name: 'States / Some Failed',
  render: function SomeFailed() {
    useSeeded({
      paths: ['/a', '/b', '/c'],
      succeeded: ['/a'],
      failed: [
        { path: '/b', reason: 'Translation failed' },
        { path: '/c', reason: 'Translation failed' },
      ],
    });
    return <CompletedView />;
  },
};

export const AllFailed: Story = {
  name: 'States / All Failed',
  render: function AllFailed() {
    useSeeded({ paths: ['/a', '/b'], globalFailure: 'Service unavailable' });
    return <CompletedView />;
  },
};
