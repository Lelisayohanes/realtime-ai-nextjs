import React from 'react';
import { Icon } from 'react-feather';

interface ButtonProps {
  label: string;
  icon?: Icon;
  iconPosition?: 'start' | 'end';
  buttonStyle?: 'regular' | 'alert' | 'action' | 'flush';
  disabled?: boolean;
  onClick?: () => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  icon: Icon,
  iconPosition = 'start',
  buttonStyle = 'regular',
  disabled = false,
  onClick,
  onMouseDown,
  onMouseUp
}) => {
  return (
    <button
      className={`
        w-fit
        flex items-center gap-2 px-4 py-2 rounded-full
        transition-all duration-200
        ${buttonStyle === 'regular' && 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'}
        ${buttonStyle === 'alert' && 'bg-red-500 hover:bg-red-600 text-white'}
        ${buttonStyle === 'action' && 'bg-gray-900 hover:bg-gray-900 text-white'}
        ${buttonStyle === 'flush' && 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800'}
        ${disabled && 'opacity-50 cursor-not-allowed'}
      `}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      {Icon && iconPosition === 'start' && <Icon size={16} />}
      {label}
      {Icon && iconPosition === 'end' && <Icon size={16} />}
    </button>
  );
}; 