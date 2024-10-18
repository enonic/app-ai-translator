type Props = {
    className?: string;
};

export const HeroIconClose = (props: Props): JSX.Element => {
    return (
        <svg
            className='size-6'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            aria-hidden='true'
            strokeWidth='2'
            {...props}
        >
            <path strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
        </svg>
    );
};
