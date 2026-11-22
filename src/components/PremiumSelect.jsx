import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

/**
 * Themed replacement for the native <select>. The native option list is drawn by the
 * browser/OS and cannot be styled, so every visible dropdown should use this instead.
 *
 * onChange receives a select-like event ({ target: { value } }) so it is a drop-in swap.
 *
 * variant: 'field' (default, full-width form control) | 'toolbar' (inline filter chip)
 *          | 'compact' (small pagination-style control)
 */
export default function PremiumSelect({
  value = '',
  onChange,
  options = [],
  placeholder = 'Select option',
  className = '',
  disabled = false,
  required = false,
  icon = null,
  variant = 'field',
  ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropUp, setDropUp] = useState(false);
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const listId = useId();
  const selectedIndex = options.findIndex((option) => String(option.value) === String(value));
  const selected = options[selectedIndex];

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  // Open upwards when there is not enough room below (e.g. pagination at page bottom).
  useLayoutEffect(() => {
    if (!open || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const menuHeight = Math.min(menuRef.current?.scrollHeight || 260, 260);
    setDropUp(spaceBelow < menuHeight + 12 && rect.top > spaceBelow);
  }, [open]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    menuRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const openMenu = () => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  const choose = (option) => {
    if (!option || option.disabled) return;
    if (String(option.value) !== String(value)) onChange?.({ target: { value: option.value } });
    setOpen(false);
  };

  const move = (step) => {
    if (!options.length) return;
    let next = activeIndex;
    for (let i = 0; i < options.length; i += 1) {
      next = (next + step + options.length) % options.length;
      if (!options[next].disabled) break;
    }
    setActiveIndex(next);
  };

  const handleKeyDown = (event) => {
    if (disabled) return;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        if (!open) openMenu();
        else move(event.key === 'ArrowDown' ? 1 : -1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!open) openMenu();
        else choose(options[activeIndex]);
        break;
      case 'Escape':
        if (open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
        }
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        break;
    }
  };

  const wrapClass = [
    'premium-select-wrap',
    variant !== 'field' ? `premium-select--${variant}` : '',
    dropUp ? 'is-drop-up' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapClass} ref={rootRef}>
      <button
        type="button"
        className="premium-select-trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-required={required}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
      >
        {icon && (
          <span className="premium-select-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className={`premium-select-value ${!selected ? 'is-placeholder' : ''}`}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          size={variant === 'compact' ? 14 : 17}
          className="premium-select-chevron"
          aria-hidden="true"
        />
      </button>
      {open && !disabled && (
        <div className="premium-select-menu" role="listbox" id={listId} ref={menuRef}>
          {options.map((option, index) => {
            const isSelected = String(option.value) === String(value);
            return (
              <button
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={isSelected}
                className={[isSelected ? 'is-selected' : '', index === activeIndex ? 'is-active' : '']
                  .filter(Boolean)
                  .join(' ')}
                disabled={option.disabled}
                key={`${option.value}-${option.label}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(option)}
              >
                <span>{option.label}</span>
                {isSelected && <Check size={15} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
