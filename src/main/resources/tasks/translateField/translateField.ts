import type { TranslateFieldPayload } from '../../lib/translate/results';

import { runTranslateField } from '../../lib/translate/translate';

type TranslateFieldTaskConfig = {
  payload: string;
};

export function run(config: TranslateFieldTaskConfig): void {
  const payload = JSON.parse(config.payload) as TranslateFieldPayload;
  runTranslateField(payload);
}
