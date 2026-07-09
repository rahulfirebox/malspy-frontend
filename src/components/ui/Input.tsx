import React from 'react';
import { Calendar } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  mono?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  mono = false,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const isDate = props.type === 'date';

  const inputClassName = `w-full border rounded-lg px-3 py-2 bg-bg-elevated text-text-primary placeholder-text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page focus:border-transparent shadow-sm transition ${
    error ? 'border-danger' : 'border-border-dark'
  } ${mono ? 'font-mono' : ''} ${isDate ? 'date-input-white pr-10' : ''} ${className}`;

  const inputElement = (
    <input
      id={inputId}
      className={inputClassName}
      aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined}
      {...props}
    />
  );

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      {isDate ? (
        <div className="relative">
          {inputElement}
          <Calendar
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white"
            aria-hidden="true"
          />
        </div>
      ) : (
        inputElement
      )}
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-danger">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-help`} className="text-sm text-text-secondary">
          {helperText}
        </p>
      )}
    </div>
  );
}
