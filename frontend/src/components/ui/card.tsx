import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  imageSrc, 
  imageAlt = '' 
}) => (
  <div className={`
    flex 
    bg-[rgb(242,223,206)] 
    border 
    border-gray-200 
    rounded-lg 
    shadow-lg 
    overflow-hidden 
    ${className}
  `}>
    {imageSrc && (
      <div className="w-1/2 flex-shrink-0">
        <img 
          src={imageSrc} 
          alt={imageAlt} 
          className="w-full h-full object-cover"
        />
      </div>
    )}
    <div className={`
      ${imageSrc ? 'w-1/2 pl-4' : 'w-full'}
      flex 
      flex-col
      justify-between
    `}>
      {children}
    </div>
  </div>
);

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`
    p-4 
    border-b 
    border-gray-200 
    ${className}
  `}>
    {children}
  </div>
);

export const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => (
  <h3 className={`
    text-xl 
    font-semibold 
    text-gray-800 
    tracking-tight 
    ${className}
  `}>
    {children}
  </h3>
);

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`
    p-4 
    flex-grow 
    ${className}
  `}>
    {children}
  </div>
);

export const CardFooter: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`
    p-4 
    border-t 
    border-gray-200 
    ${className}
  `}>
    {children}
  </div>
);