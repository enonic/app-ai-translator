import type { Meta, StoryObj } from '@storybook/preact-vite';

import { FramedText } from './FramedText';

const meta = {
  title: 'Translator/Primitives/FramedText',
  component: FramedText,
  decorators: [
    (Story) => (
      <div className="flex max-w-150 justify-center">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FramedText>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Examples / Default',
  render: () => <FramedText>Norwegian (Norway, Nynorsk)</FramedText>,
};

export const InLine: Story = {
  name: 'Examples / In Line',
  render: () => (
    <p className="text-main text-base">
      Hey! Want me to translate texts to <FramedText>Norwegian (Norway, Nynorsk)</FramedText> ?
    </p>
  ),
};

export const LongText: Story = {
  name: 'States / Long Text',
  render: () => (
    <FramedText>
      Northern Sámi (Sápmi, Lule-Sámi orthography, mountain dialect, archaic register, traditional)
    </FramedText>
  ),
};
