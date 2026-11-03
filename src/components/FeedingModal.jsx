import React, { useState, useMemo } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  X,
  Utensils,
  Droplets,
  Scale,
  Sparkles,
  Calculator,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import DoubleRingLoader from './DoubleRingLoader';

export default function FeedingModal({ initialPond, onClose }) {
  const { ponds, inventory, logFeeding } = useFarm();

  const [selectedPondId, setSelectedPondId] = useState(initialPond?.id || ponds[0]?.id || 'pond-1');
  const [rationNumber, setRationNumber] = useState('2 of 3 (Noon)');
  const [feedingResponse, setFeedingResponse] = useState('Vigorous / High Activity');
  const [waterTempC, setWaterTempC] = useState(28.2);
  const [notes, setNotes] = useState('');
  const [feedingDate, setFeedingDate] = useState(new Date().toISOString().split('T')[0]);

  // Feed items in inventory (Category === 'Feed')
  const feedItems = useMemo(() => {
    return inventory.filter((i) => i.category === 'Feed');
  }, [inventory]);

  const [selectedFeedItemId, setSelectedFeedItemId] = useState(feedItems[0]?.id || '');
  const pondLabels = ['Nursery', 'Pond A', 'Pond B'];
  const formPonds = ponds.slice(0, 3).map((pond, index) => ({ ...pond, displayName: pondLabels[index] }));
  const [pondFeeds, setPondFeeds] = useState({});
  const [pondQuantities, setPondQuantities] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalEnteredKg = formPonds.reduce((sum, pond) => sum + (Number(pondQuantities[pond.id]) || 0), 0);

  const activePond = useMemo(() => {
    return ponds.find((p) => p.id === selectedPondId);
  }, [ponds, selectedPondId]);

  const selectedFeed = useMemo(() => {
    return inventory.find((i) => i.id === selectedFeedItemId);
  }, [inventory, selectedFeedItemId]);

  // Ration calculator based on biomass and standard feeding rate (e.g. 1.8% BW)
  const recommendedDailyKg = useMemo(() => {
    if (!activePond || activePond.estimatedBiomassKg <= 0) return 0;
    const ratePercent = activePond.species.includes('Tilapia') ? 1.6 : 1.8;
    return Math.round((activePond.estimatedBiomassKg * (ratePercent / 100)));
  }, [activePond]);

  const recommendedRationKg = useMemo(() => {
    return recommendedDailyKg > 0 ? (recommendedDailyKg / 3).toFixed(1) : 0;
  }, [recommendedDailyKg]);

  const [feedQtyKg, setFeedQtyKg] = useState(recommendedRationKg || 50);

  const handleSubmit = (e) => {
    e.preventDefault();
    const entries = formPonds.filter((pond) => pondFeeds[pond.id] && Number(pondQuantities[pond.id]) > 0);
    if (!entries.length) {
      setSubmitError('Feed type select karke quantity enter karein.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError('');
    entries.forEach((pond) => {
      const feedItemId = pondFeeds[pond.id];
      const feed = inventory.find((item) => item.id === feedItemId);
      logFeeding({ pondId: pond.id, pondName: pond.displayName, feedItemId, feedItem: feed?.name || 'Standard Pellets', quantityKg: Number(pondQuantities[pond.id]), date: feedingDate });
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '620px', padding: '26px' }}
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
                background: 'linear-gradient(135deg, #087EA4 0%, #22D3EE 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#063B5C',
              }}
            >
              <Utensils size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', color: '#063B5C' }}>Log Feed Ration</h2>
              <p style={{ fontSize: '0.82rem', color: '#547185' }}>
                Record feeding amount, consumption response & auto-deduct inventory
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn-icon" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="#063B5C" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Pond-wise feed allocation */}
          <div className="form-group">
            <label className="form-label">Pond-wise Feed Allocation <span className="required-star">*</span></label>
            <div style={{ display: 'grid', gap: '12px' }}>
              {formPonds.map((pond) => {
                const chosenFeedId = pondFeeds[pond.id] || '';
                const chosenFeed = inventory.find((item) => item.id === chosenFeedId);
                return (
                  <div key={pond.id} style={{ padding: '14px', borderRadius: '14px', background: 'rgba(8, 126, 164, 0.06)', border: '1px solid rgba(8, 126, 164, 0.16)' }}>
                    <div style={{ fontWeight: 800, color: '#063B5C', marginBottom: '8px' }}>{pond.displayName}</div>
                    <select className="form-select" value={chosenFeedId} onChange={(e) => setPondFeeds((prev) => ({ ...prev, [pond.id]: e.target.value }))}>
                      <option value="">Select Types of Feed</option>
                      {feedItems.map((feed) => <option key={feed.id} value={feed.id}>{feed.name} ({feed.stockQty} kg available)</option>)}
                    </select>
                    {chosenFeed && (
                      <div style={{ marginTop: '10px' }}>
                        <label className="form-label">Quantity (kg) <span className="required-star">*</span></label>
                        <input type="number" min="0.5" step="0.5" inputMode="decimal" className="form-input" value={pondQuantities[pond.id] || ''} placeholder="Enter quantity" onChange={(e) => setPondQuantities((prev) => ({ ...prev, [pond.id]: e.target.value }))} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ margin: '12px 0 16px', padding: '12px 14px', borderRadius: '12px', background: 'linear-gradient(135deg, #E0F7FA, #ECFEFF)', border: '1px solid rgba(8, 126, 164, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#087EA4', fontWeight: 700 }}>Live Feed Total</span>
              <strong style={{ color: '#063B5C', fontSize: '1.15rem' }}>{totalEnteredKg.toFixed(1)} kg</strong>
            </div>
            <div style={{ color: '#547185', fontSize: '0.75rem', marginTop: '4px' }}>
              {formPonds.filter((pond) => Number(pondQuantities[pond.id]) > 0).map((pond) => `${pond.displayName}: ${Number(pondQuantities[pond.id]).toFixed(1)} kg`).join(' • ') || 'Quantity enter karte hi total yahan update hoga'}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Feeding Date <span className="required-star">*</span></label>
            <input type="date" className="form-input" value={feedingDate} onChange={(e) => setFeedingDate(e.target.value)} required />
          </div>

          {/* Feed Type Selection & Available Stock */}
          <div className="form-group" style={{ display: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">
                Feed Stock Type <span className="required-star">*</span>
              </label>
              {selectedFeed && (
                <span className="badge badge-ocean" style={{ fontSize: '0.74rem' }}>
                  Available in store: {selectedFeed.stockQty.toLocaleString()} kg
                </span>
              )}
            </div>
            <select
              className="form-select"
              value={selectedFeedItemId}
              onChange={(e) => setSelectedFeedItemId(e.target.value)}
            >
              {feedItems.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.stockQty} kg remaining in {f.location})
                </option>
              ))}
            </select>
          </div>

          {/* Feed Quantity & Ration Slot */}
          <div style={{ display: 'none', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group" style={{ display: 'none' }}>
              <label className="form-label">
                Feed Amount (kg) <span className="required-star">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                inputMode="decimal"
                className="form-input"
                value={feedQtyKg}
                onChange={(e) => setFeedQtyKg(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ration Slot</label>
              <select
                className="form-select"
                value={rationNumber}
                onChange={(e) => setRationNumber(e.target.value)}
              >
                <option value="1 of 3 (Morning 07:30)">1 of 3 (Morning 07:30)</option>
                <option value="2 of 3 (Noon 12:45)">2 of 3 (Noon 12:45)</option>
                <option value="3 of 3 (Evening 17:30)">3 of 3 (Evening 17:30)</option>
                <option value="Supplemental Ration">Supplemental / Extra Ration</option>
              </select>
            </div>
          </div>

          {/* Water Temp & Response */}
          <div style={{ display: 'none', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Water Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={waterTempC}
                onChange={(e) => setWaterTempC(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Feeding Response / Activity</label>
              <select
                className="form-select"
                value={feedingResponse}
                onChange={(e) => setFeedingResponse(e.target.value)}
              >
                <option value="Vigorous / High Activity">Vigorous / High Activity (Optimal)</option>
                <option value="Normal Active">Normal Active</option>
                <option value="Slow / Moderate">Slow / Moderate</option>
                <option value="Lethargic (Investigate DO)">Lethargic (Investigate DO)</option>
              </select>
            </div>
          </div>

          {/* Observations */}
          <div className="form-group" style={{ display: 'none' }}>
            <label className="form-label">Technician Notes</label>
            <input
              type="text"
              className="form-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Pellets cleared in 15 mins, wind direction..."
            />
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(8, 126, 164, 0.15)',
            }}
          >
            {submitError && <span style={{ color: '#C2410C', fontSize: '0.78rem', marginRight: 'auto' }}>{submitError}</span>}
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <DoubleRingLoader /> : <CheckCircle2 size={16} />}
              <span>{isSubmitting ? 'Saving...' : 'Log Feed & Deduct Inventory'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
