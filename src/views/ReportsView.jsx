import React from 'react';
import { useFarm } from '../context/FarmContext';
import {
  BarChart3,
  Download,
  TrendingUp,
  DollarSign,
  Scale,
  Award,
  FileSpreadsheet,
} from 'lucide-react';

export default function ReportsView() {
  const { ponds, sales, purchases, expenses, feedingLogs, addToast } = useFarm();

  const totalSalesRevenue = sales.reduce((sum, s) => sum + (Number(s.grossRevenue) || 0), 0);
  const totalPurchaseSpend = purchases.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
  const totalExpenseSpend = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalInvestment = totalPurchaseSpend + totalExpenseSpend;
  const netFarmProfit = totalSalesRevenue - totalInvestment;

  const totalLiveBiomassKg = ponds.reduce((sum, p) => sum + (p.estimatedBiomassKg || 0), 0);
  const totalTargetBiomassKg = ponds.reduce((sum, p) => sum + (p.targetHarvestKg || 0), 0);
  const totalHarvestWeight = sales.reduce((sum, s) => sum + (s.weightKg || 0), 0);

  const handleExportCSV = () => {
    // Generate simple CSV download for audits
    const headers = 'ID,Date,Entity,Type,Amount,Notes\n';
    const saleRows = sales.map(
      (s) => `${s.id},${s.date},"${s.buyerName}",Sale,₹${s.grossRevenue},"${s.species} ${s.grade}"`
    );
    const purchaseRows = purchases.map(
      (p) => `${p.id},${p.date},"${p.supplier}",Purchase,₹${p.totalAmount},"${p.itemName}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + headers + [...saleRows, ...purchaseRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aquaflow_financial_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Financial and operational report exported as CSV', 'success');
  };

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
            Farm Analytics & Operational Reports
          </h1>
          <p style={{ color: '#547185', fontSize: '0.86rem', marginTop: '2px' }}>
            Biomass trajectories, feed conversion benchmarks & financial profit margins
          </p>
        </div>

        <button onClick={handleExportCSV} className="btn btn-aqua">
          <Download size={16} />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Financial Executive Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '16px',
        }}
      >
        <div className="glass-surface" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#547185' }}>Gross Revenue (Realized)</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#063B5C', marginTop: '4px' }}>
            ₹{totalSalesRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#16A085', marginTop: '4px' }}>
            From {sales.length} market batches
          </div>
        </div>

        <div className="glass-surface" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#547185' }}>Total Investment</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#E05260', marginTop: '4px' }}>
            ₹{totalInvestment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#547185', marginTop: '4px' }}>
            Purchases + pond maintenance expenses
          </div>
        </div>

        <div className="glass-surface" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#547185' }}>Net Farm Operating Margin</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16A085', marginTop: '4px' }}>
            ₹{netFarmProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#087EA4', fontWeight: 600, marginTop: '4px' }}>
            {totalSalesRevenue > 0 ? `${((netFarmProfit / totalSalesRevenue) * 100).toFixed(1)}% Net Margin` : '—'}
          </div>
        </div>

        <div className="glass-surface" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#547185' }}>Standing Inventory Value</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#087EA4', marginTop: '4px' }}>
            ₹{(totalLiveBiomassKg * 3.85).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#547185', marginTop: '4px' }}>
            Unrealized live biomass
          </div>
        </div>
      </div>

      {/* Production Cycle Trajectories */}
      <div className="glass-surface" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#063B5C', marginBottom: '16px' }}>
          Biomass Growth Projections vs Harvest Targets
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {ponds.map((pond) => {
            const percent = pond.targetHarvestKg > 0 ? Math.round((pond.estimatedBiomassKg / pond.targetHarvestKg) * 100) : 0;
            return (
              <div
                key={pond.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.75)',
                  borderRadius: '14px',
                  padding: '16px',
                  border: '1px solid rgba(8, 126, 164, 0.15)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#063B5C', fontSize: '1rem' }}>
                      {pond.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#547185' }}>
                      {pond.species} • Status: {pond.status}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: '#087EA4', fontSize: '1.1rem' }}>
                      {pond.estimatedBiomassKg.toLocaleString()} / {pond.targetHarvestKg.toLocaleString()} kg
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#16A085', fontWeight: 600 }}>
                      {percent}% of Harvest Target
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    width: '100%',
                    height: '10px',
                    borderRadius: '8px',
                    background: 'rgba(8, 126, 164, 0.15)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${percent}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #087EA4 0%, #22D3EE 100%)',
                      borderRadius: '8px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
