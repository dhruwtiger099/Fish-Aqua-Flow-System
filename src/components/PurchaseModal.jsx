import React, { useState, useMemo } from 'react';
import { useFarm } from '../context/FarmContext';
import { uploadInvoiceAttachment } from '../services/googleSheets';
import DoubleRingLoader from './DoubleRingLoader';
import {
  X,
  ShoppingCart,
  DollarSign,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calculator,
} from 'lucide-react';

export default function PurchaseModal({ onClose }) {
  const { inventory, addPurchase, masterData } = useFarm();

  const [selectedItemId, setSelectedItemId] = useState('');
  const [purchaseType, setPurchaseType] = useState('Feed');
  const [fishName, setFishName] = useState('');
  const [fishWeight, setFishWeight] = useState('');
  const [fishCount, setFishCount] = useState('');
  const [category, setCategory] = useState('Feed');
  const [itemName, setItemName] = useState('');
  const [supplier, setSupplier] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('Kg');
  const [unitPrice, setUnitPrice] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [shippingFee, setShippingFee] = useState('');
  const [shippingMode, setShippingMode] = useState('Self');
  const [paidStatus, setPaidStatus] = useState('Paid');
  const [status, setStatus] = useState('Received');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [invoiceAttachment, setInvoiceAttachment] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const effectiveUnit = unit;
  const purchaseQuantity = purchaseType === 'Fish Species' ? fishCount : quantity;

  // Find currently selected item
  const selectedItem = useMemo(() => {
    return inventory.find((i) => i.id === selectedItemId);
  }, [inventory, selectedItemId]);

  const matchingItems = useMemo(() => {
    const selectedCategory = purchaseType.toLowerCase();
    return inventory.filter((item) => (item.category || '').toLowerCase() === selectedCategory);
  }, [inventory, purchaseType]);

  // When item changes, sync default price & supplier
  const handleItemChange = (e) => {
    const id = e.target.value;
    setSelectedItemId(id);
    const item = inventory.find((i) => i.id === id);
    if (item) {
      setUnitPrice(item.costPerUnit || 0);
      if (item.supplier) setSupplier(item.supplier);
    }
  };

  // Real-time calculations
  const subtotal = useMemo(() => {
    const q = Number(quantity) || 0;
    const p = Number(unitPrice) || 0;
    return q * p;
  }, [quantity, unitPrice]);

  const taxAmount = useMemo(() => {
    const tr = Number(taxRate) || 0;
    return (subtotal * tr) / 100;
  }, [subtotal, taxRate]);

  const totalAmount = useMemo(() => {
    const sf = shippingMode === 'Freight' ? (Number(shippingFee) || 0) : 0;
    return subtotal + taxAmount + sf;
  }, [subtotal, taxAmount, shippingFee, shippingMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const executePurchase = async () => {
    setIsSubmitting(true);
    let attachmentUrl = '';
    if (invoiceAttachment) {
      try {
        const uploaded = await uploadInvoiceAttachment(invoiceAttachment);
        attachmentUrl = uploaded.url || '';
      } catch (error) {
        setIsSubmitting(false);
        window.alert(`Invoice upload failed: ${error.message}`);
        return;
      }
    }
    addPurchase({
      itemId: selectedItemId,
      itemName: purchaseType === 'Fish Species' ? '' : (itemName || selectedItem?.name || 'Bulk Supply'),
      category,
      purchaseType,
      fishWeight: purchaseType === 'Fish Species' ? Number(fishWeight) : '',
      fishCount: purchaseType === 'Fish Species' ? Number(fishCount) : '',
      fishName: purchaseType === 'Fish Species' ? fishName : '',
      itemSku: selectedItem?.sku || '',
      supplier,
      quantity: Number(purchaseQuantity),
      unit,
      unitPrice: Number(unitPrice),
      taxRate: Number(taxRate),
      shippingFee: shippingMode === 'Freight' ? Number(shippingFee) : 0,
      paidStatus,
      status,
      invoiceNumber,
      attachmentName: invoiceAttachment?.name || '',
      attachmentUrl,
      notes,
    });
    if (purchaseType === 'Fish Species') {
      const key = 'aquaflow_fish_cycles';
      const existingCycles = JSON.parse(localStorage.getItem(key) || '[]');
      const cycleId = `Cycle - ${String(existingCycles.length + 1).padStart(3, '0')}`;
      const newCycle = {
        id: cycleId,
        fishName: fishName.trim(),
        status: 'nursery-pending',
        nurseryDate: new Date().toISOString().slice(0, 10),
        nurseryWeight: Number(fishWeight) || 0,
        nurseryFishCount: Number(fishCount) || 0,
        pondADate: '', pondAWeight: 0, pondBDate: '', pondBWeight: 0,
        note: `Purchased via ${invoiceNumber || 'Fish Buy Purchase Order'}`,
      };
      localStorage.setItem(key, JSON.stringify([newCycle, ...existingCycles]));
      window.dispatchEvent(new Event('aquaflow-cycle-updated'));
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', padding: '26px' }}
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
                background: 'linear-gradient(135deg, #087EA4 0%, #063B5C 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#22D3EE',
              }}
            >
              <ShoppingCart size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', color: '#063B5C' }}>Create Purchase Order</h2>
              <p style={{ fontSize: '0.82rem', color: '#547185' }}>
                Stock in feeds, water treatments, equipment & nursery inventory
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn-icon" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="#063B5C" />
          </button>
        </div>

        {/* Confirmation Step */}
        {showConfirm ? (
          <div style={{ padding: '10px 0' }}>
            <div
              style={{
                background: 'rgba(34, 211, 238, 0.12)',
                border: '1.5px solid rgba(8, 126, 164, 0.3)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '20px',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', color: '#063B5C', marginBottom: '12px' }}>
                Confirm Purchase Order Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#547185' }}>Item:</span>
                  <span style={{ fontWeight: 700, color: '#063B5C' }}>{itemName || fishName || selectedItem?.name || 'Bulk Supply'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#547185' }}>Supplier:</span>
                  <span style={{ fontWeight: 600, color: '#063B5C' }}>{supplier}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#547185' }}>Quantity to Add:</span>
                  <span style={{ fontWeight: 700, color: '#087EA4' }}>
                    {purchaseQuantity} {purchaseType === 'Fish Species' ? 'fish' : effectiveUnit}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#547185' }}>Unit Rate:</span>
                  <span style={{ fontWeight: 600, color: '#063B5C' }}>₹{Number(unitPrice).toLocaleString('en-IN')} / {unit}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#547185' }}>Inventory Effect:</span>
                  <span style={{ fontWeight: 700, color: status === 'Received' ? '#16A085' : '#E9A23B' }}>
                    {status === 'Received'
                      ? `+${purchaseQuantity} ${purchaseType === 'Fish Species' ? 'fish' : effectiveUnit} will be added immediately`
                      : 'Pending delivery (will not alter stock yet)'}
                  </span>
                </div>
                <div
                  style={{
                    borderTop: '1px solid rgba(8, 126, 164, 0.2)',
                    paddingTop: '8px',
                    marginTop: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1.1rem',
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#063B5C' }}>Grand Total:</span>
                  <span style={{ fontWeight: 800, color: '#087EA4' }}>
                    ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowConfirm(false)}
              >
                Back to Edit
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={executePurchase}
                disabled={isSubmitting}
              >
                {isSubmitting ? <DoubleRingLoader /> : <CheckCircle2 size={16} />}
                <span>{isSubmitting ? 'Saving...' : 'Confirm & Record Order'}</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Purchase Type <span className="required-star">*</span></label>
              <select className="form-select" value={purchaseType} onChange={(e) => { const next = e.target.value; setPurchaseType(next); setCategory(next); setSelectedItemId(''); setItemName(''); if (next === 'Fish Species') setUnit('Kg'); }}>
                {(masterData.category.length ? masterData.category : ['Feed', 'Water Treatment', 'Emergency Supplies', 'Supplements', 'Equipment', 'Fish Species']).map((value) => <option key={value}>{value}</option>)}
              </select>
            </div>
            {purchaseType === 'Fish Species' && (
              <>
                <div className="form-group">
                  <label className="form-label">Initial Total Weight (kg) <span className="required-star">*</span></label>
                  <input className="form-input" type="number" min="0" step="any" value={fishWeight} onChange={(e) => setFishWeight(e.target.value)} placeholder="e.g. 12.5" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Fish Count <span className="required-star">*</span></label>
                  <input className="form-input" type="number" min="1" step="1" value={fishCount} onChange={(e) => setFishCount(e.target.value)} placeholder="e.g. 500" required />
                </div>
              </>
            )}
            <div className="form-group">
              <label className="form-label">{purchaseType === 'Fish Species' ? 'Fish Name / Species' : 'Item / Supply Name'} <span className="required-star">*</span></label>
              {purchaseType === 'Fish Species' ? (
                <input className="form-input" value={fishName} onChange={(e) => setFishName(e.target.value)} placeholder="e.g. Tilapia Fingerlings" required />
              ) : (
                <select className="form-select" value={selectedItemId} onChange={handleItemChange} required>
                  <option value="">Select SKU &amp; item name</option>
                  {matchingItems.map((item) => (
                    <option key={item.id} value={item.id}>{item.sku} — {item.name}</option>
                  ))}
                </select>
              )}
              {purchaseType !== 'Fish Species' && matchingItems.length === 0 && (
                <div className="form-hint">No inventory item found for this category.</div>
              )}
            </div>

            {/* Supplier & Invoice */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">
                  Vendor / Supplier <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Invoice / PO Reference</label>
                <input
                  type="text"
                  className="form-input"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Quantity & Unit price with Unit preview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                  <label className="form-label">
                    Quantity ({effectiveUnit}) <span className="required-star">*</span>
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    inputMode="decimal"
                    className="form-input"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    style={{ flex: 1 }}
                  />
                  {purchaseType !== 'Fish Species' && <select className="form-select" value={unit} onChange={(e) => setUnit(e.target.value)} style={{ width: '112px' }} aria-label="Quantity unit">
                    {(masterData.unit.length ? masterData.unit : ['Kg', 'Pcs', 'Bag', 'Packet', 'MT', 'Ltr']).map((value) => <option key={value}>{value}</option>)}
                  </select>}
                </div>
                <div className="form-hint">
                  Unit will be recorded in {effectiveUnit}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Unit Price (₹ / {effectiveUnit}) <span className="required-star">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  className="form-input"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  required
                />
                <div className="form-hint">
                  Subtotal: ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Tax, Shipping & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  className="form-input"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Shipping / Freight</label>
                <select className="form-select" value={shippingMode} onChange={(e) => setShippingMode(e.target.value)}>
                  <option value="Self">Self</option>
                  <option value="Freight">Freight</option>
                </select>
                {shippingMode === 'Freight' && (
                  <input type="number" min="0" step="any" className="form-input" value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} placeholder="Freight amount (₹)" />
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Received">Received (Stock-In)</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Ordered">Ordered (Pending)</option>
                </select>
              </div>
            </div>

            {/* Real-time Calculation Summary Glass Box */}
            <div
              style={{
                background: 'linear-gradient(145deg, #F0F9FB 0%, #E6F5F8 100%)',
                border: '1.5px solid rgba(8, 126, 164, 0.22)',
                borderRadius: '16px',
                padding: '14px 18px',
                margin: '10px 0 16px 0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#063B5C', fontWeight: 700, fontSize: '0.86rem' }}>
                <Calculator size={15} color="#087EA4" />
                <span>Real-Time Order Calculation</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#547185' }}>Base Items</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#063B5C' }}>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#547185' }}>Tax ({taxRate}%)</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#063B5C' }}>₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#547185' }}>Shipping</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#063B5C' }}>₹{(shippingMode === 'Freight' ? Number(shippingFee || 0) : 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
                <div style={{ background: 'rgba(34, 211, 238, 0.18)', borderRadius: '10px', padding: '4px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#087EA4', fontWeight: 700 }}>Total Due</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#063B5C' }}>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Invoice / Bill Attachment</label>
              <input
                type="file"
                className="form-input"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.xls,.xlsx"
                onChange={(e) => setInvoiceAttachment(e.target.files?.[0] || null)}
              />
              <div className="form-hint">PDF, image ya Excel bill attach karein. Max recommended size: 10 MB.</div>
              {invoiceAttachment && <div className="form-hint" style={{ color: '#087EA4', fontWeight: 600 }}>Selected: {invoiceAttachment.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Receipt / Quality Inspection Notes</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Bag condition, lab certificate, moisture % test..."
              />
            </div>

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '18px',
                paddingTop: '14px',
                borderTop: '1px solid rgba(8, 126, 164, 0.15)',
              }}
            >
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <span>Review & Submit Order</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
