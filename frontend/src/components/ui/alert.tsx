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
  <div className={`bg-gray-800 border border-gray-700 rounded-lg p-4 ${className}`}>
    {children}
  </div>
);

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ children, className = '' }) => (
  <p className={className}>
    {children}
  </p>
);