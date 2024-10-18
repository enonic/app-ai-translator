import {twMerge} from 'tailwind-merge';

import {HeroIconClose} from '../icons';

const outlineIcons = {
    close: HeroIconClose,
} as const;

type OutlineIconName = keyof typeof outlineIcons;
export type IconName = OutlineIconName;
export type IconNameOrOptions = IconName;

type Props = {
    className?: string;
    name: IconName;
    title?: string;
};

function selectIcon(name: IconName): (props: {className?: string; title?: string}) => JSX.Element {
    return outlineIcons[name];
}

export default function Icon({className, name, title}: Props): JSX.Element {
    const IconElement = selectIcon(name);
    return <IconElement className={twMerge('w-6 h-6', className)} title={title} />;
}
