import { useState } from 'react';

const GridButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'sm',
  disabled = false,
  className = ''
}) => {
  const sizeClasses = {
    xs: 'px-3 py-1 text-xs min-h-[24px]',
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-base min-h-[40px]',
  };

  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white focus:ring-blue-300',
    success: 'bg-green-500 hover:bg-green-600 active:bg-green-700 text-white focus:ring-green-300',
    danger: 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white focus:ring-red-300',
    warning: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white focus:ring-amber-300',
    secondary: 'bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white focus:ring-gray-300',
    outline: 'bg-transparent hover:bg-blue-50 active:bg-blue-100 text-blue-600 border border-blue-500 hover:border-blue-600 focus:ring-blue-300',
    ghost: 'bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-700 focus:ring-gray-300',
  };

  const buttonClasses = `
    inline-flex items-center justify-center font-semibold
    border-0 rounded-md cursor-pointer transition-all duration-150
    focus:outline-none focus:ring-2 focus:ring-offset-1
    select-none mr-2 active:scale-95 transform
    shadow-sm hover:shadow-md
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${disabled ? 'opacity-50 cursor-not-allowed hover:shadow-sm active:scale-100' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <button
      className={buttonClasses}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default GridButton;
