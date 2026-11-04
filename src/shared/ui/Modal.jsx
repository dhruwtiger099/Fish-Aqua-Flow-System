import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, title, children, onClose, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="ui-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className={`ui-modal ui-modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ui-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="ui-modal__header">
          <h2 id="ui-modal-title">{title}</h2>
          <button
            type="button"
            className="ui-icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <div className="ui-modal__body">{children}</div>
      </section>
    </div>
  );
}
