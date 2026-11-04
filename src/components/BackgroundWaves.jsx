import React from 'react';

export default function BackgroundWaves() {
  return (
    <div className="ocean-ambient-bg" aria-hidden="true">
      {/* Soft underwater light rays */}
      <div className="ambient-light-ray" style={{ left: '12%', animationDuration: '14s' }} />
      <div
        className="ambient-light-ray"
        style={{ left: '60%', animationDuration: '18s', animationDelay: '3s' }}
      />

      {/* Floating translucent bubbles with diverse sizes & positions */}
      <div
        className="ambient-bubble"
        style={{
          width: '70px',
          height: '70px',
          top: '25%',
          left: '8%',
          animationDuration: '18s',
          animationDelay: '0s',
        }}
      />
      <div
        className="ambient-bubble"
        style={{
          width: '110px',
          height: '110px',
          top: '65%',
          left: '85%',
          animationDuration: '22s',
          animationDelay: '2s',
        }}
      />
      <div
        className="ambient-bubble"
        style={{
          width: '45px',
          height: '45px',
          top: '40%',
          right: '18%',
          animationDuration: '15s',
          animationDelay: '4s',
        }}
      />
      <div
        className="ambient-bubble"
        style={{
          width: '85px',
          height: '85px',
          top: '80%',
          left: '22%',
          animationDuration: '20s',
          animationDelay: '1s',
        }}
      />
      <div
        className="ambient-bubble"
        style={{
          width: '35px',
          height: '35px',
          top: '15%',
          right: '32%',
          animationDuration: '13s',
          animationDelay: '5s',
        }}
      />

      {/* Subtle sea wave svg silhouette along bottom */}
      <svg
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '140px',
          opacity: 0.22,
          pointerEvents: 'none',
        }}
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="#087EA4"
          fillOpacity="0.4"
          d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,122.7C672,128,768,192,864,202.7C960,213,1056,171,1152,144C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
        <path
          fill="#22D3EE"
          fillOpacity="0.3"
          d="M0,256L48,245.3C96,235,192,213,288,213.3C384,213,480,235,576,218.7C672,203,768,149,864,138.7C960,128,1056,160,1152,176C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>
    </div>
  );
}
