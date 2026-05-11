import { $instructions, setDialogInstructions } from '@/store/dialog';
import { TextArea } from '@enonic/ui';
import { useStore } from '@nanostores/react';
import { useTranslation } from 'react-i18next';

export default function InstructionsInput(): React.ReactNode {
  const { t } = useTranslation();
  const instructions = useStore($instructions);

  return (
    <TextArea
      label={t('field.instructions.title')}
      placeholder={t('field.instructions.placeholder')}
      value={instructions}
      rows={2}
      autoSize
      onInput={(e) => setDialogInstructions((e.target as HTMLTextAreaElement).value)}
    />
  );
}
