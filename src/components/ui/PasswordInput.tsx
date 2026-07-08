'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function PasswordInput({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          className={`w-full border rounded-lg px-3 py-2 pr-10 bg-bg-elevated text-text-primary placeholder-text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page focus:border-transparent shadow-sm transition ${
            error ? 'border-danger' : 'border-border-dark'
          } ${className}`}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible(current => !current)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
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
