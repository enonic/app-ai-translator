type Props = {
    language: string;
};

export default function Language({language}: Props): React.ReactNode {
    return (
        <span className='inline-flex px-1 py-0 align-baseline rounded border border-slate-300 font-semibold'>
            {language}
        </span>
    );
}
