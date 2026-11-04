import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  Scale,
  Fish,
  Utensils,
  DollarSign,
  TrendingUp,
  Activity,
  Droplets,
  Calendar,
  AlertCircle,
  Plus,
  ArrowUpRight,
} from 'lucide-react';

export default function DashboardView({ onOpenPurchase, onOpenFeeding, onOpenHarvest }) {
  const { ponds, inventory, feedingLogs, currentUser } = useFarm();

  // Calculated aggregates
  const totalBiomassKg = ponds.reduce((sum, p) => sum + (p.estimatedBiomassKg || 0), 0);
  const totalStockCount = ponds.reduce((sum, p) => sum + (p.liveStockCount || 0), 0);
  const totalTodayFeedKg = ponds.reduce((sum, p) => sum + (p.todayFeedKg || 0), 0);
  const projectedRevenue = totalBiomassKg * 3.85;

  const lowStockCount = inventory.filter((i) => i.stockQty <= i.minThreshold).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Compact Modern Aquaculture Header */}
      <div
        className="glass-surface water-buoyant"
        style={{
          padding: '14px 16px',
          background:
            'linear-gradient(135deg, rgba(255, 255, 255, 0.94) 0%, rgba(224, 247, 250, 0.75) 100%)',
          border: '1.5px solid rgba(34, 211, 238, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Droplets size={18} aria-hidden="true" />
              <h1 style={{ fontSize: '1.25rem', color: '#063B5C', lineHeight: 1.15 }}>
                Aquaculture Center
              </h1>
            </div>
            <p
              className="dashboard-context"
              style={{ color: '#547185', fontSize: '0.78rem', marginTop: '2px' }}
            >
              {currentUser.name} • <strong>{currentUser.role}</strong>
            </p>
          </div>
          <span className="badge badge-active" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
            Live Normal
          </span>
        </div>

        {/* Sleek Horizontal Quick Action Strip (3 equal buttons in 1 row) */}
        <div className="mobile-action-bar">
          <button
            onClick={onOpenFeeding}
            className="mobile-action-btn btn-aqua"
            title="Log Feeding Ration"
          >
            <Utensils size={14} />
            <span>Feed</span>
          </button>
          <button
            onClick={onOpenPurchase}
            className="mobile-action-btn btn-primary"
            title="Order Supplies"
          >
            <Plus size={14} />
            <span>Order</span>
          </button>
          <button
            onClick={onOpenHarvest}
            className="mobile-action-btn btn-secondary"
            title="Record Harvest"
          >
            <Scale size={14} />
            <span>Harvest</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards: adapted for mobile */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
        }}
      >
        {/* KPI 1: Biomass */}
        <div
          className="glass-surface water-buoyant"
          style={{
            padding: '14px',
            background:
              'linear-gradient(145deg, rgba(255, 255, 255, 0.92) 0%, rgba(224, 247, 250, 0.6) 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}
          >
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#547185' }}>
              Live Biomass
            </span>
            <Scale size={16} color="#087EA4" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#063B5C', lineHeight: 1.1 }}>
            {totalBiomassKg.toLocaleString()}{' '}
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>kg</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#16A085', fontWeight: 600, marginTop: '4px' }}>
            No production data available
          </div>
        </div>

        {/* KPI 2: Live Stock */}
        <div
          className="glass-surface water-buoyant"
          style={{
            padding: '14px',
            background:
              'linear-gradient(145deg, rgba(255, 255, 255, 0.92) 0%, rgba(224, 247, 250, 0.6) 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}
          >
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#547185' }}>
              Active Stock
            </span>
            <Fish size={16} color="#065778" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#063B5C', lineHeight: 1.1 }}>
            {totalStockCount.toLocaleString()}{' '}
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>fish</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#16A085', fontWeight: 600, marginTop: '4px' }}>
            Add nursery stock to begin
          </div>
        </div>

        {/* KPI 3: Today's Feed */}
        <div
          className="glass-surface water-buoyant"
          style={{
            padding: '14px',
            background:
              'linear-gradient(145deg, rgba(255, 255, 255, 0.92) 0%, rgba(224, 247, 250, 0.6) 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}
          >
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#547185' }}>
              Today's Feed
            </span>
            <Utensils size={16} color="#087EA4" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#063B5C', lineHeight: 1.1 }}>
            {totalTodayFeedKg} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>kg</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#087EA4', fontWeight: 600, marginTop: '4px' }}>
            Harvest target not configured
          </div>
        </div>

        {/* KPI 4: Value */}
        <div
          className="glass-surface water-buoyant"
          style={{
            padding: '14px',
            background:
              'linear-gradient(145deg, rgba(255, 255, 255, 0.92) 0%, rgba(224, 247, 250, 0.6) 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}
          >
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#547185' }}>
              Est. Value
            </span>
            <DollarSign size={16} color="#16A085" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#063B5C', lineHeight: 1.1 }}>
            ₹{Math.round(projectedRevenue).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#547185', marginTop: '4px' }}>
            Selling price not configured
          </div>
        </div>
      </div>

      {/* Middle Row: Water Quality IoT Telemetry Chart & Feeding Log */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Real-time 24h Sensor Trend Widget */}
        <div className="glass-surface" style={{ padding: '16px', display: 'none' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={17} color="#087EA4" />
              <h3 style={{ fontSize: '1rem', color: '#063B5C' }}>24h Dissolved Oxygen (DO)</h3>
            </div>
            <span className="badge badge-active" style={{ fontSize: '0.68rem' }}>
              Live
            </span>
          </div>

          {/* SVG Trend */}
          <div style={{ width: '100%', height: '150px', position: 'relative' }}>
            <svg
              viewBox="0 0 600 180"
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="doGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#087EA4" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              <line
                x1="0"
                y1="40"
                x2="600"
                y2="40"
                stroke="rgba(8, 126, 164, 0.1)"
                strokeDasharray="4 4"
              />
              <line
                x1="0"
                y1="90"
                x2="600"
                y2="90"
                stroke="rgba(8, 126, 164, 0.1)"
                strokeDasharray="4 4"
              />
              <line
                x1="0"
                y1="140"
                x2="600"
                y2="140"
                stroke="rgba(8, 126, 164, 0.1)"
                strokeDasharray="4 4"
              />

              <line
                x1="0"
                y1="110"
                x2="600"
                y2="110"
                stroke="rgba(233, 162, 59, 0.4)"
                strokeDasharray="3 3"
              />
              <text x="510" y="105" fill="#E9A23B" fontSize="10" fontWeight="600">
                Min DO 5.0
              </text>

              <path
                d="M 20 80 Q 110 95, 200 70 T 380 45 T 480 60 T 580 50 L 580 160 L 20 160 Z"
                fill="url(#doGrad2)"
              />
              <path
                d="M 20 80 Q 110 95, 200 70 T 380 45 T 480 60 T 580 50"
                fill="none"
                stroke="#087EA4"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 20 95 Q 110 110, 200 85 T 380 65 T 480 75 T 580 65"
                fill="none"
                stroke="#22D3EE"
                strokeWidth="2.5"
                strokeDasharray="5 3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.74rem',
              color: '#547185',
              marginTop: '6px',
              borderTop: '1px solid rgba(8, 126, 164, 0.12)',
              paddingTop: '6px',
            }}
          >
            <span>Pond 1 (DO 6.2 mg/L)</span>
            <span>Pond 2 (DO 5.8 mg/L)</span>
          </div>
        </div>

        {/* Today's Feeding Log */}
        <div className="glass-surface" style={{ padding: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Utensils size={17} color="#087EA4" />
              <h3 style={{ fontSize: '1rem', color: '#063B5C' }}>Recent Feed Rations</h3>
            </div>
            <button
              onClick={onOpenFeeding}
              className="btn btn-sm btn-outline"
              style={{ padding: '4px 8px' }}
            >
              + Add
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {feedingLogs.slice(0, 3).map((log) => (
              <div
                key={log.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.75)',
                  border: '1px solid rgba(8, 126, 164, 0.14)',
                  borderRadius: '10px',
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#063B5C' }}>
                    {String(log.pondName || '').split('—')[0]} •{' '}
                    {String(log.rationNumber || '').split('(')[0]}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#547185' }}>{log.feedItem}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#087EA4' }}>
                    {log.quantityKg} kg
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#16A085', fontWeight: 600 }}>
                    {log.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low stock alert on mobile */}
      {lowStockCount > 0 && (
        <div
          className="glass-surface"
          style={{
            padding: '12px 14px',
            background:
              'linear-gradient(135deg, rgba(233, 162, 59, 0.12) 0%, rgba(255, 255, 255, 0.95) 100%)',
            border: '1.5px solid rgba(233, 162, 59, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} color="#E9A23B" />
            <div style={{ fontWeight: 700, color: '#8A5005', fontSize: '0.88rem' }}>
              Reorder Warning: {lowStockCount} item low in stock
            </div>
          </div>
          <button
            onClick={onOpenPurchase}
            className="btn btn-sm btn-primary"
            style={{ width: '100%' }}
          >
            Restock Item Now
          </button>
        </div>
      )}
    </div>
  );
}
