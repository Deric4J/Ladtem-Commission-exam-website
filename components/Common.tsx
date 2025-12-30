
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, title, className = "", actions }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
    {(title || actions) && (
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        {title && <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}
        {actions && <div>{actions}</div>}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = "", 
  isLoading, 
  ...props 
}) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200/50',
    secondary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200/50',
    outline: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-red-200/50'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button 
      className={`
        relative flex items-center justify-center gap-2 rounded-lg font-medium transition-all shadow-lg active:scale-95 disabled:opacity-60 disabled:pointer-events-none
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
      ) : children}
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'info' }> = ({ children, variant = 'default' }) => {
  const styles = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    info: 'bg-blue-100 text-blue-700'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${styles[variant]}`}>
      {children}
    </span>
  );
};
