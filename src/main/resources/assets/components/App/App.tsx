import { TranslationDialog } from '@/components/dialog/TranslationDialog/TranslationDialog';

const APP_NAME = 'App';

export function App(): React.ReactNode {
  return <TranslationDialog className="text-main" />;
}

App.displayName = APP_NAME;
