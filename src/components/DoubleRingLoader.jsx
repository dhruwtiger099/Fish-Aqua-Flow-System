import React from 'react';

export default function DoubleRingLoader({ size = 18 }) {
  return (
    <span
      className="double-ring-loader"
      style={{ width: size, height: size }}
      aria-label="Loading"
    />
  );
}
