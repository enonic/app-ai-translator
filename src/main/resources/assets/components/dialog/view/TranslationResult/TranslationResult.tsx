import { useStore } from '@nanostores/react';
import { Trans } from 'react-i18next';

import { $items } from '@/store/items';

const TRANSLATION_RESULT_NAME = 'TranslationResult';

export function TranslationResult(): React.ReactNode {
  const { failed, globalFailure } = useStore($items);

  return (
    <span data-component={TRANSLATION_RESULT_NAME}>
      {renderResult(globalFailure, failed.length)}
    </span>
  );
}

TranslationResult.displayName = TRANSLATION_RESULT_NAME;

function renderResult(globalFailure: string | undefined, failedCount: number): React.ReactNode {
  if (globalFailure) {
    return (
      <Trans
        i18nKey="text.result.failed.all"
        values={{ reason: globalFailure }}
        components={{ italic: <span className="italic" /> }}
      />
    );
  }

  if (failedCount === 0) {
    return <Trans i18nKey="text.result.completed" />;
  }

  return (
    <Trans
      i18nKey="text.result.failed.some"
      values={{ count: failedCount }}
      components={{ bold: <span className="font-bold" /> }}
    />
  );
}
