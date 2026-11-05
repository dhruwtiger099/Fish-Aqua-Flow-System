import React, { useEffect, useMemo, useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { Plus, Receipt, X, WalletCards } from 'lucide-react';
import DataLimitControl from '../components/DataLimitControl';

export default function ExpensesView() {
  const { expenses, addExpense, masterData, limitData } = useFarm();
  const [showForm, setShowForm] = useState(false);

  // Listen for hardware/browser back button modal close event
  useEffect(() => {
    const handleCloseModal = () => setShowForm(false);
    window.addEventListener('close-active-modal', handleCloseModal);
    return () => window.removeEventListener('close-active-modal', handleCloseModal);
  }, []);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: 'Pond Maintenance',
    pond: 'All Farm',
    amount: '',
    note: '',
  });
  const total = useMemo(
    () => expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [expenses],
  );
  const expenseTypes = masterData.expenseType.length
    ? masterData.expenseType
    : [
        'Pond Maintenance',
        'Water Treatment',
        'Supplement / Medicine',
        'Labour',
        'Electricity / Pump',
        'Other',
      ];
  const pondAreas = masterData.pondArea.length
    ? masterData.pondArea
    : ['All Farm', 'Nursery', 'Pond A', 'Pond B'];
  const visibleExpenses = limitData(expenses);
  const submit = (event) => {
    event.preventDefault();
    if (!form.amount) return;
    addExpense(form);
    setShowForm(false);
    setForm({ ...form, amount: '', note: '' });
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <section
        className="glass-surface"
        style={{
          padding: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.45rem', color: '#063B5C' }}>Farm Expenses & Maintenance</h1>
          <p style={{ color: '#547185', fontSize: '.84rem', marginTop: 3 }}> </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={15} /> Add Expense
        </button>
      </section>
      <section className="glass-surface" style={{ padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: '1.05rem', color: '#063B5C' }}>Expense Register</h2>
          <strong style={{ color: '#E05260' }}>₹{total.toLocaleString('en-IN')}</strong>
        </div>
        <div className="table-container">
          <table className="fms-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Pond</th>
                <th>Notes</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {visibleExpenses.length ? (
                visibleExpenses.map((item) => (
                  <tr key={item.id}>
                    <td>{item.date}</td>
                    <td>
                      <Receipt size={14} /> {item.category}
                    </td>
                    <td>{item.pond}</td>
                    <td>{item.note || '—'}</td>
                    <td style={{ fontWeight: 800, color: '#E05260' }}>
                      ₹{Number(item.amount).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#547185' }}>
                    No expense records available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="data-card-heading data-card-heading-table data-card-heading-bottom">
          <DataLimitControl total={expenses.length} />
        </div>
      </section>
      {showForm && (
        <div
          className="modal-overlay"
          onClick={() => setShowForm(false)}
          style={{ background: 'rgba(4,36,58,.72)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: 700,
              width: 'calc(100% - 28px)',
              padding: 30,
              borderRadius: 24,
              background: '#FFFFFF',
              border: '1px solid rgba(8,126,164,.2)',
              boxShadow: '0 24px 70px rgba(4,36,58,.42)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: 4,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                borderRadius: '24px 24px 0 0',
                background: 'linear-gradient(90deg, #22D3EE, #087EA4, #16A085)',
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '1px solid rgba(8,126,164,.15)',
                paddingBottom: 18,
                marginBottom: 22,
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(135deg,#087EA4,#063B5C)',
                    color: '#fff',
                    boxShadow: '0 8px 18px rgba(8,126,164,.22)',
                  }}
                >
                  <WalletCards size={21} />
                </div>
                <div>
                  <div
                    style={{
                      color: '#087EA4',
                      fontSize: '.7rem',
                      fontWeight: 800,
                      letterSpacing: '.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Farm Cost Register
                  </div>
                  <h2 style={{ color: '#063B5C', marginTop: 2, fontSize: '1.45rem' }}>
                    Add Maintenance Expense
                  </h2>
                  <p style={{ color: '#547185', fontSize: '.8rem', marginTop: 3 }}>
                    Record the expense for inclusion in profitability reports.
                  </p>
                </div>
              </div>
              <button
                className="btn-icon"
                onClick={() => setShowForm(false)}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 13,
                  background: '#EEF7F9',
                  color: '#063B5C',
                }}
              >
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={submit}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                columnGap: 18,
                rowGap: 20,
                alignItems: 'stretch',
              }}
            >
              <label
                className="form-label"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  gap: 7,
                  textAlign: 'left',
                }}
              >
                Date
                <input
                  className="form-input"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </label>
              <label
                className="form-label"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  gap: 7,
                  textAlign: 'left',
                }}
              >
                Expense type
                <select
                  className="form-select"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {expenseTypes.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label
                className="form-label"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  gap: 7,
                  textAlign: 'left',
                }}
              >
                Pond / Area
                <select
                  className="form-select"
                  value={form.pond}
                  onChange={(e) => setForm({ ...form, pond: e.target.value })}
                >
                  {pondAreas.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label
                className="form-label"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  gap: 7,
                  textAlign: 'left',
                }}
              >
                Amount (₹)
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </label>
              <label
                className="form-label"
                style={{
                  gridColumn: '1 / -1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  gap: 7,
                  textAlign: 'left',
                }}
              >
                Notes
                <input
                  className="form-input"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="e.g. Lime application, pond repair, medicine purchase"
                />
              </label>
              <div
                className="modal-actions"
                style={{
                  gridColumn: '1 / -1',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 10,
                  borderTop: '1px solid rgba(8,126,164,.15)',
                  paddingTop: 18,
                  marginTop: 4,
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                  style={{ flexShrink: 0, minWidth: '90px', whiteSpace: 'nowrap' }}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit" style={{ minWidth: 0, textAlign: 'center' }}>
                  <Receipt size={15} /> Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
