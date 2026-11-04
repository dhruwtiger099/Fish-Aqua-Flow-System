import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  Fish,
  Activity,
  Wind,
  Droplets,
  Calendar,
  Layers,
  Settings,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function PondsView({ onOpenPondDetail, onOpenFeeding, onOpenHarvest }) {
  const { ponds, updatePond, inventory, purchases, sales } = useFarm();
  const [filterStatus, setFilterStatus] = useState('All');

  const operationLabels = ['Pond A', 'Nursery', 'Pond B'];
  const report = {
    items: inventory.length,
    currentQty: inventory.reduce((sum, item) => sum + (Number(item.stockQty) || 0), 0),
    purchase: purchases.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0),
    expense:
      purchases.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0) +
      sales.reduce((sum, item) => sum + (Number(item.harvestCost) || 0), 0),
    sales: sales.reduce((sum, item) => sum + (Number(item.grossRevenue) || 0), 0),
  };
  const money = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`;

  const filteredPonds = ponds.filter((p) => filterStatus === 'All' || p.status === filterStatus);

  const toggleAerator = (pondId, delta) => {
    const pond = ponds.find((p) => p.id === pondId);
    if (!pond) return;
    const newActive = Math.min(pond.aeratorsTotal, Math.max(0, pond.aeratorsActive + delta));
    updatePond(pondId, {
      aeratorsActive: newActive,
      aerationStatus: `${newActive}/${pond.aeratorsTotal} Aerators Active`,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header & Filter */}
      <div
        className="glass-surface"
        style={{
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.4rem', color: '#063B5C', marginBottom: '2px' }}>
            Pond Operations & Telemetry
          </h1>
          <p style={{ color: '#547185', fontSize: '0.84rem' }}>
            Production cycles, aerator power grids, biomass sampling & water sensors
          </p>
        </div>

        {/* Filter Pills */}
        <div className="mobile-scroll-pills">
          {['All', 'Active', 'Maintenance'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`btn btn-sm ${filterStatus === st ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                borderRadius: '20px',
                padding: '5px 12px',
                fontSize: '0.78rem',
                flexShrink: 0,
              }}
            >
              {st} {st !== 'All' ? `(${ponds.filter((p) => p.status === st).length})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Ponds Detailed Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredPonds.map((pond) => (
          <div
            key={pond.id}
            className="glass-surface"
            style={{
              padding: '16px',
              border: '1.5px solid rgba(8, 126, 164, 0.22)',
            }}
          >
            {/* Top row */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                borderBottom: '1px solid rgba(8, 126, 164, 0.14)',
                paddingBottom: '12px',
                marginBottom: '14px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-aqua" style={{ fontSize: '0.7rem' }}>
                      {pond.code}
                    </span>
                    <h2 style={{ fontSize: '1.15rem', color: '#063B5C' }}>
                      {operationLabels[ponds.indexOf(pond)] || pond.name}
                    </h2>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#547185', marginTop: '2px' }}>
                    Species: <strong style={{ color: '#063B5C' }}>{pond.species}</strong>
                  </div>
                </div>

                <span
                  className={`badge ${
                    pond.status === 'Active'
                      ? 'badge-active'
                      : pond.status === 'Maintenance'
                        ? 'badge-warning'
                        : 'badge-inactive'
                  }`}
                  style={{ fontSize: '0.7rem' }}
                >
                  {pond.status}
                </span>
              </div>

              {/* Action Buttons: 3 equal buttons on mobile */}
              <div
                className="mobile-btn-group"
                style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: '2px' }}
              >
                <button className="btn btn-sm btn-aqua" onClick={() => onOpenFeeding(pond)}>
                  <Droplets size={13} />
                  <span>Feed</span>
                </button>
                <button className="btn btn-sm btn-primary" onClick={() => onOpenHarvest(pond)}>
                  <TrendingUp size={13} />
                  <span>Harvest</span>
                </button>
                <button className="btn btn-sm btn-secondary" onClick={() => onOpenPondDetail(pond)}>
                  <Settings size={13} />
                  <span>Manage</span>
                </button>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '10px',
                marginBottom: '14px',
              }}
            >
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.75)',
                  border: '1px solid rgba(8, 126, 164, 0.15)',
                  borderRadius: '10px',
                  padding: '10px',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#547185', fontWeight: 600 }}>
                  Biomass Est.
                </div>
                <div
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: '#063B5C',
                    marginTop: '2px',
                  }}
                >
                  {pond.estimatedBiomassKg.toLocaleString()} kg
                </div>
                <div style={{ fontSize: '0.68rem', color: '#087EA4', marginTop: '2px' }}>
                  Target: {pond.targetHarvestKg.toLocaleString()} kg
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.75)',
                  border: '1px solid rgba(8, 126, 164, 0.15)',
                  borderRadius: '10px',
                  padding: '10px',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#547185', fontWeight: 600 }}>
                  Stock Count
                </div>
                <div
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: '#063B5C',
                    marginTop: '2px',
                  }}
                >
                  {pond.liveStockCount.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#16A085', marginTop: '2px' }}>
                  {pond.survivalRate}% survival
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.75)',
                  border: '1px solid rgba(8, 126, 164, 0.15)',
                  borderRadius: '10px',
                  padding: '10px',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#547185', fontWeight: 600 }}>
                  Today's Feed
                </div>
                <div
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: '#063B5C',
                    marginTop: '2px',
                  }}
                >
                  {pond.todayFeedKg} kg
                </div>
                <div style={{ fontSize: '0.68rem', color: '#547185', marginTop: '2px' }}>
                  {pond.feedRationsCompleted}/{pond.feedRationsPlanned} rations
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.75)',
                  border: '1px solid rgba(8, 126, 164, 0.15)',
                  borderRadius: '10px',
                  padding: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '0.72rem',
                    color: '#547185',
                    fontWeight: 600,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Aerators</span>
                  <span className="badge badge-aqua" style={{ fontSize: '0.64rem' }}>
                    {pond.aeratorsActive}/{pond.aeratorsTotal}
                  </span>
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}
                >
                  <button
                    className="btn btn-sm btn-secondary"
                    style={{ flex: 1, padding: '3px 6px', minHeight: '28px', fontSize: '0.72rem' }}
                    onClick={() => toggleAerator(pond.id, -1)}
                    disabled={pond.aeratorsActive <= 0}
                  >
                    -
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    style={{ flex: 1, padding: '3px 6px', minHeight: '28px', fontSize: '0.72rem' }}
                    onClick={() => toggleAerator(pond.id, 1)}
                    disabled={pond.aeratorsActive >= pond.aeratorsTotal}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Live Water Parameter Strip */}
            <div
              style={{
                background: 'linear-gradient(90deg, #F0F9FB 0%, #E6F5F8 100%)',
                borderRadius: '10px',
                padding: '8px 12px',
                border: '1px solid rgba(8, 126, 164, 0.16)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                fontSize: '0.78rem',
              }}
            >
              <div>
                <span style={{ color: '#547185' }}>DO: </span>
                <strong style={{ color: pond.waterQuality.do < 5 ? '#E05260' : '#087EA4' }}>
                  {pond.waterQuality.do} mg/L
                </strong>
              </div>
              <div>
                <span style={{ color: '#547185' }}>Temp: </span>
                <strong style={{ color: '#063B5C' }}>{pond.waterQuality.temp}°C</strong>
              </div>
              <div>
                <span style={{ color: '#547185' }}>pH: </span>
                <strong style={{ color: '#063B5C' }}>{pond.waterQuality.ph}</strong>
              </div>
              <div>
                <span style={{ color: '#547185' }}>NH3: </span>
                <strong style={{ color: '#16A085' }}>{pond.waterQuality.ammonia} ppm</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-surface" style={{ padding: '16px' }}>
        <h2 style={{ fontSize: '1.08rem', color: '#063B5C', marginBottom: '12px' }}>
          Inventory & Finance Report
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '9px',
          }}
        >
          {[
            ['Total Items', `${report.items} items`],
            ['Current Qty', report.currentQty.toLocaleString('en-IN')],
            ['Total Purchase', money(report.purchase)],
            ['Total Expense', money(report.expense)],
            ['Total Sales', money(report.sales)],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                padding: '11px',
                borderRadius: '11px',
                background: '#F6FCFD',
                border: '1px solid rgba(8,126,164,.14)',
              }}
            >
              <div style={{ color: '#547185', fontSize: '.72rem', fontWeight: 700 }}>{label}</div>
              <strong
                style={{
                  display: 'block',
                  color: '#063B5C',
                  fontSize: '1.04rem',
                  marginTop: '4px',
                }}
              >
                {value}
              </strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
