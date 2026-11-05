import React, { useEffect, useState } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  ArrowUpDown,
  ShoppingCart,
  Boxes,
} from 'lucide-react';
import DataLimitControl from '../components/DataLimitControl';

export default function InventoryView({ onOpenPurchase }) {
  const {
    inventory,
    purchases,
    feedingLogs,
    adjustStock,
    addInventoryItem,
    masterData,
    limitData,
  } = useFarm();

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState(10);
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [detailsItem, setDetailsItem] = useState(null);
  const [detailsMode, setDetailsMode] = useState('quantity');

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Feed');
  const [newItemSku, setNewItemSku] = useState('');
  const [newItemQty, setNewItemQty] = useState(100);
  const [newItemUnit, setNewItemUnit] = useState('kg');
  const [newItemThreshold, setNewItemThreshold] = useState(50);
  const [newItemCost, setNewItemCost] = useState(2.0);
  const [newItemSupplier, setNewItemSupplier] = useState('');
  const [newItemSupplierPhone, setNewItemSupplierPhone] = useState('');
  const [newItemExpiryDate, setNewItemExpiryDate] = useState('');
  const [newItemLocation, setNewItemLocation] = useState('Warehouse Bay 1');

  // Listen for hardware/browser back button modal close event
  useEffect(() => {
    const handleCloseModal = () => {
      setShowNewItemModal(false);
      setAdjustingItem(null);
      setDetailsItem(null);
    };
    window.addEventListener('close-active-modal', handleCloseModal);
    return () => window.removeEventListener('close-active-modal', handleCloseModal);
  }, []);

  const categories = [
    'All',
    'Feed',
    'Water Treatment',
    'Emergency Supplies',
    'Supplements',
    'Equipment',
    'Fish Species',
  ];
  const expiryEnabled =
    newItemCategory === 'Feed' ||
    newItemCategory === 'Emergency Supplies' ||
    newItemCategory === 'Supplements';
  const expiryWarning = (date) => {
    if (!date) return false;
    const days = (new Date(date) - new Date()) / 86400000;
    return days <= 7;
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  const visibleInventory = limitData(filteredInventory);

  const totalValue = inventory.reduce(
    (sum, i) => sum + (Number(i.stockQty) || 0) * (Number(i.costPerUnit) || 0),
    0,
  );

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    if (!adjustingItem) return;
    adjustStock(adjustingItem.id, Number(adjustAmount));
    setAdjustingItem(null);
  };

  const handleCreateNewItem = (e) => {
    e.preventDefault();
    addInventoryItem({
      name: newItemName,
      category: newItemCategory,
      sku: newItemSku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      stockQty: Number(newItemQty),
      purchaseQty: Number(newItemQty),
      unit: newItemUnit,
      minThreshold: Number(newItemThreshold),
      costPerUnit: Number(newItemCost),
      supplier: newItemSupplier || 'General Aqua Supplier',
      supplierPhone: newItemSupplierPhone,
      location: newItemLocation,
      ...(expiryEnabled ? { expiryDate: newItemExpiryDate } : {}),
    });
    setShowNewItemModal(false);
    setNewItemName('');
  };

  return (
    <div
      className="inventory-page"
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      {/* Header with Mobile Responsive Action Buttons */}
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
            Inventory & Supplies
          </h1>
          <p style={{ color: '#547185', fontSize: '0.84rem' }}></p>
        </div>

        {/* Action Buttons: on mobile grid 1fr 1fr with zero overflow */}
        <div className="mobile-btn-group">
          <button onClick={() => setShowNewItemModal(true)} className="btn btn-secondary">
            <Plus size={15} />
            <span>Add Stock Item</span>
          </button>
          <button onClick={onOpenPurchase} className="btn btn-primary">
            <ShoppingCart size={15} />
            <span>Purchase Order</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: responsive grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}
      >
        <div className="glass-surface water-buoyant" style={{ padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: '#547185', fontWeight: 600 }}>
            Total Inventory Asset
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#063B5C', marginTop: '3px' }}>
            ₹{Math.round(totalValue).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#087EA4', marginTop: '2px' }}>
            {inventory.length} distinct SKUs
          </div>
        </div>

        <div className="glass-surface water-buoyant" style={{ padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: '#547185', fontWeight: 600 }}>
            Feed Pellets in Silos
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#087EA4', marginTop: '3px' }}>
            {inventory
              .filter((i) => i.category === 'Feed')
              .reduce((sum, i) => sum + i.stockQty, 0)
              .toLocaleString()}{' '}
            <span style={{ fontSize: '0.85rem' }}>kg</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#16A085', marginTop: '2px' }}>
            ~14 days buffer supply
          </div>
        </div>

        <div className="glass-surface water-buoyant" style={{ padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', color: '#547185', fontWeight: 600 }}>
            Reorder Alerts
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#E9A23B', marginTop: '3px' }}>
            {inventory.filter((i) => i.stockQty <= i.minThreshold).length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#547185', marginTop: '2px' }}>
            Requires replenishment
          </div>
        </div>
      </div>

      {/* Search & Horizontal Scrollable Category Pills */}
      <div
        className="glass-surface"
        style={{
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* Horizontal swipeable category pills */}
        <div className="mobile-scroll-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                borderRadius: '20px',
                padding: '5px 12px',
                fontSize: '0.78rem',
                flexShrink: 0,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={16} color="#087EA4" />
          <input
            type="text"
            className="form-input"
            style={{ minHeight: '38px', padding: '6px 10px', fontSize: '0.88rem' }}
            placeholder="Search item, SKU, supplier or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Mobile Record Cards (Shown automatically on screens <= 768px) */}
      <div className="mobile-cards-container lg-hidden">
        {visibleInventory.map((item) => {
          const isLow = item.stockQty <= item.minThreshold;
          const totalCost = (item.stockQty * item.costPerUnit).toFixed(2);
          return (
            <div key={item.id} className="mobile-record-card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#063B5C', fontSize: '0.94rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setDetailsMode('quantity');
                        setDetailsItem(item);
                      }}
                      style={{
                        background: 'none',
                        border: 0,
                        padding: 0,
                        color: 'inherit',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'left',
                        textDecoration: 'underline',
                      }}
                    >
                      {item.name}
                    </button>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#547185', marginTop: '1px' }}>
                    {item.sku} • {item.location}
                  </div>
                </div>
                <span className="badge badge-ocean" style={{ fontSize: '0.7rem' }}>
                  {item.category}
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
                  <div style={{ fontSize: '0.72rem', color: '#547185' }}>Current Stock</div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      color: isLow ? '#E05260' : '#063B5C',
                    }}
                  >
                    {item.stockQty.toLocaleString()} {item.unit}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: '#547185' }}>Asset Value</div>
                  <div style={{ fontWeight: 700, color: '#087EA4', fontSize: '0.96rem' }}>
                    ₹{Number(totalCost).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '4px',
                  fontSize: '0.78rem',
                  color: '#547185',
                }}
              >
                <div>
                  Rate:{' '}
                  <strong>
                    ₹{item.costPerUnit.toFixed(2)}/{item.unit}
                  </strong>{' '}
                  • Supplier: {item.supplier}
                </div>
                <button
                  className="btn btn-sm btn-outline"
                  style={{ padding: '3px 10px', minHeight: '28px', fontSize: '0.76rem' }}
                  onClick={() => {
                    setAdjustingItem(item);
                    setAdjustAmount(0);
                  }}
                >
                  Adjust
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View (Shown on screens > 768px) */}
      <div className="table-container desktop-table-view">
        <style>{`.inventory-summary-table th:nth-child(9), .inventory-summary-table td:nth-child(9) { display: none; }`}</style>
        <table className="fms-table inventory-summary-table">
          <thead>
            <tr>
              <th>SKU & Item Name</th>
              <th>Category</th>
              <th>Purchase Qty</th>
              <th>Used Qty</th>
              <th>Current Stock</th>
              <th>Min Threshold</th>
              <th>Unit Cost</th>
              <th>Total Asset</th>
              <th>Location</th>
              <th>Supplier</th>
              <th>Mobile</th>
              <th className="inventory-expiry-column">Expiry</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleInventory.map((item) => {
              const isLow = item.stockQty <= item.minThreshold;
              const isExpiring =
                item.expiryDate &&
                expiryWarning(item.expiryDate) &&
                item.category !== 'Water Treatment';
              const purchaseQty = Number(item.purchaseQty ?? item.stockQty) || 0;
              const usedQty = Math.max(0, purchaseQty - (Number(item.stockQty) || 0));
              const itemPurchaseRecords = purchases
                .filter(
                  (purchase) =>
                    purchase.itemId === item.id ||
                    purchase.itemSku === item.sku ||
                    purchase.itemName === item.name,
                )
                .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
              const purchaseUnitCost = Number(itemPurchaseRecords[0]?.unitPrice);
              const unitCost =
                Number.isFinite(purchaseUnitCost) && purchaseUnitCost > 0
                  ? purchaseUnitCost
                  : Number(item.costPerUnit) || 0;
              const totalCost = (Number(item.stockQty) * unitCost).toFixed(2);
              return (
                <tr key={item.id}>
                  <td>
                    <button
                      type="button"
                      onClick={() => {
                        setDetailsMode('quantity');
                        setDetailsItem(item);
                      }}
                      style={{
                        background: 'none',
                        border: 0,
                        padding: 0,
                        color: '#063B5C',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'left',
                        textDecoration: 'underline',
                      }}
                    >
                      {item.name}
                    </button>
                    <div style={{ fontSize: '0.74rem', color: '#547185' }}>{item.sku}</div>
                  </td>
                  <td>
                    <span className="badge badge-ocean" style={{ fontSize: '0.74rem' }}>
                      {item.category}
                    </span>
                  </td>
                  <td style={{ color: '#063B5C', fontWeight: 600 }}>
                    {purchaseQty.toLocaleString()} {item.unit}
                    {item.lastRestocked && (
                      <div style={{ fontSize: '0.68rem', color: '#547185', fontWeight: 400 }}>
                        Added {item.lastAddedQty || ''} on {item.lastRestocked}
                      </div>
                    )}
                  </td>
                  <td style={{ color: '#C2410C', fontWeight: 600 }}>
                    {usedQty.toLocaleString()} {item.unit}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '1.05rem',
                          color: isLow ? '#E05260' : '#063B5C',
                        }}
                      >
                        {item.stockQty.toLocaleString()} {item.unit}
                      </span>
                      {isLow && (
                        <span className="badge badge-danger" style={{ fontSize: '0.68rem' }}>
                          Low
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ color: '#547185' }}>
                    {item.minThreshold} {item.unit}
                  </td>
                  <td style={{ fontWeight: 600, color: '#063B5C' }}>
                    <button
                      type="button"
                      className="inventory-cost-link"
                      onClick={() => {
                        setDetailsMode('cost');
                        setDetailsItem(item);
                      }}
                      title="View purchase and unit cost history"
                    >
                      ₹{unitCost.toFixed(2)}
                    </button>
                  </td>
                  <td style={{ fontWeight: 700, color: '#087EA4' }}>
                    ₹{Number(totalCost).toLocaleString('en-IN')}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#547185' }}>{item.location}</td>
                  <td style={{ fontSize: '0.82rem', color: '#547185' }}>{item.supplier}</td>
                  <td style={{ fontSize: '0.82rem', color: '#547185' }}>
                    {item.supplierPhone || '—'}
                  </td>
                  <td
                    className="inventory-expiry-column"
                    style={{
                      fontSize: '0.82rem',
                      color: isExpiring ? '#C2410C' : '#547185',
                      fontWeight: isExpiring ? 700 : 400,
                    }}
                  >
                    {item.expiryDate || '—'}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => {
                        setAdjustingItem(item);
                        setAdjustAmount(0);
                      }}
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="data-card-heading data-card-heading-table data-card-heading-bottom">
        <span>Inventory records</span>
        <DataLimitControl total={filteredInventory.length} />
      </div>

      {/* Adjust Stock Dialog */}
      {adjustingItem && (
        <div className="modal-overlay" onClick={() => setAdjustingItem(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '440px', padding: '20px' }}
          >
            <h3 style={{ fontSize: '1.15rem', color: '#063B5C', marginBottom: '6px' }}>
              Adjust Stock: {adjustingItem.name}
            </h3>
            <p style={{ color: '#547185', fontSize: '0.82rem', marginBottom: '14px' }}>
              Current stock:{' '}
              <strong>
                {adjustingItem.stockQty} {adjustingItem.unit}
              </strong>
            </p>

            <form onSubmit={handleAdjustSubmit}>
              <div className="form-group">
                <label className="form-label">Stock Change (use negative to deduct)</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  required
                />
                <div className="form-hint">
                  New stock will be:{' '}
                  <strong>
                    {Math.max(0, adjustingItem.stockQty + Number(adjustAmount || 0))}{' '}
                    {adjustingItem.unit}
                  </strong>
                </div>
              </div>

              <div
                className="modal-actions"
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '16px',
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setAdjustingItem(null)}
                  style={{ flexShrink: 0, minWidth: '90px', whiteSpace: 'nowrap' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ minWidth: 0, textAlign: 'center' }}>
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Item Modal */}
      {showNewItemModal && (
        <div className="modal-overlay" onClick={() => setShowNewItemModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '580px', padding: '22px' }}
          >
            <h2 style={{ fontSize: '1.25rem', color: '#063B5C', marginBottom: '12px' }}>
              Add New Catalog Inventory Item
            </h2>

            <form onSubmit={handleCreateNewItem}>
              <div className="form-group">
                <label className="form-label">
                  Item Name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Bio-Growth Nursery Pellets (38%)"
                  required
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '10px',
                }}
              >
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                  >
                    {(masterData.category.length
                      ? masterData.category
                      : [
                          'Feed',
                          'Water Treatment',
                          'Emergency Supplies',
                          'Supplements',
                          'Equipment',
                          'Fish Species',
                        ]
                    ).map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">SKU Code</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newItemSku}
                    onChange={(e) => setNewItemSku(e.target.value)}
                    placeholder="e.g. FEED-BG-38"
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                  gap: '10px',
                }}
              >
                <div className="form-group">
                  <label className="form-label">Initial Quantity</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <select
                    className="form-select"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                  >
                    {(masterData.unit.length
                      ? masterData.unit
                      : ['Kg', 'Pcs', 'Bag', 'Packet', 'MT', 'Ltr']
                    ).map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Min Threshold{' '}
                    <span title="Minimum stock level; a low-stock alert appears when stock reaches this number.">
                      ⓘ
                    </span>
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={newItemThreshold}
                    onChange={(e) => setNewItemThreshold(e.target.value)}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '10px',
                }}
              >
                <div className="form-group">
                  <label className="form-label">Cost per Unit (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Primary Supplier</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newItemSupplier}
                    onChange={(e) => setNewItemSupplier(e.target.value)}
                    placeholder="e.g. Marine Biotics"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Supplier Mobile</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={newItemSupplierPhone}
                    onChange={(e) => setNewItemSupplierPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>
              </div>

              {expiryEnabled && (
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newItemExpiryDate}
                    onChange={(e) => setNewItemExpiryDate(e.target.value)}
                    required
                  />
                  <div style={{ fontSize: '0.72rem', color: '#547185', marginTop: '4px' }}>
                    Expiry se 7 din pehle item highlight hoga.
                  </div>
                </div>
              )}

              <div
                className="modal-actions"
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '16px',
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowNewItemModal(false)}
                  style={{ flexShrink: 0, minWidth: '90px', whiteSpace: 'nowrap' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ minWidth: 0, textAlign: 'center' }}>
                  Create Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailsItem &&
        (() => {
          const itemPurchases = purchases
            .filter(
              (purchase) =>
                purchase.itemId === detailsItem.id ||
                purchase.itemSku === detailsItem.sku ||
                purchase.itemName === detailsItem.name,
            )
            .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
          const itemFeeds = feedingLogs.filter(
            (feed) => feed.feedItemId === detailsItem.id || feed.feedItem === detailsItem.name,
          );
          const purchasedQty = itemPurchases.reduce(
            (sum, purchase) => sum + (Number(purchase.quantity) || 0),
            0,
          );
          const usedQty = itemFeeds.reduce((sum, feed) => sum + (Number(feed.quantityKg) || 0), 0);
          const currentUnitCost =
            Number(itemPurchases[0]?.unitPrice) || Number(detailsItem.costPerUnit) || 0;
          const currentAsset = (Number(detailsItem.stockQty) || 0) * currentUnitCost;
          return (
            <div className="modal-overlay" onClick={() => setDetailsItem(null)}>
              <div
                className="modal-content inventory-detail-modal"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '680px', padding: '24px' }}
              >
                <div
                  className="inventory-detail-header"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '18px',
                  }}
                >
                  <div>
                    <h2 style={{ color: '#063B5C' }}>{detailsItem.name}</h2>
                    <div style={{ color: '#547185', fontSize: '.8rem' }}>
                      {detailsItem.sku}{' '}
                      <span
                        className="badge badge-ocean"
                        style={{ marginLeft: '6px', fontSize: '.65rem' }}
                      >
                        {detailsItem.category}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setDetailsItem(null)}
                  >
                    Close
                  </button>
                </div>
                <div
                  className="inventory-detail-kpis"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px',
                    marginBottom: '22px',
                  }}
                >
                  <div className="detail-kpi detail-kpi-purchased">
                    <small>Total Purchased</small>
                    <strong>
                      {purchasedQty} {detailsItem.unit}
                    </strong>
                  </div>
                  <div className="detail-kpi detail-kpi-used">
                    <small>{detailsMode === 'cost' ? 'Current Unit Cost' : 'Total Used'}</small>
                    <strong>
                      {detailsMode === 'cost'
                        ? `₹${currentUnitCost.toFixed(2)}`
                        : `${usedQty} ${detailsItem.unit}`}
                    </strong>
                  </div>
                  <div className="detail-kpi detail-kpi-current">
                    <small>Current Stock</small>
                    <strong>
                      {detailsItem.stockQty} {detailsItem.unit}
                    </strong>
                  </div>
                </div>
                {detailsMode === 'cost' && (
                  <>
                    <h3 className="detail-section-title">
                      Purchase Cost & Asset History <span>{itemPurchases.length}</span>
                    </h3>
                    <div className="detail-record-list">
                      {itemPurchases.length ? (
                        itemPurchases.map((purchase, index) => {
                          const addedAsset =
                            (Number(purchase.quantity) || 0) * (Number(purchase.unitPrice) || 0);
                          const stockAfterPurchase = Math.min(
                            Number(detailsItem.stockQty) || 0,
                            (Number(detailsItem.purchaseQty) || 0) +
                              itemPurchases
                                .slice(0, itemPurchases.length - index)
                                .reduce((sum, entry) => sum + (Number(entry.quantity) || 0), 0),
                          );
                          const cumulativeAsset =
                            stockAfterPurchase * (Number(purchase.unitPrice) || currentUnitCost);
                          return (
                            <div className="detail-record detail-record-in" key={purchase.id}>
                              <div>
                                <strong>{purchase.date}</strong>
                                <small>
                                  {purchase.supplier} • {purchase.id}
                                </small>
                              </div>
                              <div className="detail-record-value">
                                +{purchase.quantity} {purchase.unit}
                                <small>
                                  ₹{Number(purchase.unitPrice || 0).toFixed(2)} • +₹
                                  {Number(addedAsset).toLocaleString('en-IN')}
                                  <br />
                                  Asset: ₹{Number(cumulativeAsset).toLocaleString('en-IN')}
                                </small>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="detail-empty">No purchase records found.</div>
                      )}
                    </div>
                    <div className="detail-kpi detail-kpi-current" style={{ marginTop: '12px' }}>
                      <small>Current Asset Amount</small>
                      <strong>
                        ₹
                        {currentAsset.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </strong>
                    </div>
                  </>
                )}
                {detailsMode === 'quantity' && (
                  <>
                    <h3 className="detail-section-title">
                      Purchase Records <span>{itemPurchases.length}</span>
                    </h3>
                    <div className="detail-record-list">
                      {itemPurchases.length ? (
                        itemPurchases.map((purchase) => (
                          <div className="detail-record detail-record-in" key={purchase.id}>
                            <div>
                              <strong>{purchase.date}</strong>
                              <small>
                                {purchase.supplier} • {purchase.id}
                              </small>
                            </div>
                            <div className="detail-record-value">
                              +{purchase.quantity} {purchase.unit}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="detail-empty">No purchase records found.</div>
                      )}
                    </div>
                    <h3 className="detail-section-title">
                      Feeding / Usage Records <span>{itemFeeds.length}</span>
                    </h3>
                    <div className="detail-record-list">
                      {itemFeeds.length ? (
                        itemFeeds.map((feed) => (
                          <div className="detail-record detail-record-out" key={feed.id}>
                            <div>
                              <strong>{feed.date}</strong>
                              <small>{feed.pondName}</small>
                            </div>
                            <div className="detail-record-value">
                              -{feed.quantityKg} {detailsItem.unit}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="detail-empty">No feeding records found.</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })()}
    </div>
  );
}
