import React from 'react';
import { useFarm } from '../context/FarmContext';
import {
  Fish,
  Activity,
  Droplets,
  Scale,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Wind,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function PondCard({ pond, index = 0, displayName, onOpenDetail }) {
  const { setSelectedPondModal } = useFarm();

  const handleOpen = () => {
    if (onOpenDetail) {
      onOpenDetail(pond);
    } else {
      setSelectedPondModal(pond);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return (
          <span className="badge badge-active">
            <span className="status-dot active" />
            Active Growth
          </span>
        );
      case 'Maintenance':
        return (
          <span className="badge badge-warning">
            <span className="status-dot warning" />
            Maintenance
          </span>
        );
      case 'Inactive':
        return (
          <span className="badge badge-inactive">
            <span className="status-dot danger" />
            Inactive / Fallow
          </span>
        );
      default:
        return <span className="badge badge-ocean">{status}</span>;
    }
  };

  // Staggered subtle floating motion class
  const floatClass = index === 0 ? 'floating-subtle' : index === 1 ? 'floating-subtle-delay-1' : 'floating-subtle-delay-2';

  // Calculate cycle progress percentage
  const cycleProgress = pond.cycleTotalDays > 0 ? Math.min(100, Math.round((pond.cycleDay / pond.cycleTotalDays) * 100)) : 0;

  return (
    <div
      onClick={handleOpen}
      className="glass-surface glass-surface-hover water-buoyant"
      style={{
        padding: '20px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '330px',
        position: 'relative',
        overflow: 'hidden',
        border: '1.5px solid rgba(255, 255, 255, 0.75)',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(224, 247, 250, 0.68) 100%)',
        transformOrigin: 'center center',
      }}
    >
      {/* Decorative top water shimmer */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: pond.status === 'Active'
            ? 'linear-gradient(90deg, #22D3EE 0%, #087EA4 50%, #16A085 100%)'
            : 'linear-gradient(90deg, #E9A23B 0%, #087EA4 100%)',
        }}
      />

      {/* Card Header: Code, Name & Status Badge */}
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  color: '#063B5C',
                }}
              >
                {displayName || pond.name}
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#547185', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
              <Fish size={14} color="#087EA4" />
              <span>{pond.species}</span>
            </div>
          </div>
          <div>{getStatusBadge(pond.status)}</div>
        </div>

        {/* Cycle Progress Bar */}
        <div
          style={{
            background: 'rgba(8, 126, 164, 0.08)',
            borderRadius: '12px',
            padding: '10px 12px',
            margin: '12px 0 16px 0',
            border: '1px solid rgba(8, 126, 164, 0.12)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
            <span style={{ color: '#063B5C', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={13} color="#087EA4" />
              {pond.cycle}
            </span>
            <span style={{ color: '#087EA4', fontWeight: 700 }}>{cycleProgress}% Elapsed</span>
          </div>

          <div
            style={{
              width: '100%',
              height: '7px',
              borderRadius: '6px',
              background: 'rgba(8, 126, 164, 0.15)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${cycleProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #087EA4 0%, #22D3EE 100%)',
                borderRadius: '6px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Metrics Grid: Biomass, Feed, Stock, Survival */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '16px',
          }}
        >
          {/* Today's Feed */}
          <div
            style={{
              display: 'none',
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '12px',
              padding: '10px 12px',
              border: '1px solid rgba(8, 126, 164, 0.14)',
            }}
          >
            <div style={{ fontSize: '0.74rem', color: '#547185', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Droplets size={13} color="#087EA4" />
              <span>Today's Feed</span>
            </div>
            <div style={{ fontSize: '1.18rem', fontWeight: 800, color: '#063B5C', marginTop: '2px' }}>
              {pond.todayFeedKg > 0 ? `${pond.todayFeedKg} kg` : '0 kg'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#087EA4', fontWeight: 600, marginTop: '2px' }}>
              {pond.feedRationsCompleted} / {pond.feedRationsPlanned} rations fed
            </div>
          </div>

          {/* Aeration / Gear Status */}
          <div
            style={{
              display: 'none',
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '12px',
              padding: '10px 12px',
              border: '1px solid rgba(8, 126, 164, 0.14)',
            }}
          >
            <div style={{ fontSize: '0.74rem', color: '#547185', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Wind size={13} color="#087EA4" />
              <span>Aeration</span>
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#063B5C', marginTop: '2px' }}>
              {pond.aeratorsActive}/{pond.aeratorsTotal} Running
            </div>
            <div style={{ fontSize: '0.72rem', color: pond.aeratorsActive > 0 ? '#16A085' : '#E9A23B', fontWeight: 600, marginTop: '2px' }}>
              {pond.aeratorsActive > 0 ? 'Optimal Flow' : 'Offline'}
            </div>
          </div>
        </div>

        {/* Live Water-Quality Telemetry Pill Strip */}
        <div
          style={{
            display: 'none',
            background: 'linear-gradient(180deg, #F0F9FB 0%, #E8F5F8 100%)',
            borderRadius: '12px',
            padding: '10px 12px',
            border: '1px solid rgba(8, 126, 164, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#547185', textTransform: 'uppercase', fontWeight: 700 }}>DO</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: pond.waterQuality.do < 5 ? '#E05260' : '#087EA4' }}>
              {pond.waterQuality.do} <span style={{ fontSize: '0.65rem' }}>mg/L</span>
            </div>
          </div>

          <div style={{ width: '1px', height: '22px', background: 'rgba(8, 126, 164, 0.15)' }} />

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#547185', textTransform: 'uppercase', fontWeight: 700 }}>Temp</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#063B5C' }}>
              {pond.waterQuality.temp}°C
            </div>
          </div>

          <div style={{ width: '1px', height: '22px', background: 'rgba(8, 126, 164, 0.15)' }} />

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#547185', textTransform: 'uppercase', fontWeight: 700 }}>pH</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#063B5C' }}>
              {pond.waterQuality.ph}
            </div>
          </div>

          <div style={{ width: '1px', height: '22px', background: 'rgba(8, 126, 164, 0.15)' }} />

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#547185', textTransform: 'uppercase', fontWeight: 700 }}>NH3</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#16A085' }}>
              {pond.waterQuality.ammonia} <span style={{ fontSize: '0.65rem' }}>ppm</span>
            </div>
          </div>
        </div>

        {/* Alerts if any */}
        {pond.alerts && pond.alerts.length > 0 && (
          <div
            style={{
              marginTop: '10px',
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'rgba(233, 162, 59, 0.12)',
              border: '1px solid rgba(233, 162, 59, 0.3)',
              fontSize: '0.76rem',
              color: '#8A5005',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <AlertTriangle size={13} color="#E9A23B" />
            <span style={{ fontWeight: 600 }}>{pond.alerts[0].text}</span>
          </div>
        )}
      </div>

      {/* Card Footer: Action button */}
      <div
        style={{
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(8, 126, 164, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '0.78rem', color: '#547185', fontWeight: 500 }}>
          {pond.surfaceAreaM2} m² • {pond.depthMeters}m depth
        </span>
        <button
          className="btn btn-sm btn-outline"
          style={{
            gap: '4px',
            fontSize: '0.8rem',
            padding: '5px 12px',
            borderColor: 'rgba(8, 126, 164, 0.3)',
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleOpen();
          }}
        >
          <span>Pond Controls</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
