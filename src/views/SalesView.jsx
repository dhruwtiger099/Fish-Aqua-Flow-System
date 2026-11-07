import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  DollarSign,
  Scale,
  Search,
  TrendingUp,
  UserCheck,
  CheckCircle2,
  Calendar,
  CreditCard,
  UploadCloud,
  X,
} from 'lucide-react';
import DataLimitControl from '../components/DataLimitControl';
import PremiumSelect from '../components/PremiumSelect';

export default function SalesView() {
  const { sales, ponds, limitData } = useFarm();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('harvest');
  const [payments, setPayments] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('aquaflow_sale_payments') || '[]');
    } catch {
      return [];
    }
  });
  const [paymentSale, setPaymentSale] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    method: 'Cash',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    reference: '',
    attachment: null,
  });

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

  const openPaymentForm = (sale) => {
    setPaymentSale(sale);
    setPaymentForm({
      method: 'Cash',
      amount: String(sale.grossRevenue || 0),
      date: new Date().toISOString().slice(0, 10),
      reference: '',
      attachment: null,
    });
  };

  const savePayment = async (event) => {
    event.preventDefault();
    if (!paymentSale) return;
    const attachmentDataUrl = paymentForm.attachment
      ? await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => resolve('');
          reader.readAsDataURL(paymentForm.attachment);
        })
      : '';
    const payment = {
      id: `payment-${Date.now()}`,
      saleId: paymentSale.id,
      buyerName: paymentSale.buyerName,
      method: paymentForm.method,
      amount: Number(paymentForm.amount) || 0,
      date: paymentForm.date,
      reference: paymentForm.reference.trim(),
      attachmentName: paymentForm.attachment?.name || '',
      attachmentDataUrl,
      status: 'Recorded',
    };
    const nextPayments = [payment, ...payments];
    setPayments(nextPayments);
    localStorage.setItem('aquaflow_sale_payments', JSON.stringify(nextPayments));
    setPaymentSale(null);
  };

  const openPaymentAttachment = (payment) => {
    if (!payment.attachmentDataUrl) return;
    try {
      const [header, base64] = payment.attachmentDataUrl.split(',');
      const mime = header.match(/data:(.*?);base64/)?.[1] || 'application/octet-stream';
      const binary = atob(base64);
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      const fileUrl = URL.createObjectURL(new Blob([bytes], { type: mime }));
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(fileUrl), 60000);
    } catch {
      window.open(payment.attachmentDataUrl, '_blank', 'noopener,noreferrer');
    }
  };

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

          </p>
        </div>

      </div>

      <div className="sales-tabs" role="tablist" aria-label="Sales sections">
        <button
          className={activeTab === 'harvest' ? 'sales-tab sales-tab--active' : 'sales-tab'}
          onClick={() => setActiveTab('harvest')}
          type="button"
        >
          <Scale size={16} /> Harvest Entries
        </button>
        <button
          className={activeTab === 'payments' ? 'sales-tab sales-tab--active' : 'sales-tab'}
          onClick={() => setActiveTab('payments')}
          type="button"
        >
          <CreditCard size={16} /> Payments
        </button>
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

      {activeTab === 'harvest' && (
        <>
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
                className={`badge ${sale.paymentStatus === 'Paid' ? 'badge-active' : 'badge-warning'
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
            {visibleSales.map((sale) => {
              const salePayment = payments.find((payment) => payment.saleId === sale.id);
              return (
              <tr key={sale.id}>
                <td>
                  <div style={{ fontWeight: 700, color: '#063B5C' }}>{sale.id}</div>
                  <div style={{ fontSize: '0.75rem', color: '#547185' }}>{sale.date}</div>
                </td>
                <td>
                  <span className="badge badge-ocean" style={{ fontSize: '0.74rem' }}>
                    {sale.cycleName || sale.batchNumber || sale.pondName || 'Pond'}
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
                  {salePayment ? (
                    <div className="payment-cell-button payment-cell-button--paid">
                      <CreditCard size={14} />
                      <strong>Completed</strong>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="payment-cell-button"
                      onClick={() => openPaymentForm(sale)}
                    >
                      <CreditCard size={14} /> Add payment
                    </button>
                  )}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="data-card-heading data-card-heading-table data-card-heading-bottom">
        <span>Sales records</span>
        <DataLimitControl total={filteredSales.length} />
      </div>
        </>
      )}

      {activeTab === 'payments' && (
        <div className="table-container payment-records-panel">
          <div className="payment-panel-heading">
            <div>
              <h2>Buyer Payments</h2>
              <p> </p>
            </div>
            <CreditCard size={22} color="#087EA4" />
          </div>
          <table className="fms-table">
            <thead>
              <tr>
                <th>Sale ID</th>
                <th>Cycle</th>
                <th>Buyer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Reference</th>
                <th>Attachment</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => {
                const paymentSale = sales.find((sale) => sale.id === payment.saleId);
                return (
                <tr key={payment.id}>
                  <td><strong>{payment.saleId}</strong></td>
                  <td>{paymentSale?.cycleName || paymentSale?.batchNumber || paymentSale?.pondName || '—'}</td>
                  <td>{payment.buyerName || '—'}</td>
                  <td style={{ fontWeight: 800, color: '#087EA4' }}>₹{payment.amount.toLocaleString('en-IN')}</td>
                  <td><span className="badge badge-ocean">{payment.method}</span></td>
                  <td>{payment.date}</td>
                  <td>{payment.reference || '—'}</td>
                  <td>
                      {payment.attachmentDataUrl ? (
                        <button
                          type="button"
                        className="payment-file-link"
                          onClick={() => openPaymentAttachment(payment)}
                      >
                        {payment.attachmentName?.toLowerCase().endsWith('.pdf') ? 'Open PDF' : 'Open file'}
                        </button>
                    ) : (
                      payment.attachmentName || '—'
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
          {!payments.length && <div className="payment-empty-state">No payments recorded yet.</div>}
        </div>
      )}

      {paymentSale && (
        <div className="modal-overlay" onClick={() => setPaymentSale(null)}>
          <div className="modal-content payment-modal" onClick={(event) => event.stopPropagation()}>
            <div className="payment-modal-header">
              <div>
                <div className="eyebrow">PAYMENT REGISTER</div>
                <h2>Record Buyer Payment</h2>
                <p>{paymentSale.id} · {paymentSale.buyerName || 'Buyer'}</p>
              </div>
              <button type="button" className="btn-icon" onClick={() => setPaymentSale(null)} aria-label="Close payment form">
                <X size={18} />
              </button>
            </div>
            <form className="payment-form" onSubmit={savePayment}>
              <label className="form-label">
                Payment method
                <PremiumSelect
                  value={paymentForm.method}
                  onChange={(event) => setPaymentForm({ ...paymentForm, method: event.target.value })}
                  options={['Cash', 'Cheque', 'UPI', 'NEFT / RTGS', 'Bank Transfer', 'NFT', 'Other'].map((method) => ({ value: method, label: method }))}
                />
              </label>
              <label className="form-label">
                Amount received (₹)
                <input className="form-input" type="number" min="0" step="0.01" value={paymentForm.amount} onChange={(event) => setPaymentForm({ ...paymentForm, amount: event.target.value })} required />
              </label>
              <label className="form-label">
                Payment date
                <input className="form-input" type="date" value={paymentForm.date} onChange={(event) => setPaymentForm({ ...paymentForm, date: event.target.value })} required />
              </label>
              <label className="form-label">
                Cheque / transaction reference
                <input className="form-input" value={paymentForm.reference} onChange={(event) => setPaymentForm({ ...paymentForm, reference: event.target.value })} placeholder="e.g. UTR, cheque number" />
              </label>
              <label className="form-label payment-upload-field">
                <span>Payment proof attachment</span>
                <span className="payment-upload-box">
                  <UploadCloud size={18} />
                  <span>{paymentForm.attachment?.name || 'Choose receipt, cheque scan or proof'}</span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(event) => setPaymentForm({ ...paymentForm, attachment: event.target.files?.[0] || null })} />
                </span>
              </label>
              <div className="payment-form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setPaymentSale(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><CheckCircle2 size={16} /> Save payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
