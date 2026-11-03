import React from 'react';
import { useFarm } from '../context/FarmContext';
import {
  LayoutDashboard,
  Fish,
  Utensils,
  Package,
  Menu,
} from 'lucide-react';

export default function MobileBottomNav({ onToggleSidebar }) {
  const { activeTab, setActiveTab } = useFarm();

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'feeding', label: 'Feeding', icon: Utensils },
    { id: 'inventory', label: 'Stock', icon: Package },
  ];

  return (
    <nav
      className="mobile-bottom-dock"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(8, 126, 164, 0.18)',
        boxShadow: '0 -4px 20px rgba(6, 59, 92, 0.12)',
        padding: '0 4px',
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? '#087EA4' : '#547185',
              padding: '4px 0',
              position: 'relative',
              transition: 'all 0.15s ease',
            }}
          >
            {/* Active top pill indicator */}
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  width: '32px',
                  height: '3px',
                  background: 'linear-gradient(90deg, #087EA4, #22D3EE)',
                  borderRadius: '0 0 3px 3px',
                }}
              />
            )}
            <div
              style={{
                width: '34px',
                height: '28px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isActive ? 'rgba(34, 211, 238, 0.2)' : 'transparent',
                transition: 'background 0.15s ease',
              }}
            >
              <Icon size={18} color={isActive ? '#087EA4' : '#64748B'} strokeWidth={isActive ? 2.4 : 1.8} />
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#063B5C' : '#64748B',
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}

      {/* Drawer menu trigger for more views */}
      <button
        onClick={onToggleSidebar}
        style={{
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#64748B',
          padding: '4px 0',
        }}
      >
        <div
          style={{
            width: '34px',
            height: '28px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Menu size={18} color="#64748B" strokeWidth={1.8} />
        </div>
        <span style={{ fontSize: '0.68rem', fontWeight: 500, color: '#64748B' }}>
          More
        </span>
      </button>
    </nav>
  );
}
