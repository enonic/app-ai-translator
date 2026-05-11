import type { Meta, StoryObj } from '@storybook/preact-vite';
import { useEffect } from 'react';

import { setLanguage } from '@/store/content';
import { setDialogInstructions } from '@/store/dialog';
import PreparationView from '@/components/dialog/view/PreparationView/PreparationView';

const useSeeded = (instructions: string = ''): void => {
  useEffect(() => {
    setLanguage({ tag: 'no', name: 'Norwegian (Norway, Nynorsk)' });
    setDialogInstructions(instructions);
    return () => setDialogInstructions('');
    // eslint-disable-next-line react/exhaustive-deps
  }, []);
};

const meta = {
  title: 'Translator/Dialog/Views/PreparationView',
  component: PreparationView,
  decorators: [
    (Story): React.ReactNode => (
      <div className="flex max-w-150 justify-center">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PreparationView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Examples / Default',
  render: function Default() {
    useSeeded();
    return <PreparationView />;
  },
};

export const WithInstructions: Story = {
  name: 'Examples / With Instructions',
  render: function WithInstructions() {
    useSeeded('Use a friendly, conversational tone. Keep technical terms in English.');
    return <PreparationView />;
  },
};
