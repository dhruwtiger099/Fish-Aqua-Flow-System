import React from 'react';
import { useFarm } from '../context/FarmContext';
import { LayoutDashboard, Utensils, Package, Menu } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'feeding', label: 'Feeding', icon: Utensils },
  { id: 'inventory', label: 'Stock', icon: Package },
];

const SLOT_COUNT = NAV_ITEMS.length + 1; // + "More"

export default function MobileBottomNav({ onToggleSidebar }) {
  const { activeTab, setActiveTab } = useFarm();

  const tabIndex = NAV_ITEMS.findIndex((item) => item.id === activeTab);
  // Pages opened from the drawer rest the bulge under "More".
  const activeIndex = tabIndex === -1 ? NAV_ITEMS.length : tabIndex;

  const slots = [
    ...NAV_ITEMS.map((item) => ({ ...item, onClick: () => setActiveTab(item.id) })),
    { id: 'more', label: 'More', icon: Menu, onClick: onToggleSidebar },
  ];

  return (
    <nav className="mobile-bottom-dock liquid-dock" aria-label="Primary">
      <div className="liquid-dock__track">
        {/* The liquid bulge: slides to the active slot and stretches while it flows. */}
        <div
          className="liquid-dock__bulge"
          aria-hidden="true"
          style={{
            width: `${100 / SLOT_COUNT}%`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        >
          <svg
            key={activeIndex}
            className="liquid-dock__blob"
            viewBox="0 0 120 30"
            preserveAspectRatio="none"
          >
            <path d="M0 30 L0 29 C18 29 26 3 60 3 C94 3 102 29 120 29 L120 30 Z" />
          </svg>
        </div>

        {slots.map((slot, index) => {
          const Icon = slot.icon;
          const isActive = index === activeIndex;
          return (
            <button
              key={slot.id}
              type="button"
              onClick={slot.onClick}
              className={`liquid-dock__item${isActive ? ' is-active' : ''}`}
              aria-current={isActive && slot.id !== 'more' ? 'page' : undefined}
            >
              <span className="liquid-dock__icon">
                <Icon size={isActive ? 20 : 19} strokeWidth={isActive ? 2.3 : 1.8} />
              </span>
              <span className="liquid-dock__label">{slot.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
