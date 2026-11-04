import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  Activity,
  Droplets,
  Thermometer,
  Wind,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Sliders,
  ShieldCheck,
} from 'lucide-react';

export default function SensorsView() {
  const { ponds, updatePond, addToast } = useFarm();
  const [selectedPondId, setSelectedPondId] = useState(ponds[0]?.id || 'pond-1');

  const selectedPond = ponds.find((p) => p.id === selectedPondId) || ponds[0];

  const handleSimulateRefresh = () => {
    // Generate slight realistic fluctuation in telemetry
    const deltaDo = (Math.random() * 0.4 - 0.2).toFixed(1);
    const deltaTemp = (Math.random() * 0.4 - 0.2).toFixed(1);

    const newDo = Math.max(
      3.5,
      Math.min(8.5, parseFloat((selectedPond.waterQuality.do + Number(deltaDo)).toFixed(1))),
    );
    const newTemp = Math.max(
      24.0,
      Math.min(32.0, parseFloat((selectedPond.waterQuality.temp + Number(deltaTemp)).toFixed(1))),
    );

    updatePond(selectedPond.id, {
      waterQuality: {
        ...selectedPond.waterQuality,
        do: newDo,
        temp: newTemp,
      },
    });

    addToast(`Live sensors polled: DO ${newDo} mg/L • Temp ${newTemp}°C`, 'info');
  };

  const getDoStatus = (val) => {
    if (val >= 5.5) return { text: 'Optimal', badge: 'badge-active', color: '#16A085' };
    if (val >= 4.5)
      return { text: 'Caution (Boost Aeration)', badge: 'badge-warning', color: '#E9A23B' };
    return { text: 'Critical Oxygen Deficit', badge: 'badge-danger', color: '#E05260' };
  };

  const getPhStatus = (val) => {
    if (val >= 6.8 && val <= 8.2)
      return { text: 'Optimal Balanced', badge: 'badge-active', color: '#16A085' };
    return { text: 'Alkaline / Acidic Stress', badge: 'badge-warning', color: '#E9A23B' };
  };

  const getAmmoniaStatus = (val) => {
    if (val <= 0.05) return { text: 'Safe & Clean', badge: 'badge-active', color: '#16A085' };
    return { text: 'Elevated (Apply Probiotics)', badge: 'badge-warning', color: '#E9A23B' };
  };

  const doStatus = getDoStatus(selectedPond.waterQuality.do);
  const phStatus = getPhStatus(selectedPond.waterQuality.ph);
  const ammoniaStatus = getAmmoniaStatus(selectedPond.waterQuality.ammonia);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header */}
      <div
        className="glass-surface"
        style={{
          padding: '22px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.55rem', color: '#063B5C' }}>
            Water Quality IoT Telemetry & Sensors
          </h1>
          <p style={{ color: '#547185', fontSize: '0.86rem', marginTop: '2px' }}>
            Continuous pond sensor monitoring, threshold alarms, dissolved oxygen & water parameters
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            className="form-select"
            style={{ width: 'auto', minHeight: '40px' }}
            value={selectedPondId}
            onChange={(e) => setSelectedPondId(e.target.value)}
          >
            {ponds.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <button onClick={handleSimulateRefresh} className="btn btn-secondary">
            <RefreshCw size={15} />
            <span>Poll Sensors</span>
          </button>
        </div>
      </div>

      {/* Sensor Gauge Panels */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '18px',
        }}
      >
        {/* DO Gauge */}
        <div
          className="glass-surface"
          style={{
            padding: '22px',
            border: `1.5px solid ${doStatus.color}`,
            background:
              'linear-gradient(145deg, rgba(255, 255, 255, 0.92) 0%, rgba(224, 247, 250, 0.7) 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#547185' }}>
              Dissolved Oxygen (DO)
            </span>
            <span className={`badge ${doStatus.badge}`}>{doStatus.text}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#063B5C', lineHeight: 1 }}>
              {selectedPond.waterQuality.do}
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#087EA4' }}>mg / L</span>
          </div>

          <div
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '6px',
              background: 'rgba(8, 126, 164, 0.15)',
              margin: '14px 0 8px 0',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.min(100, (selectedPond.waterQuality.do / 8) * 100)}%`,
                height: '100%',
                background:
                  'linear-gradient(90deg, #E05260 0%, #E9A23B 40%, #16A085 70%, #22D3EE 100%)',
                borderRadius: '6px',
              }}
            />
          </div>

          <div
            style={{
              fontSize: '0.74rem',
              color: '#547185',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>Critical &lt; 4.0</span>
            <span>Safe Threshold &gt; 5.0</span>
            <span>Max 8.5</span>
          </div>
        </div>

        {/* Temperature */}
        <div
          className="glass-surface"
          style={{
            padding: '22px',
            background:
              'linear-gradient(145deg, rgba(255, 255, 255, 0.92) 0%, rgba(224, 247, 250, 0.7) 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#547185' }}>
              Water Temperature
            </span>
            <span className="badge badge-active">Optimal Growth</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#063B5C', lineHeight: 1 }}>
              {selectedPond.waterQuality.temp}
            </span>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#087EA4' }}>°C</span>
          </div>

          <div
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '6px',
              background: 'rgba(8, 126, 164, 0.15)',
              margin: '14px 0 8px 0',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.min(100, ((selectedPond.waterQuality.temp - 20) / 15) * 100)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #22D3EE 0%, #16A085 60%, #E9A23B 100%)',
                borderRadius: '6px',
              }}
            />
          </div>

          <div
            style={{
              fontSize: '0.74rem',
              color: '#547185',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>Target: 26°C – 29°C</span>
            <span>Diurnal Swing: ±1.8°C</span>
          </div>
        </div>

        {/* pH Level */}
        <div
          className="glass-surface"
          style={{
            padding: '22px',
            background:
              'linear-gradient(145deg, rgba(255, 255, 255, 0.92) 0%, rgba(224, 247, 250, 0.7) 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#547185' }}>
              Acidity / pH Balance
            </span>
            <span className={`badge ${phStatus.badge}`}>{phStatus.text}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#063B5C', lineHeight: 1 }}>
              {selectedPond.waterQuality.ph}
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#087EA4' }}>pH</span>
          </div>

          <div
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '6px',
              background: 'rgba(8, 126, 164, 0.15)',
              margin: '14px 0 8px 0',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.min(100, ((selectedPond.waterQuality.ph - 6) / 4) * 100)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #E9A23B 0%, #16A085 50%, #087EA4 100%)',
                borderRadius: '6px',
              }}
            />
          </div>

          <div
            style={{
              fontSize: '0.74rem',
              color: '#547185',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>Target Range: 7.0 – 8.0</span>
            <span>Alkalinity: 120 mg/L</span>
          </div>
        </div>

        {/* Total Ammonia Nitrogen */}
        <div
          className="glass-surface"
          style={{
            padding: '22px',
            background:
              'linear-gradient(145deg, rgba(255, 255, 255, 0.92) 0%, rgba(224, 247, 250, 0.7) 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#547185' }}>
              Ammonia (NH3)
            </span>
            <span className={`badge ${ammoniaStatus.badge}`}>{ammoniaStatus.text}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#16A085', lineHeight: 1 }}>
              {selectedPond.waterQuality.ammonia}
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#087EA4' }}>ppm</span>
          </div>

          <div
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '6px',
              background: 'rgba(8, 126, 164, 0.15)',
              margin: '14px 0 8px 0',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.min(100, (selectedPond.waterQuality.ammonia / 0.1) * 100)}%`,
                height: '100%',
                background: '#16A085',
                borderRadius: '6px',
              }}
            />
          </div>

          <div
            style={{
              fontSize: '0.74rem',
              color: '#547185',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>Safe &lt; 0.05 ppm</span>
            <span>Toxic Threshold 0.20 ppm</span>
          </div>
        </div>
      </div>

      {/* Aeration Status and Manual Override */}
      <div
        className="glass-surface"
        style={{
          padding: '24px',
          border: '1.5px solid rgba(8, 126, 164, 0.2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wind size={20} color="#087EA4" />
            <h2 style={{ fontSize: '1.25rem', color: '#063B5C' }}>
              Aerator Control & Dissolved Oxygen Injection
            </h2>
          </div>
          <span className="badge badge-aqua">
            {selectedPond.aeratorsActive} of {selectedPond.aeratorsTotal} Online
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
          }}
        >
          {Array.from({ length: selectedPond.aeratorsTotal }, (_, i) => {
            const isRunning = i < selectedPond.aeratorsActive;
            return (
              <div
                key={i}
                style={{
                  background: isRunning ? 'rgba(34, 211, 238, 0.12)' : 'rgba(255, 255, 255, 0.6)',
                  border: isRunning
                    ? '1.5px solid rgba(8, 126, 164, 0.35)'
                    : '1px solid rgba(8, 126, 164, 0.14)',
                  borderRadius: '14px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#063B5C', fontSize: '0.92rem' }}>
                    Motor #{i + 1} ({i % 2 === 0 ? 'Paddlewheel' : 'Jet Aerator'})
                  </div>
                  <div
                    style={{
                      fontSize: '0.74rem',
                      color: isRunning ? '#16A085' : '#7A97AA',
                      fontWeight: 600,
                    }}
                  >
                    {isRunning ? '● Running 1,450 RPM' : '○ Standby'}
                  </div>
                </div>

                <button
                  className={`btn btn-sm ${isRunning ? 'btn-danger' : 'btn-primary'}`}
                  style={{ minHeight: '32px', padding: '4px 10px', fontSize: '0.78rem' }}
                  onClick={() => {
                    const newCount = isRunning
                      ? selectedPond.aeratorsActive - 1
                      : selectedPond.aeratorsActive + 1;
                    updatePond(selectedPond.id, {
                      aeratorsActive: newCount,
                      aerationStatus: `${newCount}/${selectedPond.aeratorsTotal} Aerators Active`,
                    });
                  }}
                >
                  {isRunning ? 'Stop' : 'Start'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
