import React, { useState, useMemo } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  X,
  Scale,
  DollarSign,
  TrendingUp,
  UserCheck,
  CheckCircle2,
  Calculator,
} from 'lucide-react';

export default function HarvestSaleModal({ initialPond, onClose }) {
  const { ponds, recordSale } = useFarm();

  const cycles = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('aquaflow_fish_cycles') || '[]');
    } catch {
      return [];
    }
  }, []);
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [fishCount, setFishCount] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerContact, setBuyerContact] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [harvestCost, setHarvestCost] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Paid');

  const selectedCycle = cycles.find((cycle) => cycle.id === selectedCycleId);
  const selectedPond = ponds[0];

  const grossRevenue = useMemo(() => {
    return (Number(weightKg) || 0) * (Number(pricePerKg) || 0);
  }, [weightKg, pricePerKg]);

  const netProfit = useMemo(() => {
    return grossRevenue - (Number(harvestCost) || 0);
  }, [grossRevenue, harvestCost]);

  const avgWeightCalculated = useMemo(() => {
    const w = Number(weightKg) || 0;
    const c = Number(fishCount) || 0;
    return c > 0 ? Math.round((w * 1000) / c) : 0;
  }, [weightKg, fishCount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    recordSale({
      pondId: selectedPond?.id || '',
      pondName: selectedCycle?.id || 'Fish Cycle',
      species: selectedCycle?.fishName || 'Market Fish',
      batchNumber: selectedCycle?.id || `HARV-${Date.now().toString().slice(-4)}`,
      weightKg: Number(weightKg),
      fishCount: Number(fishCount),
      buyerName,
      buyerContact,
      pricePerKg: Number(pricePerKg),
      grossRevenue,
      harvestCost: Number(harvestCost),
      netProfit,
      paymentStatus,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', padding: '26px' }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(8, 126, 164, 0.16)',
            paddingBottom: '14px',
            marginBottom: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #16A085 0%, #063B5C 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <Scale size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', color: '#063B5C' }}>
                Record Harvest & Market Sale
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#547185' }}>
                Batch grading, pricing per kg & biomass deduction
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-icon"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} color="#063B5C" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Fish Cycle */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">
                Cycle <span className="required-star">*</span>
              </label>
              {selectedCycle && (
                <span className="badge badge-aqua" style={{ fontSize: '0.74rem' }}>
                  Fish: {selectedCycle.fishName || 'Not specified'}
                </span>
              )}
            </div>
            <select
              className="form-select"
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
              required
            >
              {cycles
                .map((p) => ({
                  ...p,
                  name: p.id,
                  species: p.fishName || 'Fish not specified',
                  estimatedBiomassKg: 0,
                }))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.species} ({p.estimatedBiomassKg.toLocaleString()} kg available)
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Fish Name / Species</label>
            <input
              className="form-input"
              value={selectedCycle?.fishName || ''}
              readOnly
              placeholder="Select a cycle"
            />
          </div>

          {/* Weight & Count */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">
                Harvest Weight (kg) <span className="required-star">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="1"
                inputMode="decimal"
                className="form-input"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Estimated Fish Count <span className="required-star">*</span>
              </label>
              <input
                type="number"
                min="1"
                inputMode="numeric"
                className="form-input"
                value={fishCount}
                onChange={(e) => setFishCount(e.target.value)}
                required
              />
              <div className="form-hint">
                Calculated average weight: ~<strong>{avgWeightCalculated} grams</strong>
              </div>
            </div>
          </div>

          {/* Price per kg */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
            <div className="form-group" style={{ display: 'none' }}>
              <input className="form-input" value="" readOnly />
              <select
                className="form-select"
                style={{ display: 'none' }}
                value=""
                onChange={() => {}}
              >
                <option value="Grade A (>500g)">Grade A (&gt;500g Prime Select)</option>
                <option value="Grade B (350-500g)">Grade B (350–500g Standard)</option>
                <option value="Grade C (<350g)">Grade C (&lt;350g Medium)</option>
                <option value="Live Restaurant Spec">Live Restaurant Spec (Oxygenated)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Selling Price (₹ / kg) <span className="required-star">*</span>
              </label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                inputMode="decimal"
                className="form-input"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Buyer & Harvesting Logistics Cost */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">
                Buyer / Distributor <span className="required-star">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Buyer Mobile</label>
              <input
                type="tel"
                className="form-input"
                value={buyerContact}
                onChange={(e) => setBuyerContact(e.target.value)}
                placeholder="e.g. +91 98765 43210"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Harvest & Netting Cost (₹)</label>
              <input
                type="number"
                step="any"
                min="0"
                className="form-input"
                value={harvestCost}
                onChange={(e) => setHarvestCost(e.target.value)}
              />
            </div>
          </div>

          {/* Financial Calculation Glass Summary */}
          <div
            style={{
              background: 'linear-gradient(145deg, #F0F9FB 0%, #E6F7FA 100%)',
              border: '1.5px solid rgba(8, 126, 164, 0.25)',
              borderRadius: '16px',
              padding: '14px 18px',
              margin: '12px 0 16px 0',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '8px',
                color: '#063B5C',
                fontWeight: 700,
                fontSize: '0.86rem',
              }}
            >
              <Calculator size={15} color="#087EA4" />
              <span>Revenue & Margin Breakdown</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.74rem', color: '#547185' }}>Gross Revenue</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#063B5C' }}>
                  ₹{grossRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#547185' }}>Harvest Expense</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#E05260' }}>
                  -₹{Number(harvestCost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div
                style={{
                  background: 'rgba(22, 160, 133, 0.15)',
                  borderRadius: '10px',
                  padding: '6px',
                }}
              >
                <div style={{ fontSize: '0.74rem', color: '#0E7460', fontWeight: 700 }}>
                  Estimated Net Profit
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#16A085' }}>
                  ₹{netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '18px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(8, 126, 164, 0.15)',
            }}
          >
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} />
              <span>Record Sale & Deduct Biomass</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
