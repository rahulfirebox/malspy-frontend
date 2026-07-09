'use client';

import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

export function Select({
  id: idProp,
  label,
  value,
  onChange,
  options,
  className = '',
  triggerClassName = '',
  disabled = false,
  'aria-label': ariaLabel,
}: SelectProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const selected = options.find(opt => opt.value === value) ?? options[0];

  const updateMenuPosition = useCallback(() => {
    if (!rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setMenuPosition(null);
      return;
    }

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('.select-menu')) {
          setOpen(false);
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const menu =
    open && menuPosition && typeof document !== 'undefined'
      ? createPortal(
          <ul
            role="listbox"
            aria-labelledby={id}
            style={{
              position: 'fixed',
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
            }}
            className="select-menu z-[9999] max-h-60 overflow-auto rounded-lg border border-border bg-bg-card py-1 shadow-lg"
          >
            {options.map(opt => {
              const isSelected = opt.value === value;
              return (
                <li key={opt.value || '__empty__'} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`select-menu-option w-full px-3 py-2 text-left text-sm transition-colors focus:outline-none ${
                      isSelected ? 'is-selected' : ''
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body
        )
      : null;

  return (
    <div className={`relative ${className}`} ref={rootRef}>
      {label ? (
        <label htmlFor={id} className="mb-1 block text-xs font-medium text-text-secondary">
          {label}
        </label>
      ) : null}

      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel ?? label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(prev => !prev)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-bg-elevated px-3 py-2 text-sm text-text-primary transition-colors hover:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page disabled:cursor-not-allowed disabled:opacity-50 ${
          open ? 'border-primary/60' : 'border-border-dark'
        } ${triggerClassName}`}
      >
        <span className="truncate text-left">{selected?.label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-text-secondary transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {menu}
    </div>
  );
}
