import React from 'react';

export default function Input({ label, error, id, required = false, className = '', ...props }) {
  const inputId =
    id ||
    `input-${String(label || 'field')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <label className="ui-field" htmlFor={inputId}>
      {label && (
        <span className="ui-field__label">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </span>
      )}
      <input
        id={inputId}
        className={`ui-input ${className}`.trim()}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error && (
        <span className="ui-field__error" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
