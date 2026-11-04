import React, { useState, useMemo, useEffect } from 'react';
import { useFarm } from '../context/FarmContext';
import { Search, X, Fish, Package, Utensils, DollarSign, ChevronRight } from 'lucide-react';

export default function SearchModal({ isOpen, onClose, onSelectPond }) {
  const { ponds, inventory, feedingLogs, sales, setActiveTab, setSelectedPondModal } = useFarm();
  const [query, setQuery] = useState('');

  // Handle keyboard escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return { ponds: [], inventory: [], feeds: [], sales: [] };
    const q = query.toLowerCase();

    return {
      ponds: ponds.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.species.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q),
      ),
      inventory: inventory.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q) ||
          i.supplier.toLowerCase().includes(q),
      ),
      feeds: feedingLogs.filter(
        (f) =>
          f.feedItem.toLowerCase().includes(q) ||
          f.pondName.toLowerCase().includes(q) ||
          f.technician.toLowerCase().includes(q),
      ),
      sales: sales.filter(
        (s) =>
          s.buyerName.toLowerCase().includes(q) ||
          s.species.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q),
      ),
    };
  }, [query, ponds, inventory, feedingLogs, sales]);

  if (!isOpen) return null;

  const totalResults =
    results.ponds.length + results.inventory.length + results.feeds.length + results.sales.length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px', padding: 0, overflow: 'hidden' }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1.5px solid rgba(8, 126, 164, 0.16)',
            background: '#FFFFFF',
          }}
        >
          <Search size={20} color="#087EA4" />
          <input
            type="text"
            autoFocus
            placeholder="Search ponds, fish species, stock items, suppliers, buyers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              color: '#0F2942',
              fontFamily: 'inherit',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A97AA' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results Container */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '16px' }}>
          {!query.trim() ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: '#547185' }}>
              <div
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#063B5C',
                  marginBottom: '4px',
                }}
              >
                Quick System Search
              </div>
              <div style={{ fontSize: '0.8rem' }}>
                Type to find ponds, feeds, inventory chemicals, purchases or harvest records
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: '#547185' }}>
              No matches found for "{query}".
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Ponds */}
              {results.ponds.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: '#087EA4',
                      textTransform: 'uppercase',
                      marginBottom: '6px',
                    }}
                  >
                    Ponds ({results.ponds.length})
                  </div>
                  {results.ponds.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedPondModal(p);
                        onClose();
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'rgba(8, 126, 164, 0.06)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Fish size={16} color="#087EA4" />
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#063B5C' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#547185' }}>
                            {p.species} • {p.estimatedBiomassKg} kg
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={15} color="#547185" />
                    </div>
                  ))}
                </div>
              )}

              {/* Inventory */}
              {results.inventory.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: '#087EA4',
                      textTransform: 'uppercase',
                      marginBottom: '6px',
                    }}
                  >
                    Inventory Items ({results.inventory.length})
                  </div>
                  {results.inventory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setActiveTab('inventory');
                        onClose();
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'rgba(8, 126, 164, 0.06)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Package size={16} color="#087EA4" />
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#063B5C' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#547185' }}>
                            {item.stockQty} {item.unit} in stock • ₹{item.costPerUnit} / unit
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={15} color="#547185" />
                    </div>
                  ))}
                </div>
              )}

              {/* Sales */}
              {results.sales.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: '#087EA4',
                      textTransform: 'uppercase',
                      marginBottom: '6px',
                    }}
                  >
                    Sales & Harvest ({results.sales.length})
                  </div>
                  {results.sales.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setActiveTab('sales');
                        onClose();
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'rgba(8, 126, 164, 0.06)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <DollarSign size={16} color="#16A085" />
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#063B5C' }}>
                            {s.buyerName}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#547185' }}>
                            {s.weightKg} kg • ₹{s.grossRevenue.toLocaleString('en-IN')} (
                            {s.paymentStatus})
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={15} color="#547185" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '10px 16px',
            background: '#F0F9FB',
            borderTop: '1px solid rgba(8, 126, 164, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#547185',
          }}
        >
          <span>Press ESC to close</span>
          <span>Aqua Flow System Instant Index</span>
        </div>
      </div>
    </div>
  );
}
