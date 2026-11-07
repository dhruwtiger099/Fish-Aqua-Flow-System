import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export default function PremiumSelect({ value = '', onChange, options = [], placeholder = 'Select option', className = '', disabled = false, required = false }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = options.find((option) => String(option.value) === String(value));

  useEffect(() => {
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const choose = (option) => {
    if (option.disabled) return;
    onChange?.({ target: { value: option.value } });
    setOpen(false);
  };

  return (
    <div className={`premium-select-wrap ${className}`} ref={rootRef}>
      <button
        type="button"
        className="premium-select-trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-required={required}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={!selected ? 'is-placeholder' : ''}>{selected?.label || placeholder}</span>
        <ChevronDown size={17} aria-hidden="true" />
      </button>
      {open && !disabled && (
        <div className="premium-select-menu" role="listbox">
          {options.map((option) => (
            <button
              type="button"
              role="option"
              aria-selected={String(option.value) === String(value)}
              className={String(option.value) === String(value) ? 'is-selected' : ''}
              disabled={option.disabled}
              key={`${option.value}-${option.label}`}
              onClick={() => choose(option)}
            >
              <span>{option.label}</span>
              {String(option.value) === String(value) && <Check size={15} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
