import type { Meta, StoryObj } from '@storybook/preact-vite';
import { Trans } from 'react-i18next';

import AssistantMessage from '@/components/dialog/AssistantMessage/AssistantMessage';
import FramedText from '@/ui/primitives/FramedText';

const meta = {
  title: 'Translator/Dialog/AssistantMessage',
  component: AssistantMessage,
  decorators: [
    (Story): React.ReactNode => (
      <div className="flex max-w-150 justify-center">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AssistantMessage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Greeting: Story = {
  name: 'Examples / Greeting',
  render: () => (
    <AssistantMessage>
      <p className="text-main text-base">
        <Trans
          i18nKey="text.greeting"
          components={[<FramedText key="language">Norwegian (Norway, Nynorsk)</FramedText>]}
        />
      </p>
    </AssistantMessage>
  ),
};

export const LongMessage: Story = {
  name: 'Features / Long Message',
  render: () => (
    <AssistantMessage>
      <p className="text-main text-base">
        I can take a longer instruction set into account. Tell me about tone, glossary, edge cases,
        formatting, or anything else you want to lock in before I start translating. The longer the
        brief, the more consistent the output.
      </p>
    </AssistantMessage>
  ),
};
