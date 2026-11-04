import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  DollarSign,
  Truck,
  CheckCircle2,
  Clock,
  Building2,
} from 'lucide-react';
import DataLimitControl from '../components/DataLimitControl';

export default function PurchasesView({ onOpenPurchase }) {
  const { purchases, limitData } = useFarm();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredPurchases = purchases.filter((po) => {
    const matchesStatus = statusFilter === 'All' || po.status === statusFilter;
    const matchesSearch =
      po.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (po.invoiceNumber && po.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });
  const visiblePurchases = limitData(filteredPurchases);

  const totalSpent = purchases.reduce((sum, po) => sum + (Number(po.totalAmount) || 0), 0);

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
            Purchases, Orders & Supplier Logistics
          </h1>
          <p style={{ color: '#547185', fontSize: '0.84rem' }}>
            Purchase order logs, vendor invoices, freight calculations & inventory auto-receive
          </p>
        </div>

        <div className="mobile-btn-group">
          <button onClick={onOpenPurchase} className="btn btn-primary" style={{ width: '100%' }}>
            <Plus size={15} />
            <span>New Purchase Order</span>
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
            Total Procurement
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#063B5C', marginTop: '3px' }}>
            ₹
            {totalSpent.toLocaleString('en-IN', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#087EA4', marginTop: '2px' }}>
            {purchases.length} PO orders
          </div>
        </div>

        <div className="glass-surface" style={{ padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: '#547185', fontWeight: 600 }}>
            Active Suppliers
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#087EA4', marginTop: '3px' }}>
            {new Set(purchases.map((p) => p.supplier)).size} Vendors
          </div>
          <div style={{ fontSize: '0.72rem', color: '#16A085', marginTop: '2px' }}>
            100% on-time delivery
          </div>
        </div>

        <div className="glass-surface" style={{ padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: '#547185', fontWeight: 600 }}>In Transit</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#E9A23B', marginTop: '3px' }}>
            {purchases.filter((p) => p.status === 'In Transit').length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#547185', marginTop: '2px' }}>
            Due in 24–48h
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
        <div className="mobile-scroll-pills">
          {['All', 'Received', 'In Transit', 'Pending'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                borderRadius: '20px',
                padding: '5px 12px',
                fontSize: '0.78rem',
                flexShrink: 0,
              }}
            >
              {st}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={16} color="#087EA4" />
          <input
            type="text"
            className="form-input"
            style={{ minHeight: '38px', padding: '6px 10px', fontSize: '0.88rem' }}
            placeholder="Search PO #, supplier, item or invoice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Mobile Record Cards */}
      <div className="mobile-cards-container lg-hidden">
        {visiblePurchases.map((po) => (
          <div key={po.id} className="mobile-record-card">
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
              <div>
                <div style={{ fontWeight: 700, color: '#063B5C', fontSize: '0.94rem' }}>
                  {po.itemName}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#547185' }}>
                  {po.id} • {po.date}
                </div>
              </div>
              <span
                className={`badge ${
                  po.status === 'Received'
                    ? 'badge-active'
                    : po.status === 'In Transit'
                      ? 'badge-warning'
                      : 'badge-ocean'
                }`}
                style={{ fontSize: '0.7rem' }}
              >
                {po.status}
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
                <div style={{ fontSize: '0.72rem', color: '#547185' }}>Quantity</div>
                <div style={{ fontWeight: 700, color: '#063B5C', fontSize: '0.98rem' }}>
                  {po.quantity.toLocaleString()} {po.unit}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: '#547185' }}>Total Cost</div>
                <div style={{ fontWeight: 800, color: '#087EA4', fontSize: '1.05rem' }}>
                  ₹{Number(po.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#547185', marginTop: '2px' }}>
              Supplier: <strong>{po.supplier}</strong> • Rate: ₹{po.unitPrice}/{po.unit}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="table-container desktop-table-view">
        <style>{`.purchases-summary-table th:last-child, .purchases-summary-table td:last-child { display: none; }`}</style>
        <table className="fms-table purchases-summary-table">
          <thead>
            <tr>
              <th>PO Number & Date</th>
              <th>Supplier</th>
              <th>Item Ordered</th>
              <th>Quantity</th>
              <th>Unit Rate</th>
              <th>Tax & Freight</th>
              <th>Total Amount</th>
              <th>Delivery Status</th>
              <th>Image / Attachment</th>
              <th>Received By</th>
            </tr>
          </thead>
          <tbody>
            {visiblePurchases.map((po) => (
              <tr key={po.id}>
                <td>
                  <div style={{ fontWeight: 700, color: '#063B5C' }}>{po.id}</div>
                  <div style={{ fontSize: '0.75rem', color: '#547185' }}>{po.date}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: '#063B5C' }}>{po.supplier}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: '#063B5C' }}>{po.itemName}</div>
                </td>
                <td>
                  <span style={{ fontWeight: 700 }}>
                    {po.quantity.toLocaleString()} {po.unit}
                  </span>
                </td>
                <td style={{ color: '#547185' }}>
                  ₹{po.unitPrice} / {po.unit}
                </td>
                <td style={{ fontSize: '0.82rem', color: '#547185' }}>
                  Tax: {po.taxRate || 0}% • Freight: ₹
                  {Number(po.shippingFee || 0).toLocaleString('en-IN')}
                </td>
                <td>
                  <span style={{ fontWeight: 800, color: '#087EA4', fontSize: '1.05rem' }}>
                    ₹{Number(po.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td>
                  <span
                    className={`badge ${
                      po.status === 'Received'
                        ? 'badge-active'
                        : po.status === 'In Transit'
                          ? 'badge-warning'
                          : 'badge-ocean'
                    }`}
                  >
                    {po.status}
                  </span>
                </td>
                <td style={{ fontSize: '0.82rem' }}>
                  {po.attachmentUrl ? (
                    <a
                      href={po.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#087EA4', fontWeight: 700 }}
                    >
                      View file
                    </a>
                  ) : po.attachmentName ? (
                    <span title={po.attachmentName} style={{ color: '#547185' }}>
                      Attachment: {po.attachmentName}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td style={{ fontSize: '0.84rem', color: '#547185' }}>{po.receivedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="data-card-heading data-card-heading-table data-card-heading-bottom">
        <span>Purchase records</span>
        <DataLimitControl total={filteredPurchases.length} />
      </div>
    </div>
  );
}
