import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { USER_ROLES } from '../data/initialData';
import {
  Menu,
  Search,
  Bell,
  Waves,
  ShieldCheck,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';

export default function Navbar({ onToggleSidebar, onOpenSearchModal }) {
  const { currentUser, setCurrentUser, ponds, resetToFactoryData } = useFarm();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAlertsMenu, setShowAlertsMenu] = useState(false);

  const activeAlerts = ponds.flatMap((p) =>
    (p.alerts || []).map((a) => ({ ...a, pondName: p.name }))
  );

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(8, 126, 164, 0.16)',
        padding: '8px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        boxShadow: '0 4px 18px rgba(6, 59, 92, 0.04)',
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box',
      }}
    >
      {/* Left: Mobile hamburger & Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="btn-icon"
          style={{
            background: 'rgba(8, 126, 164, 0.08)',
            border: '1px solid rgba(8, 126, 164, 0.18)',
            color: '#063B5C',
            cursor: 'pointer',
            width: '36px',
            height: '36px',
            flexShrink: 0,
          }}
        >
          <Menu size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #087EA4 0%, #063B5C 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(8, 126, 164, 0.3)',
              color: '#22D3EE',
              flexShrink: 0,
            }}
          >
            <Waves size={18} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', minWidth: 0 }}>
            <span
              style={{
                fontFamily: 'Outfit',
                fontWeight: 800,
                fontSize: '1.05rem',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #063B5C 0%, #087EA4 80%, #22D3EE 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                whiteSpace: 'nowrap',
              }}
            >
              AquaFlow
            </span>
            <span
              className="badge badge-aqua"
              style={{
                fontSize: '0.6rem',
                padding: '1px 5px',
                fontWeight: 800,
              }}
            >
              PRO
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Quick Search (Desktop / Tablet) */}
      <div
        onClick={onOpenSearchModal}
        style={{
          flex: '1',
          maxWidth: '340px',
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1.5px solid rgba(8, 126, 164, 0.18)',
          borderRadius: '12px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          color: '#547185',
          fontSize: '0.82rem',
          boxShadow: 'inset 0 1px 2px rgba(6, 59, 92, 0.03)',
        }}
        className="hide-on-mobile-sm"
      >
        <Search size={15} color="#087EA4" />
        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Search...
        </span>
        <kbd
          style={{
            background: 'rgba(8, 126, 164, 0.1)',
            padding: '1px 5px',
            borderRadius: '4px',
            fontSize: '0.65rem',
            fontFamily: 'monospace',
            color: '#087EA4',
          }}
        >
          ⌘K
        </kbd>
      </div>

      {/* Right: Quick alerts & Profile Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {/* Mobile Search Button icon */}
        <button
          onClick={onOpenSearchModal}
          className="btn-icon lg-hidden"
          style={{
            width: '36px',
            height: '36px',
            background: 'rgba(8, 126, 164, 0.08)',
            border: '1px solid rgba(8, 126, 164, 0.16)',
            cursor: 'pointer',
            color: '#087EA4',
          }}
        >
          <Search size={16} />
        </button>

        {/* Alerts */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowAlertsMenu(!showAlertsMenu)}
            aria-label="Alerts"
            className="btn-icon"
            style={{
              width: '36px',
              height: '36px',
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(8, 126, 164, 0.18)',
              color: '#0F2942',
              position: 'relative',
              cursor: 'pointer',
            }}
          >
            <Bell size={16} color="#063B5C" />
            {activeAlerts.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  width: '7px',
                  height: '7px',
                  background: '#E9A23B',
                  borderRadius: '50%',
                }}
              />
            )}
          </button>

          {showAlertsMenu && (
            <div
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '280px',
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(8, 126, 164, 0.22)',
                borderRadius: '14px',
                boxShadow: '0 14px 36px rgba(6, 59, 92, 0.18)',
                padding: '12px',
                zIndex: 200,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(8, 126, 164, 0.12)',
                  paddingBottom: '6px',
                  marginBottom: '8px',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#063B5C' }}>
                  Pond Alerts
                </span>
                <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                  {activeAlerts.length}
                </span>
              </div>
              {activeAlerts.length === 0 ? (
                <div style={{ fontSize: '0.78rem', color: '#547185', textAlign: 'center', padding: '8px 0' }}>
                  All ponds optimal. Zero alarms.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {activeAlerts.map((alt, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '6px 8px',
                        background: 'rgba(233, 162, 59, 0.08)',
                        border: '1px solid rgba(233, 162, 59, 0.25)',
                        borderRadius: '6px',
                        fontSize: '0.76rem',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: '#063B5C' }}>{alt.pondName}</div>
                      <div style={{ color: '#547185', marginTop: '1px' }}>{alt.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Role Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1.5px solid rgba(8, 126, 164, 0.22)',
              borderRadius: '12px',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              height: '36px',
            }}
          >
            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{currentUser.avatar}</span>
            <div style={{ textAlign: 'left' }} className="hide-on-mobile">
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#063B5C', lineHeight: 1.1 }}>
                {currentUser.name.split(' ')[0]}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#087EA4', fontWeight: 600 }}>
                {currentUser.role.split(' ')[0]}
              </div>
            </div>
            <ChevronDown size={13} color="#547185" />
          </button>

          {showRoleMenu && (
            <div
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '230px',
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(8, 126, 164, 0.22)',
                borderRadius: '14px',
                boxShadow: '0 14px 36px rgba(6, 59, 92, 0.18)',
                padding: '10px',
                zIndex: 200,
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#7A97AA',
                  marginBottom: '6px',
                  paddingLeft: '4px',
                }}
              >
                Switch Role Profile
              </div>

              {USER_ROLES.map((role) => (
                <div
                  key={role.id}
                  onClick={() => {
                    setCurrentUser(role);
                    setShowRoleMenu(false);
                  }}
                  style={{
                    padding: '7px 8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    background: currentUser.id === role.id ? 'rgba(34, 211, 238, 0.15)' : 'transparent',
                    marginBottom: '3px',
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{role.avatar}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#063B5C' }}>{role.name}</div>
                    <div style={{ fontSize: '0.68rem', color: '#547185' }}>{role.role}</div>
                  </div>
                  {currentUser.id === role.id && <ShieldCheck size={14} color="#087EA4" />}
                </div>
              ))}

              <div style={{ borderTop: '1px solid rgba(8, 126, 164, 0.12)', marginTop: '6px', paddingTop: '6px' }}>
                <button
                  onClick={() => {
                    resetToFactoryData();
                    setShowRoleMenu(false);
                  }}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    padding: '4px 6px',
                    color: '#547185',
                    fontSize: '0.74rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={12} />
                  <span>Reset Demo Data</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
