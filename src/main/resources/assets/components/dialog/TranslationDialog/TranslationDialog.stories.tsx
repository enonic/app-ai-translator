import { Button } from '@enonic/ui';
import type { Meta, StoryObj } from '@storybook/preact-vite';
import { useEffect } from 'react';

import { setLanguage } from '@/store/content';
import { $dialog, setDialogInstructions, setDialogView, setDialogVisible } from '@/store/dialog';

import { TranslationDialog } from './TranslationDialog';

const COMPLETION_DELAY_MS = 1500;

const useSimulatedDialog = (): void => {
  useEffect(() => {
    setLanguage({ tag: 'no', name: 'Norwegian (Norway, Nynorsk)' });
    setDialogInstructions('');
    setDialogView('preparation');
    setDialogVisible(true);

    let timeoutId: number | undefined;
    let prevView = $dialog.get().view;

    const unsubscribe = $dialog.listen((state) => {
      if (state.view === prevView) return;
      prevView = state.view;
      if (state.view === 'processing') {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => setDialogView('completed'), COMPLETION_DELAY_MS);
      }
    });

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribe();
      setDialogVisible(false);
    };
    // eslint-disable-next-line react/exhaustive-deps
  }, []);
};

const meta = {
  title: 'Translator/Dialog/TranslationDialog',
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Trigger: Story = {
  name: 'Examples / Trigger',
  render: function Trigger() {
    useSimulatedDialog();
    return (
      <div className="flex flex-col gap-2.5">
        <Button
          variant="solid"
          label="Open translation dialog"
          onClick={() => {
            setDialogView('preparation');
            setDialogVisible(true);
          }}
        />
        <TranslationDialog />
      </div>
    );
  },
};
