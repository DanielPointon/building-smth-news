import React from 'react';
import { COLORS } from '../../constants/color';

interface AlertProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ children, className = '' }) => (
  <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
    {children}
  </div>
);

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ children, className = '' }) => (
  <p className={`text-gray-700 ${className}`}>
    {children}
  </p>
);