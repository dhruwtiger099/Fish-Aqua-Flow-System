import React, { useEffect, useMemo, useState } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  BarChart3,
  Download,
  TrendingUp,
  TrendingDown,
  WalletCards,
  Fish,
  ShoppingCart,
  ReceiptText,
  CalendarDays,
  CircleDollarSign,
} from 'lucide-react';

const money = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const number = (value) => Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const UNASSIGNED_LABEL = 'Common farm costs (cycle not specified)';

function recordDate(value) {
  if (!value) return null;
  const raw = String(value).trim();
  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const dmy = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (dmy) return new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function financialYear(value) {
  const date = recordDate(value);
  if (!date) return 'Unassigned';
  const year = date.getFullYear();
  const start = date.getMonth() >= 3 ? year : year - 1;
  return `FY ${start}-${String(start + 1).slice(-2)}`;
}

const cycleLabel = (value) => String(value || '').trim() || 'Farm-wide / Unassigned';

function cycleMatches(record, cycle) {
  if (!cycle) return false;
  const haystack = [
    record.batchNumber,
    record.cycle,
    record.itemName,
    record.note,
    record.pond,
    record.supplier,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return [cycle.id, cycle.fishName, cycle.name, `cycle ${cycle.cycleNumber}`]
    .filter(Boolean)
    .map((item) => String(item).toLowerCase())
    .some((item) => haystack.includes(item));
}

function MetricCard({ icon: Icon, label, value, detail, tone = '#063B5C', accent = '#087EA4' }) {
  return (
    <div
      className="glass-surface"
      style={{ padding: 20, position: 'relative', overflow: 'hidden' }}
    >
      <div
        style={{
          position: 'absolute',
          right: -18,
          top: -22,
          width: 92,
          height: 92,
          borderRadius: '50%',
          background: `${accent}12`,
        }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: accent,
          fontSize: '.78rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '.04em',
        }}
      >
        <span
          style={{
            width: 34,
            height: 34,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 11,
            background: `${accent}16`,
          }}
        >
          <Icon size={17} />
        </span>
        {label}
      </div>
      <div style={{ fontSize: '1.65rem', fontWeight: 850, color: tone, marginTop: 14 }}>
        {value}
      </div>
      <div style={{ fontSize: '.75rem', color: '#547185', marginTop: 5 }}>{detail}</div>
    </div>
  );
}

export default function ReportsView() {
  const { sales, purchases, expenses, addToast } = useFarm();
  const [cycles, setCycles] = useState([]);
  const [selectedFY, setSelectedFY] = useState('All FY');
  const [selectedCycle, setSelectedCycle] = useState('All Cycles');

  useEffect(() => {
    const readCycles = () => {
      try {
        setCycles(JSON.parse(localStorage.getItem('aquaflow_fish_cycles') || '[]'));
      } catch {
        setCycles([]);
      }
    };
    readCycles();
    window.addEventListener('aquaflow-cycle-updated', readCycles);
    window.addEventListener('storage', readCycles);
    return () => {
      window.removeEventListener('aquaflow-cycle-updated', readCycles);
      window.removeEventListener('storage', readCycles);
    };
  }, []);

  const fyOptions = useMemo(() => {
    const values = [
      ...sales.map((item) => financialYear(item.date)),
      ...purchases.map((item) => financialYear(item.date)),
      ...expenses.map((item) => financialYear(item.date)),
    ].filter((item) => item !== 'Unassigned');
    return ['All FY', ...Array.from(new Set(values)).sort().reverse()];
  }, [sales, purchases, expenses]);
  const cycleOptions = useMemo(() => {
    const values = [
      ...cycles.map((item) => cycleLabel(item.id || item.name)),
      ...sales.map((item) => cycleLabel(item.batchNumber || item.cycle)),
    ].filter((item) => item !== UNASSIGNED_LABEL);
    return ['All Cycles', ...Array.from(new Set(values)), UNASSIGNED_LABEL];
  }, [cycles, sales]);
  const reportFY = fyOptions.includes(selectedFY) ? selectedFY : 'All FY';
  const reportCycle = cycleOptions.includes(selectedCycle) ? selectedCycle : 'All Cycles';

  const inFY = (item) => reportFY === 'All FY' || financialYear(item.date) === reportFY;
  const belongsToCycle = (item) => {
    if (reportCycle === 'All Cycles') return true;
    const direct = cycleLabel(item.batchNumber || item.cycle);
    const selected = cycles.find((cycle) => cycleLabel(cycle.id || cycle.name) === reportCycle);
    if (reportCycle === UNASSIGNED_LABEL)
      return direct === UNASSIGNED_LABEL && !cycles.some((cycle) => cycleMatches(item, cycle));
    return direct === reportCycle || cycleMatches(item, selected);
  };
  const filteredSales = useMemo(
    () => sales.filter((item) => inFY(item) && belongsToCycle(item)),
    [sales, selectedFY, selectedCycle, cycles],
  );
  const filteredPurchases = useMemo(
    () => purchases.filter((item) => inFY(item) && belongsToCycle(item)),
    [purchases, selectedFY, selectedCycle, cycles],
  );
  const filteredExpenses = useMemo(
    () => expenses.filter((item) => inFY(item) && belongsToCycle(item)),
    [expenses, selectedFY, selectedCycle, cycles],
  );

  const totals = useMemo(() => {
    const revenue = filteredSales.reduce(
      (sum, item) =>
        sum + (Number(item.grossRevenue) || Number(item.weightKg) * Number(item.pricePerKg) || 0),
      0,
    );
    const purchase = filteredPurchases.reduce(
      (sum, item) => sum + (Number(item.totalAmount) || 0),
      0,
    );
    const farmExpense = filteredExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const harvestExpense = filteredSales.reduce(
      (sum, item) => sum + (Number(item.harvestCost) || 0),
      0,
    );
    const investment = purchase + farmExpense + harvestExpense;
    return {
      revenue,
      purchase,
      farmExpense,
      harvestExpense,
      investment,
      profit: revenue - investment,
      harvestWeight: filteredSales.reduce((sum, item) => sum + (Number(item.weightKg) || 0), 0),
      fishCount: filteredSales.reduce((sum, item) => sum + (Number(item.fishCount) || 0), 0),
    };
  }, [filteredSales, filteredPurchases, filteredExpenses]);

  const cycleRows = useMemo(() => {
    const names = new Map();
    cycles.forEach((cycle) => names.set(cycleLabel(cycle.id || cycle.name), cycle));
    filteredSales.forEach((sale) => {
      const label = cycleLabel(sale.batchNumber || sale.cycle);
      if (label !== UNASSIGNED_LABEL) names.set(label, null);
    });
    const rows = Array.from(names.entries()).map(([label, cycle]) => {
      const cycleSales = filteredSales.filter((sale) =>
        cycle ? cycleMatches(sale, cycle) : cycleLabel(sale.batchNumber || sale.cycle) === label,
      );
      const cyclePurchases = filteredPurchases.filter((purchase) =>
        cycle ? cycleMatches(purchase, cycle) : false,
      );
      const cycleExpenses = filteredExpenses.filter((expense) =>
        cycle ? cycleMatches(expense, cycle) : false,
      );
      const revenue = cycleSales.reduce(
        (sum, item) =>
          sum + (Number(item.grossRevenue) || Number(item.weightKg) * Number(item.pricePerKg) || 0),
        0,
      );
      const purchase = cyclePurchases.reduce(
        (sum, item) => sum + (Number(item.totalAmount) || 0),
        0,
      );
      const expense = cycleExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      const harvestExpense = cycleSales.reduce(
        (sum, item) => sum + (Number(item.harvestCost) || 0),
        0,
      );
      const weight = cycleSales.reduce((sum, item) => sum + (Number(item.weightKg) || 0), 0);
      const fish =
        Number(cycle?.nurseryFishCount) ||
        cycleSales.reduce((sum, item) => sum + (Number(item.fishCount) || 0), 0);
      return {
        label,
        fishName: cycle?.fishName || cycleSales[0]?.species || '—',
        revenue,
        purchase,
        expense,
        harvestExpense,
        investment: purchase + expense + harvestExpense,
        profit: revenue - purchase - expense - harvestExpense,
        weight,
        fish,
        hasRecords: cycleSales.length + cyclePurchases.length + cycleExpenses.length > 0,
      };
    });
    const assigned = new Set(
      rows.filter((row) => row.label !== UNASSIGNED_LABEL).map((row) => row.label),
    );
    const matchesAssigned = (record) =>
      assigned.has(cycleLabel(record.batchNumber || record.cycle)) ||
      cycles.some(
        (cycle) => assigned.has(cycleLabel(cycle.id || cycle.name)) && cycleMatches(record, cycle),
      );
    const unassignedSales = filteredSales.filter((item) => !matchesAssigned(item));
    const unassignedPurchases = filteredPurchases.filter((item) => !matchesAssigned(item));
    const unassignedExpenses = filteredExpenses.filter((item) => !matchesAssigned(item));
    if (unassignedSales.length || unassignedPurchases.length || unassignedExpenses.length) {
      const revenue = unassignedSales.reduce(
        (sum, item) =>
          sum + (Number(item.grossRevenue) || Number(item.weightKg) * Number(item.pricePerKg) || 0),
        0,
      );
      const purchase = unassignedPurchases.reduce(
        (sum, item) => sum + (Number(item.totalAmount) || 0),
        0,
      );
      const expense = unassignedExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      const harvestExpense = unassignedSales.reduce(
        (sum, item) => sum + (Number(item.harvestCost) || 0),
        0,
      );
      rows.push({
        label: UNASSIGNED_LABEL,
        fishName: 'Records without a cycle tag',
        revenue,
        purchase,
        expense,
        harvestExpense,
        investment: purchase + expense + harvestExpense,
        profit: revenue - purchase - expense - harvestExpense,
        weight: unassignedSales.reduce((sum, item) => sum + (Number(item.weightKg) || 0), 0),
        fish: unassignedSales.reduce((sum, item) => sum + (Number(item.fishCount) || 0), 0),
        hasRecords: true,
      });
    }
    return rows.filter(
      (row) =>
        (row.hasRecords || row.label !== UNASSIGNED_LABEL) &&
        (reportCycle === 'All Cycles' || row.label === reportCycle),
    );
  }, [cycles, filteredSales, filteredPurchases, filteredExpenses, reportCycle]);

  const handleExportCSV = () => {
    const headers = [
      'Cycle',
      'Fish Name',
      'Revenue',
      'Purchase Total',
      'Farm Expense',
      'Harvest Cost',
      'Investment',
      'Profit / Loss',
      'Harvest Weight (kg)',
      'Fish Count',
    ];
    const rows = cycleRows.map((row) => [
      row.label,
      row.fishName,
      row.revenue,
      row.purchase,
      row.expense,
      row.harvestExpense,
      row.investment,
      row.profit,
      row.weight,
      row.fish,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const link = document.createElement('a');
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    link.download = `aquaflow_cycle_report_${reportFY.replaceAll(' ', '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Cycle-wise financial report exported', 'success');
  };
  const maxCycleInvestment = Math.max(...cycleRows.map((row) => row.investment), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <section
        className="glass-surface"
        style={{
          padding: 24,
          background: 'linear-gradient(135deg, rgba(255,255,255,.96), rgba(233,248,250,.92))',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                color: '#087EA4',
                fontWeight: 800,
                fontSize: '.74rem',
                letterSpacing: '.09em',
                textTransform: 'uppercase',
              }}
            >
              <BarChart3 size={17} /> Management intelligence
            </div>
            <h1 style={{ color: '#063B5C', fontSize: '1.7rem', marginTop: 6 }}>
              Farm Analytics & Operational Reports
            </h1>
            <p style={{ color: '#547185', fontSize: '.86rem', marginTop: 4 }}> </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                border: '1px solid rgba(8,126,164,.18)',
                borderRadius: 12,
                background: '#fff',
                color: '#547185',
                fontSize: '.8rem',
                fontWeight: 700,
              }}
            >
              <CalendarDays size={16} color="#087EA4" />
              <select
                value={selectedFY}
                onChange={(event) => setSelectedFY(event.target.value)}
                style={{
                  border: 0,
                  outline: 0,
                  background: 'transparent',
                  color: '#063B5C',
                  fontWeight: 800,
                }}
                aria-label="Financial year"
              >
                <option>All FY</option>
                {fyOptions
                  .filter((item) => item !== 'All FY')
                  .map((item) => (
                    <option key={item}>{item}</option>
                  ))}
              </select>
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                border: '1px solid rgba(8,126,164,.18)',
                borderRadius: 12,
                background: '#fff',
                color: '#547185',
                fontSize: '.8rem',
                fontWeight: 700,
              }}
            >
              <Fish size={16} color="#087EA4" />
              <select
                value={selectedCycle}
                onChange={(event) => setSelectedCycle(event.target.value)}
                style={{
                  border: 0,
                  outline: 0,
                  background: 'transparent',
                  color: '#063B5C',
                  fontWeight: 800,
                  maxWidth: 230,
                }}
                aria-label="Cycle"
              >
                <option>All Cycles</option>
                {cycleOptions
                  .filter((item) => item !== 'All Cycles')
                  .map((item) => (
                    <option key={item}>{item}</option>
                  ))}
              </select>
            </label>
            <button onClick={handleExportCSV} className="btn btn-aqua">
              <Download size={16} /> Export report
            </button>
          </div>
        </div>
      </section>
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 14,
        }}
      >
        <MetricCard
          icon={CircleDollarSign}
          label="Gross revenue"
          value={money(totals.revenue)}
          detail={`${filteredSales.length} sale records`}
        />
        <MetricCard
          icon={ShoppingCart}
          label="Total purchase"
          value={money(totals.purchase)}
          detail={`${filteredPurchases.length} purchase records`}
          tone="#A15C00"
          accent="#E29A2D"
        />
        <MetricCard
          icon={ReceiptText}
          label="Farm expenses"
          value={money(totals.farmExpense)}
          detail={`${filteredExpenses.length} maintenance records`}
          tone="#B74350"
          accent="#E05260"
        />
        <MetricCard
          icon={WalletCards}
          label="Total investment"
          value={money(totals.investment)}
          detail="Purchases + expenses + harvest cost"
          tone="#063B5C"
          accent="#6A5AE8"
        />
        <MetricCard
          icon={totals.profit >= 0 ? TrendingUp : TrendingDown}
          label={totals.profit >= 0 ? 'Net profit' : 'Net loss'}
          value={money(Math.abs(totals.profit))}
          detail={`${totals.revenue ? ((totals.profit / totals.revenue) * 100).toFixed(1) : '0.0'}% after all expenses`}
          tone={totals.profit >= 0 ? '#138A72' : '#C13C4B'}
          accent={totals.profit >= 0 ? '#16A085' : '#E05260'}
        />
        <MetricCard
          icon={Fish}
          label="Fish harvested"
          value={`${number(totals.fishCount)} fish`}
          detail={`${number(totals.harvestWeight)} kg total weight`}
        />
      </section>
      <section className="glass-surface" style={{ padding: 22 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 14,
            flexWrap: 'wrap',
            marginBottom: 16,
          }}
        >
          <div>
            <h2 style={{ color: '#063B5C', fontSize: '1.2rem' }}>
              Cycle-wise financial performance
            </h2>
            <p style={{ color: '#547185', fontSize: '.78rem', marginTop: 3 }}> </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="badge badge-ocean">{selectedFY}</span>
            <span className="badge badge-ocean">{selectedCycle}</span>
          </div>
        </div>
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table className="fms-table">
            <thead>
              <tr>
                <th>Cycle / fish</th>
                <th>Fish count</th>
                <th>Harvest</th>
                <th>Purchase</th>
                <th>Expense</th>
                <th>Total investment</th>
                <th>Revenue</th>
                <th>Profit / Loss</th>
              </tr>
            </thead>
            <tbody>
              {cycleRows.length ? (
                cycleRows.map((row) => (
                  <tr key={row.label}>
                    <td>
                      <strong style={{ color: '#063B5C' }}>{row.label}</strong>
                      <small style={{ display: 'block', color: '#547185', marginTop: 3 }}>
                        {row.fishName}
                      </small>
                    </td>
                    <td>{number(row.fish)} fish</td>
                    <td>{number(row.weight)} kg</td>
                    <td>{money(row.purchase)}</td>
                    <td>{money(row.expense + row.harvestExpense)}</td>
                    <td style={{ fontWeight: 800, color: '#A15C00' }}>{money(row.investment)}</td>
                    <td style={{ fontWeight: 800, color: '#087EA4' }}>{money(row.revenue)}</td>
                    <td style={{ fontWeight: 850, color: row.profit >= 0 ? '#16A085' : '#E05260' }}>
                      {row.profit >= 0 ? '+' : '-'}
                      {money(Math.abs(row.profit))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: 30, color: '#547185' }}>
                    No records match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}
      >
        <div className="glass-surface" style={{ padding: 22 }}>
          <h2 style={{ color: '#063B5C', fontSize: '1.15rem' }}>Investment mix by cycle</h2>
          <p style={{ color: '#547185', fontSize: '.78rem', margin: '4px 0 18px' }}>
            Where the selected period's money was invested.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            {cycleRows.map((row) => (
              <div key={row.label}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 10,
                    fontSize: '.82rem',
                    fontWeight: 750,
                    color: '#063B5C',
                    marginBottom: 6,
                  }}
                >
                  <span>{row.label}</span>
                  <span>{money(row.investment)}</span>
                </div>
                <div
                  style={{ height: 9, borderRadius: 10, background: '#E7F3F5', overflow: 'hidden' }}
                >
                  <div
                    style={{
                      width: `${Math.max(3, (row.investment / maxCycleInvestment) * 100)}%`,
                      height: '100%',
                      borderRadius: 10,
                      background: 'linear-gradient(90deg,#087EA4,#6A5AE8)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-surface" style={{ padding: 22 }}>
          <h2 style={{ color: '#063B5C', fontSize: '1.15rem' }}>Cost breakdown</h2>
          <p style={{ color: '#547185', fontSize: '.78rem', margin: '4px 0 18px' }}>
            All deductions included in net profit.
          </p>
          {[
            ['Purchase orders', totals.purchase, '#E29A2D'],
            ['Farm maintenance', totals.farmExpense, '#E05260'],
            ['Harvest & netting', totals.harvestExpense, '#6A5AE8'],
          ].map(([label, value, color]) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '13px 0',
                borderBottom: '1px solid rgba(8,126,164,.10)',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#547185',
                  fontSize: '.82rem',
                }}
              >
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: color }} />
                {label}
              </span>
              <strong style={{ color: '#063B5C' }}>{money(value)}</strong>
            </div>
          ))}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: 16,
              fontWeight: 850,
              color: '#063B5C',
            }}
          >
            <span>Total investment</span>
            <span>{money(totals.investment)}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
