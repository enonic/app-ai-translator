type Props = {
    className?: string;
};

export const HeroIconClose = (props: Props): React.ReactNode => {
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

export const HeroIconPlus = (props: Props): React.ReactNode => {
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
            <path strokeLinecap='round' strokeLinejoin='round' d='M12 4.5v15m7.5-7.5h-15' />
        </svg>
    );
};

export const HeroIconChevronDown = (props: Props): React.ReactNode => {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth='2'
            stroke='currentColor'
            {...props}
        >
            <path strokeLinecap='round' strokeLinejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' />
        </svg>
    );
};

export const HeroIconChevronRight = (props: Props): React.ReactNode => {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth='2'
            stroke='currentColor'
            {...props}
        >
            <path strokeLinecap='round' strokeLinejoin='round' d='m8.25 4.5 7.5 7.5-7.5 7.5' />
        </svg>
    );
};

export const SvgIconSpinner = (props: Props): React.ReactNode => {
    return (
        // By Sam Herbert (@sherb), for everyone. More @ http://goo.gl/7AJzbL
        <svg
            className='size-6'
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 38 38'
            stroke='currentColor'
            aria-hidden='true'
            {...props}
        >
            <g fill='none' fillRule='evenodd'>
                <g transform='translate(1 1)' strokeWidth='2'>
                    <circle strokeOpacity='.5' cx='18' cy='18' r='18' />
                    <path d='M36 18c0-9.94-8.06-18-18-18'>
                        <animateTransform
                            attributeName='transform'
                            type='rotate'
                            from='0 18 18'
                            to='360 18 18'
                            dur='1s'
                            repeatCount='indefinite'
                        />
                    </path>
                </g>
            </g>
        </svg>
    );
};
