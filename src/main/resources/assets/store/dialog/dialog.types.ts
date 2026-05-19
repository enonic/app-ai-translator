export type DialogView = 'preparation' | 'processing' | 'completed';

export type Dialog = {
  visible: boolean;
  instructions?: string;
  view: DialogView;
};
