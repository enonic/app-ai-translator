import {twMerge} from 'tailwind-merge';

import {HeroIconClose, SvgIconSpinner} from '../icons';

const outlineIcons = {
    close: HeroIconClose,
} as const;

const svgIcons = {
    spinner: SvgIconSpinner,
} as const;

type OutlineIconName = keyof typeof outlineIcons;
type SvgIconName = keyof typeof svgIcons;
export type IconName = OutlineIconName | SvgIconName;
export type IconNameOrOptions = IconName;

type Props = {
    className?: string;
    name: IconName;
    title?: string;
};

const isOutlineIcon = (name: IconName): name is OutlineIconName => name in outlineIcons;

function selectIcon(name: IconName): (props: {className?: string; title?: string}) => JSX.Element {
    return isOutlineIcon(name) ? outlineIcons[name] : svgIcons[name];
}

export default function Icon({className, name, title}: Props): JSX.Element {
    const IconElement = selectIcon(name);
    return <IconElement className={twMerge('size-6', className)} title={title} />;
}
