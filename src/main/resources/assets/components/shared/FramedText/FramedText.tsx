import {twMerge} from 'tailwind-merge';

type Props = {
    className?: string;
    children: React.ReactNode;
};

export default function FramedText({children, className}: Props): React.ReactNode {
    return (
        <span
            className={twMerge(
                'inline-flex px-1 py-0 align-baseline rounded border border-slate-300 font-semibold',
                className,
            )}
        >
            {children}
        </span>
    );
}
