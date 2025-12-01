import React from 'react';
import { Loader2 } from 'lucide-react';

export const Card = ({ children, className = '', onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
  >
    {children}
  </div>
);

export const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = '',
  disabled = false,
  type = 'button',
  isLoading = false
}: { 
  children: React.ReactNode, 
  variant?: 'primary' | 'secondary' | 'danger' | 'outline', 
  onClick?: () => void, 
  className?: string,
  disabled?: boolean,
  type?: 'button' | 'submit' | 'reset',
  isLoading?: boolean
}) => {
  const baseStyle = "px-5 py-2 rounded-full font-medium text-sm transition-colors flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-[#005cb9] text-white hover:bg-[#004a96] disabled:bg-blue-300",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
  };

  return (
    <button 
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

export const Input = ({ label, required, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string, required?: boolean, error?: string }) => (
  <div className="flex flex-col gap-1 mb-4">
    <label className="text-sm font-medium text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
    <input 
      className={`border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005cb9] focus:border-transparent transition-all disabled:bg-gray-100`}
      {...props}
    />
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);

export const Select = ({ label, required, options, error, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, required?: boolean, options: string[], error?: string }) => (
  <div className="flex flex-col gap-1 mb-4">
    <label className="text-sm font-medium text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
    <select 
      className={`border ${error ? 'border-red-500' : 'border-gray-300'} bg-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005cb9] focus:border-transparent transition-all`}
      {...props}
    >
      <option value="">Select an option</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);

export const TextArea = ({ label, required, error, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string, required?: boolean, error?: string }) => (
  <div className="flex flex-col gap-1 mb-4">
    <label className="text-sm font-medium text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
    <textarea 
      className={`border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005cb9] focus:border-transparent transition-all min-h-[80px]`}
      {...props}
    />
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);
