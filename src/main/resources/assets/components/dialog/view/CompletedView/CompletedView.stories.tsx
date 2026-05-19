import { useEffect } from 'react';

import type { AiFieldPath } from '@shared/ai-protocol';

import { setLanguage } from '@/store/content';
import { addFailed, addSucceeded, resetItems, setGlobalFailure, setPaths } from '@/store/items';

import type { Meta, StoryObj } from '@storybook/preact-vite';

import { CompletedView } from './CompletedView';

const field = (name: string): AiFieldPath => ({ kind: 'data', field: name });

type Seed = {
  paths?: AiFieldPath[];
  succeeded?: AiFieldPath[];
  failed?: { path: AiFieldPath; reason: string }[];
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
    (Story) => (
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
    useSeeded({ paths: ['a', 'b'].map(field), succeeded: ['a', 'b'].map(field) });
    return <CompletedView />;
  },
};

export const SomeFailed: Story = {
  name: 'States / Some Failed',
  render: function SomeFailed() {
    useSeeded({
      paths: ['a', 'b', 'c'].map(field),
      succeeded: ['a'].map(field),
      failed: [
        { path: field('b'), reason: 'Translation failed' },
        { path: field('c'), reason: 'Translation failed' },
      ],
    });
    return <CompletedView />;
  },
};

export const AllFailed: Story = {
  name: 'States / All Failed',
  render: function AllFailed() {
    useSeeded({ paths: ['a', 'b'].map(field), globalFailure: 'Service unavailable' });
    return <CompletedView />;
  },
};
