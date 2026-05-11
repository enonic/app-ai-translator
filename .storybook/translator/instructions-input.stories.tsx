import type { Meta, StoryObj } from '@storybook/preact-vite';
import { useEffect } from 'react';

import { setDialogInstructions } from '@/store/dialog';
import InstructionsInput from '@/components/dialog/InstructionsInput/InstructionsInput';

const useSeededInstructions = (value: string): void => {
  useEffect(() => {
    setDialogInstructions(value);
    return () => setDialogInstructions('');
    // eslint-disable-next-line react/exhaustive-deps
  }, []);
};

const meta = {
  title: 'Translator/Dialog/InstructionsInput',
  component: InstructionsInput,
  decorators: [
    (Story): React.ReactNode => (
      <div className="w-120">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InstructionsInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  name: 'Examples / Empty',
  render: function Empty() {
    useSeededInstructions('');
    return <InstructionsInput />;
  },
};

export const Filled: Story = {
  name: 'Examples / Filled',
  render: function Filled() {
    useSeededInstructions(
      'Keep brand names in English. Use a casual tone. Translate idioms naturally.',
    );
    return <InstructionsInput />;
  },
};

export const Resize: Story = {
  name: 'Behavior / Resize',
  render: function Resize() {
    useSeededInstructions(
      [
        'Long instructions exercise the auto-growing height.',
        'Add line breaks to see the field expand.',
        '',
        'Line three.',
        'Line four.',
        'Line five.',
      ].join('\n'),
    );
    return <InstructionsInput />;
  },
};
