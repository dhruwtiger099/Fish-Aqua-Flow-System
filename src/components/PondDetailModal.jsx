import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  X,
  Fish,
  Droplets,
  Scale,
  Wind,
  Calendar,
  Save,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Sliders,
} from 'lucide-react';

export default function PondDetailModal({ pond, onClose, onLogFeeding, onRecordHarvest }) {
  const { updatePond } = useFarm();

  const [status, setStatus] = useState(pond.status);
  const [aeratorsActive, setAeratorsActive] = useState(pond.aeratorsActive);
  const [ph, setPh] = useState(pond.waterQuality?.ph || 7.4);
  const [doVal, setDoVal] = useState(pond.waterQuality?.do || 6.2);
  const [temp, setTemp] = useState(pond.waterQuality?.temp || 27.8);
  const [notes, setNotes] = useState(pond.notes || '');

  const handleSave = (e) => {
    e.preventDefault();
    updatePond(pond.id, {
      status,
      aeratorsActive: Number(aeratorsActive),
      aerationStatus: `${aeratorsActive}/${pond.aeratorsTotal} Aerators Active`,
      waterQuality: {
        ...pond.waterQuality,
        ph: Number(ph),
        do: Number(doVal),
        temp: Number(temp),
      },
      notes,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '740px',
          padding: '28px',
          border: '1.5px solid rgba(8, 126, 164, 0.25)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(8, 126, 164, 0.15)',
            paddingBottom: '16px',
            marginBottom: '20px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-aqua" style={{ fontWeight: 800 }}>
                {pond.code}
              </span>
              <h2 style={{ fontSize: '1.45rem', color: '#063B5C' }}>{pond.name}</h2>
            </div>
            <p style={{ color: '#547185', fontSize: '0.88rem', marginTop: '4px' }}>
              {pond.species} • Surface Area: {pond.surfaceAreaM2} m² • Water Volume: {pond.volumeM3}{' '}
              m³
            </p>
          </div>

          <button
            onClick={onClose}
            className="btn-icon"
            style={{
              background: 'rgba(8, 126, 164, 0.08)',
              border: 'none',
              cursor: 'pointer',
              color: '#063B5C',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          {/* Quick Action Shortcuts */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '20px',
              padding: '12px 16px',
              background: 'rgba(8, 126, 164, 0.06)',
              borderRadius: '14px',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#063B5C' }}>
              Quick Workflows:
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-sm btn-aqua"
                onClick={() => {
                  onClose();
                  if (onLogFeeding) onLogFeeding(pond);
                }}
              >
                <Droplets size={14} />
                <span>Log Feeding</span>
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => {
                  onClose();
                  if (onRecordHarvest) onRecordHarvest(pond);
                }}
              >
                <Scale size={14} />
                <span>Record Harvest / Sale</span>
              </button>
            </div>
          </div>

          {/* Form Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            {/* Status */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Operational Status <span className="required-star">*</span>
              </label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Active">Active Growth</option>
                <option value="Maintenance">Maintenance & Servicing</option>
                <option value="Inactive">Inactive / Fallow</option>
              </select>
            </div>

            {/* Aerator Slider */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Active Aerators ({aeratorsActive} / {pond.aeratorsTotal})
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '44px' }}>
                <input
                  type="range"
                  min="0"
                  max={pond.aeratorsTotal}
                  step="1"
                  value={aeratorsActive}
                  onChange={(e) => setAeratorsActive(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#087EA4', cursor: 'pointer' }}
                />
                <span
                  className="badge badge-aqua"
                  style={{ minWidth: '40px', textAlign: 'center', fontSize: '0.85rem' }}
                >
                  {aeratorsActive} on
                </span>
              </div>
            </div>
          </div>

          {/* Operational Notes */}
          <div style={{ display: 'none' }} />
          {/*
          <div
            style={{
              border: '1px solid rgba(8, 126, 164, 0.16)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '20px',
              background: '#FFFFFF',
            }}
          >
            <div
              style={{
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#063B5C',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '12px',
              }}
            >
              <Activity size={16} color="#087EA4" />
              <span>Calibrate Sensor Telemetry</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>DO (mg/L)</label>
                <input
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  className="form-input"
                  value={doVal}
                  onChange={(e) => setDoVal(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  className="form-input"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>pH Level</label>
                <input
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  className="form-input"
                  value={ph}
                  onChange={(e) => setPh(e.target.value)}
                />
              </div>
            </div>
          </div>

          */}
          {/* Operational Notes */}
          <div className="form-group">
            <label className="form-label">Technician & Observation Notes</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Lime application status, sampling weights, equipment maintenance..."
            />
          </div>

          {/* Modal Actions */}
          <div
            className="modal-actions"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(8, 126, 164, 0.15)',
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ flexShrink: 0, minWidth: '90px', whiteSpace: 'nowrap' }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ minWidth: 0, textAlign: 'center' }}>
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
