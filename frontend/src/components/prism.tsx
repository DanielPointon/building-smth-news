import React from 'react';

interface PrismIconProps {
  size?: number;
  className?: string;
  variant?: 'hollow' | 'filled-up' | 'filled-down';
}

const PrismIcon: React.FC<PrismIconProps> = ({
  size = 16,
  className = '',
  variant = 'hollow',
}) => {
  let path = 'M12 2L22 20H2L12 2';
  let fill = 'transparent';
  let stroke = 'white';
  let strokeWidth = '2';

  if (variant === 'filled-up') {
    path = 'M12 4.5L22.5 19.5H1.5L12 4.5Z';
    fill = 'white';
    stroke = 'none';
    strokeWidth = '0';
  } else if (variant === 'filled-down') {
    path = 'M12 19.5L1.5 4.5H22.5L12 19.5Z';
    fill = 'white';
    stroke = 'none';
    strokeWidth = '0';
  }

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={path}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default PrismIcon;