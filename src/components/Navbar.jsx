import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { Menu, Search, Bell, Waves, CircleUserRound } from 'lucide-react';

export default function Navbar({ onToggleSidebar, onOpenSearchModal }) {
  const { currentUser, ponds } = useFarm();
  const [showAlertsMenu, setShowAlertsMenu] = useState(false);

  const activeAlerts = ponds.flatMap((p) =>
    (p.alerts || []).map((a) => ({ ...a, pondName: p.name })),
  );

  return (
    <header
      className="app-navbar"
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
      <div
        className="app-navbar-brand-area"
        style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}
      >
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

        <div
          className="app-navbar-brand"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: '#0B7285',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(8, 126, 164, 0.3)',
              color: '#FFFFFF',
              flexShrink: 0,
            }}
          >
            <Waves size={18} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', minWidth: 0 }}>
            <span
              className="app-navbar-title"
              style={{
                fontFamily: 'Outfit',
                fontWeight: 800,
                fontSize: '1.05rem',
                letterSpacing: '-0.02em',
                color: '#0B7285',
                whiteSpace: 'nowrap',
              }}
            >
              Aqua Flow System
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
        <span
          style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
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

      {/* Right: quick alerts & profile avatar */}
      <div
        className="app-navbar-actions"
        style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
      >
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
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: '#547185',
                    textAlign: 'center',
                    padding: '8px 0',
                  }}
                >
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

        {/* Authenticated user */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            aria-label={`Signed in as ${currentUser.name}`}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1.5px solid rgba(8, 126, 164, 0.22)',
              borderRadius: '12px',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'default',
              height: '36px',
            }}
          >
            <CircleUserRound size={21} color="#0B7285" aria-hidden="true" />
            <span className="mobile-user-initial" aria-hidden="true">
              {currentUser.name?.trim().charAt(0).toUpperCase() || 'U'}
            </span>
            <div style={{ textAlign: 'left' }} className="hide-on-mobile">
              <div
                style={{ fontSize: '0.78rem', fontWeight: 700, color: '#063B5C', lineHeight: 1.1 }}
              >
                {currentUser.name.split(' ')[0]}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#087EA4', fontWeight: 600 }}>
                {currentUser.role.split(' ')[0]}
              </div>
            </div>
            <span aria-hidden="true" style={{ fontSize: '0.68rem', color: '#087EA4' }}>
              Signed in
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
