import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { Utensils, Plus, Search, Calendar, Clock, CheckCircle2, Filter } from 'lucide-react';
import DataLimitControl from '../components/DataLimitControl';

export default function FeedingView({ onOpenFeeding }) {
  const { feedingLogs, ponds, limitData } = useFarm();
  const [selectedPondFilter, setSelectedPondFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = feedingLogs.filter((log) => {
    const matchesPond = selectedPondFilter === 'All' || log.pondId === selectedPondFilter;
    const matchesSearch =
      log.feedItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.pondName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPond && matchesSearch;
  });
  const visibleLogs = limitData(filteredLogs);

  const totalFedToday = feedingLogs
    .filter((l) => l.date === new Date().toISOString().split('T')[0])
    .reduce((sum, l) => sum + (Number(l.quantityKg) || 0), 0);
  const totalQuantity = feedingLogs.reduce((sum, l) => sum + (Number(l.quantityKg) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* View Header */}
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
            Feeding Workflows & FCR
          </h1>
          <p style={{ color: '#547185', fontSize: '0.84rem' }}>
            Ration management, feed conversion efficiency & automatic stock reconciliation
          </p>
        </div>

        <div className="mobile-btn-group">
          <button onClick={onOpenFeeding} className="btn btn-aqua" style={{ width: '100%' }}>
            <Plus size={15} />
            <span>Log Feeding Ration</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
        }}
      >
        <div className="glass-surface" style={{ padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: '#547185', fontWeight: 600 }}>Total Qty</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#063B5C', marginTop: '3px' }}>
            {totalQuantity} <span style={{ fontSize: '0.85rem' }}>kg</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#16A085', marginTop: '2px' }}>
            All feeding records
          </div>
        </div>

        <div className="glass-surface" style={{ padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: '#547185', fontWeight: 600 }}>Feeding Qty</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#087EA4', marginTop: '3px' }}>
            {totalFedToday} <span style={{ fontSize: '0.85rem' }}>kg</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#16A085', marginTop: '2px' }}>Today</div>
        </div>

        <div className="glass-surface" style={{ padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: '#547185', fontWeight: 600 }}>Daily Target</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#063B5C', marginTop: '3px' }}>
            325 <span style={{ fontSize: '0.85rem' }}>kg</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#547185', marginTop: '2px' }}>
            ~1.7% biomass
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div
        className="glass-surface"
        style={{
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={16} color="#087EA4" />
          <input
            type="text"
            className="form-input"
            style={{ minHeight: '38px', padding: '6px 10px', fontSize: '0.88rem' }}
            placeholder="Search feed item, technician or pond..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="mobile-scroll-pills">
          {['All', ...ponds.map((p) => p.id)].map((pondId) => {
            const pondName =
              pondId === 'All' ? 'All Ponds' : ponds.find((p) => p.id === pondId)?.code;
            return (
              <button
                key={pondId}
                onClick={() => setSelectedPondFilter(pondId)}
                className={`btn btn-sm ${selectedPondFilter === pondId ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  borderRadius: '20px',
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  flexShrink: 0,
                }}
              >
                {pondName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Record Cards */}
      <div className="mobile-cards-container lg-hidden">
        {visibleLogs.map((log) => (
          <div key={log.id} className="mobile-record-card">
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
              <div>
                <div style={{ fontWeight: 700, color: '#063B5C', fontSize: '0.94rem' }}>
                  {String(log.pondName || '').split('—')[0]}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#547185' }}>
                  {log.rationNumber} • {log.date} ({log.time})
                </div>
              </div>
              <span
                className="badge"
                style={{
                  background: 'rgba(22, 160, 133, 0.1)',
                  color: '#0E7460',
                  border: '1px solid rgba(22, 160, 133, 0.25)',
                  fontSize: '0.7rem',
                }}
              >
                {String(log.feedingResponse || '').split('/')[0]}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(8, 126, 164, 0.06)',
                borderRadius: '10px',
                padding: '8px 12px',
                marginTop: '4px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: '#547185' }}>Formula</div>
                <div style={{ fontWeight: 600, color: '#063B5C', fontSize: '0.86rem' }}>
                  {log.feedItem}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: '#547185' }}>Fed Amount</div>
                <div style={{ fontWeight: 800, color: '#087EA4', fontSize: '1.05rem' }}>
                  {log.quantityKg} kg
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.76rem', color: '#547185', marginTop: '2px' }}>
              Tech: <strong>{log.technician}</strong> • Temp:{' '}
              {log.waterTempC ? `${log.waterTempC}°C` : 'N/A'}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="table-container desktop-table-view">
        <style>{`.feeding-summary-table th:nth-child(3), .feeding-summary-table td:nth-child(3), .feeding-summary-table th:nth-child(6), .feeding-summary-table td:nth-child(6), .feeding-summary-table th:nth-child(7), .feeding-summary-table td:nth-child(7), .feeding-summary-table th:nth-child(8), .feeding-summary-table td:nth-child(8) { display: none; }`}</style>
        <table className="fms-table feeding-summary-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Pond</th>
              <th>Ration Slot</th>
              <th>Feed Formula</th>
              <th>Qty (kg)</th>
              <th>Water Temp</th>
              <th>Response</th>
              <th>Technician</th>
            </tr>
          </thead>
          <tbody>
            {visibleLogs.map((log) => (
              <tr key={log.id}>
                <td>
                  <div style={{ fontWeight: 600, color: '#063B5C' }}>{log.date}</div>
                  <div style={{ fontSize: '0.75rem', color: '#547185' }}>{log.time}</div>
                </td>
                <td>
                  <span className="badge badge-ocean" style={{ fontSize: '0.76rem' }}>
                    {String(log.pondName || '').split('—')[0]}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>{log.rationNumber}</td>
                <td>
                  <div style={{ fontWeight: 600, color: '#063B5C' }}>{log.feedItem}</div>
                </td>
                <td>
                  <span style={{ fontWeight: 800, color: '#087EA4', fontSize: '1rem' }}>
                    {log.quantityKg} kg
                  </span>
                </td>
                <td>{log.waterTempC ? `${log.waterTempC}°C` : '—'}</td>
                <td>
                  <span
                    className="badge"
                    style={{
                      background: 'rgba(22, 160, 133, 0.1)',
                      color: '#0E7460',
                      border: '1px solid rgba(22, 160, 133, 0.25)',
                    }}
                  >
                    {log.feedingResponse}
                  </span>
                </td>
                <td style={{ color: '#547185', fontSize: '0.84rem' }}>{log.technician}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="data-card-heading data-card-heading-table data-card-heading-bottom">
        <span>Feeding records</span>
        <DataLimitControl total={filteredLogs.length} />
      </div>
    </div>
  );
}
