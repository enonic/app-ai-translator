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

export const SvgIconSpinner = (props: Props): JSX.Element => {
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
