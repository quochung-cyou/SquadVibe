import React from 'react';
import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled,
  ...props 
}) => {
  
  const baseStyles = "relative inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 select-none tracking-wide";
  
  const variants = {
    primary: "bg-primary text-primary-foreground shadow hover:bg-primary/90 rounded-md",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md",
    outline: "border border-input bg-background hover:bg-secondary hover:text-secondary-foreground shadow-sm rounded-md",
    ghost: "hover:bg-secondary hover:text-secondary-foreground rounded-md",
    icon: "bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 hover:scale-105 active:scale-95",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-8 text-base",
    icon: "h-14 w-14",
  };

  const activeSize = variant === 'icon' ? sizes.icon : sizes[size];

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${activeSize} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <Spinner className="w-4 h-4 mr-2" />
      ) : null}
      {children}
    </button>
  );
};