import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  DollarSign,
  Scale,
  Plus,
  Search,
  TrendingUp,
  UserCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import DataLimitControl from '../components/DataLimitControl';

export default function SalesView({ onOpenHarvest }) {
  const { sales, ponds, limitData } = useFarm();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSales = sales.filter(
    (s) =>
      s.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const visibleSales = limitData(filteredSales);

  const totalGrossRevenue = sales.reduce((sum, s) => sum + (Number(s.grossRevenue) || 0), 0);
  const totalNetProfit = sales.reduce((sum, s) => sum + (Number(s.netProfit) || 0), 0);
  const totalWeightHarvested = sales.reduce((sum, s) => sum + (Number(s.weightKg) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
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
            Harvesting, Grading & Market Sales
          </h1>
          <p style={{ color: '#547185', fontSize: '0.84rem' }}>
            Harvest records, market sales, distributor invoices & profit margins
          </p>
        </div>

        <div className="mobile-btn-group">
          <button onClick={onOpenHarvest} className="btn btn-primary" style={{ width: '100%' }}>
            <Plus size={15} />
            <span>Record Harvest / Sale</span>
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
          <div style={{ fontSize: '0.78rem', color: '#547185', fontWeight: 600 }}>
            Total Gross Sales
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#063B5C', marginTop: '3px' }}>
            ₹
            {totalGrossRevenue.toLocaleString('en-IN', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#16A085', marginTop: '2px' }}>
            Gross receipts
          </div>
        </div>

        <div className="glass-surface" style={{ padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: '#547185', fontWeight: 600 }}>
            Net Profit Realized
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#16A085', marginTop: '3px' }}>
            ₹
            {totalNetProfit.toLocaleString('en-IN', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#087EA4', marginTop: '2px' }}>
            After harvest costs
          </div>
        </div>

        <div className="glass-surface" style={{ padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: '#547185', fontWeight: 600 }}>
            Total Harvested
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#087EA4', marginTop: '3px' }}>
            {totalWeightHarvested.toLocaleString()} <span style={{ fontSize: '0.85rem' }}>kg</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#547185', marginTop: '2px' }}>
            Avg ₹{(totalGrossRevenue / (totalWeightHarvested || 1)).toFixed(2)}/kg
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div
        className="glass-surface"
        style={{
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Search size={16} color="#087EA4" />
        <input
          type="text"
          className="form-input"
          style={{ minHeight: '38px', padding: '6px 10px', fontSize: '0.88rem' }}
          placeholder="Search by buyer, species, sale ID or grade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Mobile Record Cards */}
      <div className="mobile-cards-container lg-hidden">
        {visibleSales.map((sale) => (
          <div key={sale.id} className="mobile-record-card">
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
              <div>
                <div style={{ fontWeight: 700, color: '#063B5C', fontSize: '0.94rem' }}>
                  {sale.buyerName}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#547185' }}>
                  {sale.id} • {sale.date}
                </div>
              </div>
              <span
                className={`badge ${
                  sale.paymentStatus === 'Paid' ? 'badge-active' : 'badge-warning'
                }`}
                style={{ fontSize: '0.7rem' }}
              >
                {sale.paymentStatus}
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
                <div style={{ fontSize: '0.72rem', color: '#547185' }}>Harvest Weight</div>
                <div style={{ fontWeight: 800, color: '#063B5C', fontSize: '1rem' }}>
                  {sale.weightKg.toLocaleString()} kg
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: '#547185' }}>Net Profit</div>
                <div style={{ fontWeight: 800, color: '#16A085', fontSize: '1.05rem' }}>
                  ₹{sale.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#547185', marginTop: '2px' }}>
              Species: <strong>{sale.species}</strong> • Rate: ₹{sale.pricePerKg}/kg
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="table-container desktop-table-view">
        <table className="fms-table">
          <thead>
            <tr>
              <th>Sale ID & Date</th>
              <th>Pond Origin</th>
              <th>Species</th>
              <th>Harvest Weight</th>
              <th>Fish Count</th>
              <th>Price / kg</th>
              <th>Gross Revenue</th>
              <th>Net Profit</th>
              <th>Buyer / Wholesaler</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {visibleSales.map((sale) => (
              <tr key={sale.id}>
                <td>
                  <div style={{ fontWeight: 700, color: '#063B5C' }}>{sale.id}</div>
                  <div style={{ fontSize: '0.75rem', color: '#547185' }}>{sale.date}</div>
                </td>
                <td>
                  <span className="badge badge-ocean" style={{ fontSize: '0.74rem' }}>
                    {sale.pondName || 'Pond'}
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: '#063B5C' }}>{sale.species}</div>
                </td>
                <td>
                  <span style={{ fontWeight: 800, color: '#063B5C' }}>
                    {sale.weightKg.toLocaleString()} kg
                  </span>
                </td>
                <td style={{ color: '#547185' }}>
                  {sale.fishCount ? `${sale.fishCount.toLocaleString()} fish` : '—'}
                </td>
                <td style={{ fontWeight: 600, color: '#087EA4' }}>₹{sale.pricePerKg.toFixed(2)}</td>
                <td>
                  <span style={{ fontWeight: 800, color: '#063B5C', fontSize: '1rem' }}>
                    ₹{sale.grossRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 800, color: '#16A085', fontSize: '1rem' }}>
                    ₹{sale.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: '#063B5C' }}>{sale.buyerName}</div>
                </td>
                <td>
                  <span
                    className={`badge ${
                      sale.paymentStatus === 'Paid' ? 'badge-active' : 'badge-warning'
                    }`}
                  >
                    {sale.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="data-card-heading data-card-heading-table data-card-heading-bottom">
        <span>Sales records</span>
        <DataLimitControl total={filteredSales.length} />
      </div>
    </div>
  );
}
