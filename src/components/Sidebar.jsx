import React from 'react';
import { useFarm } from '../context/FarmContext';
import {
  LayoutDashboard,
  Fish,
  Utensils,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart3,
  ReceiptText,
  ArrowRightLeft,
  X,
  Droplets,
  HelpCircle,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { activeTab, setActiveTab, ponds, inventory } = useFarm();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'fish-transfers', label: 'Fish Lifecycle Ledger', icon: ArrowRightLeft },
    { id: 'feeding', label: 'Feeding Workflows', icon: Utensils },
    {
      id: 'inventory',
      label: 'Inventory & Stock',
      icon: Package,
      badge: inventory.filter((i) => i.stockQty <= i.minThreshold).length > 0 ? 'Low Stock' : null,
      badgeVariant: 'warning',
    },
    { id: 'purchases', label: 'Purchases & Vendors', icon: ShoppingCart },
    { id: 'expenses', label: 'Farm Expenses', icon: ReceiptText },
    { id: 'sales', label: 'Harvesting & Sales', icon: DollarSign },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  const handleSelect = (id) => {
    setActiveTab(id);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(4, 36, 58, 0.5)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 109,
          }}
          className="lg-hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          width: '260px',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 110,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px 16px',
        }}
        className="glass-sidebar"
      >
        {/* Top: Logo & Close Button (mobile) */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '26px',
              paddingBottom: '14px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #22D3EE 0%, #087EA4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#063B5C',
                  boxShadow: '0 4px 14px rgba(34, 211, 238, 0.4)',
                }}
              >
                <Droplets size={20} />
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem', color: '#FFFFFF' }}>
                  AquaFlow FMS
                </div>
                <div style={{ fontSize: '0.72rem', color: '#C2E2EC', fontWeight: 500 }}>
                  Smart Aquaculture OS
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '14px',
                    border: isActive ? '1px solid rgba(34, 211, 238, 0.5)' : '1px solid transparent',
                    background: isActive
                      ? 'linear-gradient(90deg, rgba(8, 126, 164, 0.55) 0%, rgba(34, 211, 238, 0.22) 100%)'
                      : 'transparent',
                    color: isActive ? '#FFFFFF' : '#C2E2EC',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 4px 14px rgba(8, 126, 164, 0.25)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.color = '#FFFFFF';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#C2E2EC';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon
                      size={18}
                      color={isActive ? '#22D3EE' : '#88B7CA'}
                      style={{ transition: 'color 0.2s ease' }}
                    />
                    <span style={{ fontSize: '0.9rem', fontWeight: isActive ? 700 : 500 }}>
                      {item.label}
                    </span>
                  </div>

                  {item.badge && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: '10px',
                        background:
                          item.badgeVariant === 'warning'
                            ? 'rgba(233, 162, 59, 0.25)'
                            : 'rgba(34, 211, 238, 0.2)',
                        color: item.badgeVariant === 'warning' ? '#FFD480' : '#22D3EE',
                        border: `1px solid ${
                          item.badgeVariant === 'warning'
                            ? 'rgba(233, 162, 59, 0.5)'
                            : 'rgba(34, 211, 238, 0.4)'
                        }`,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Card: Farm Health & System status */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.07)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '14px',
            marginTop: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#A0CFDF', fontWeight: 600 }}>Farm Health Index</span>
            <span style={{ fontSize: '0.82rem', color: '#22D3EE', fontWeight: 700 }}>No data</span>
          </div>

          <div
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '4px',
              background: 'rgba(255, 255, 255, 0.12)',
              overflow: 'hidden',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                width: '0%',
                height: '100%',
                background: 'linear-gradient(90deg, #16A085 0%, #22D3EE 100%)',
                borderRadius: '4px',
              }}
            />
          </div>

          <div style={{ fontSize: '0.72rem', color: '#88B7CA', lineHeight: 1.3 }}>
            Add pond operations to begin tracking
          </div>
        </div>
      </aside>
    </>
  );
}
