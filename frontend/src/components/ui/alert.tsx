// /frontend/src/components/ui/alert.tsx

import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ children, className = '' }) => (
  <div className={`bg-[rgb(28,32,41)] border-l-2 border-[rgb(13,118,128)] p-4 ${className}`}>
    {children}
  </div>
);

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ children, className = '' }) => (
  <p className={`text-gray-300 ${className}`}>
    {children}
  </p>
);