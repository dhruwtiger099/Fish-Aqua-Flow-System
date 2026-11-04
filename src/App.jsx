import React, { useState, useEffect } from 'react';
import { useFarm } from './context/FarmContext';
import BackgroundWaves from './components/BackgroundWaves';
import WaterRipple from './components/WaterRipple';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
import Toast from './components/Toast';
import InstallAppBanner from './components/InstallAppBanner';

import DashboardView from './views/DashboardView';
import FeedingView from './views/FeedingView';
import InventoryView from './views/InventoryView';
import PurchasesView from './views/PurchasesView';
import SalesView from './views/SalesView';
import ReportsView from './views/ReportsView';
import ExpensesView from './views/ExpensesView';
import FishTransfersView from './views/FishTransfersView';
import LoginView from './views/LoginView';

import PondDetailModal from './components/PondDetailModal';
import PurchaseModal from './components/PurchaseModal';
import FeedingModal from './components/FeedingModal';
import HarvestSaleModal from './components/HarvestSaleModal';
import SearchModal from './components/SearchModal';
import { getSession, signIn, signUp } from './services/auth';

export default function App() {
  const { activeTab, selectedPondModal, setSelectedPondModal, syncState, setCurrentUser } =
    useFarm();
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showFeedingModal, setShowFeedingModal] = useState(false);
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [modalTargetPond, setModalTargetPond] = useState(null);

  useEffect(() => {
    getSession()
      .then((session) => {
        if (session.user?.name) {
          setCurrentUser({
            id: 'authenticated-user',
            name: session.user.name,
            role: 'Farm User',
            avatar: session.user.name
              .split(/\s+/)
              .map((part) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase(),
          });
        }
        setAuthenticated(true);
      })
      .catch(() => setAuthenticated(false))
      .finally(() => setAuthLoading(false));
  }, []);

  const handleLogin = async ({ identifier, password, remember }) => {
    const session = await signIn({ identifier, password, remember });
    if (session.user?.name) {
      setCurrentUser({
        id: 'authenticated-user',
        name: session.user.name,
        role: 'Farm User',
        avatar: session.user.name
          .split(/\s+/)
          .map((part) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
      });
    }
    setAuthenticated(true);
  };

  const handleSignup = async (details) => {
    return signUp(details);
  };

  // Desktop sidebar auto-open, mobile auto-close
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Shortcut key for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Mutually exclusive modal management to prevent any overlapping
  const closeAllModals = () => {
    setSelectedPondModal(null);
    setShowPurchaseModal(false);
    setShowFeedingModal(false);
    setShowHarvestModal(false);
    setShowSearchModal(false);
  };

  const openPondDetail = (pond) => {
    closeAllModals();
    setSelectedPondModal(pond);
  };

  const openPurchase = () => {
    closeAllModals();
    setShowPurchaseModal(true);
  };

  const openFeedingForPond = (pond = null) => {
    closeAllModals();
    setModalTargetPond(pond);
    setShowFeedingModal(true);
  };

  const openHarvestForPond = (pond = null) => {
    closeAllModals();
    setModalTargetPond(pond);
    setShowHarvestModal(true);
  };

  const isAnyModalOpen = !!(
    selectedPondModal ||
    showPurchaseModal ||
    showFeedingModal ||
    showHarvestModal ||
    showSearchModal
  );

  // Lock background scroll when any modal is open
  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAnyModalOpen]);

  if (authLoading)
    return (
      <div className="login-loading" role="status">
        Checking secure farm session…
      </div>
    );
  if (!authenticated) return <LoginView onLogin={handleLogin} onSignup={handleSignup} />;

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            onOpenPurchase={openPurchase}
            onOpenFeeding={() => openFeedingForPond(null)}
            onOpenHarvest={() => openHarvestForPond(null)}
            onOpenPondDetail={openPondDetail}
          />
        );
      case 'feeding':
        return <FeedingView onOpenFeeding={() => openFeedingForPond(null)} />;
      case 'inventory':
        return <InventoryView onOpenPurchase={openPurchase} />;
      case 'purchases':
        return <PurchasesView onOpenPurchase={openPurchase} />;
      case 'sales':
        return <SalesView onOpenHarvest={() => openHarvestForPond(null)} />;
      case 'reports':
        return <ReportsView />;
      case 'expenses':
        return <ExpensesView />;
      case 'fish-transfers':
        return <FishTransfersView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
      }}
    >
      {/* Decorative ocean ambient backdrop */}
      <BackgroundWaves />

      {/* Interactive water wave ripple overlay */}
      <WaterRipple />

      {/* Deep Ocean Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          transition: 'padding-left 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          paddingLeft: sidebarOpen && window.innerWidth >= 1024 ? '260px' : '0',
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
        }}
      >
        {/* Sticky Glass Navbar */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenSearchModal={() => {
            closeAllModals();
            setShowSearchModal(true);
          }}
        />

        {/* Prominent Mobile App Install Banner */}
        <InstallAppBanner />
        {syncState.status === 'error' && (
          <div className="data-sync-banner" role="status">
            {syncState.message}
          </div>
        )}

        {/* View Body with bottom safe padding for mobile bottom bar */}
        <main className="main-content-area">{renderActiveView()}</main>

        {/* Ocean Glass Footer (Desktop) */}
        <footer
          className="hide-on-mobile"
          style={{
            padding: '16px 20px',
            textAlign: 'center',
            fontSize: '0.78rem',
            color: '#547185',
            borderTop: '1px solid rgba(8, 126, 164, 0.12)',
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span>
              Copyright © 2026 <strong>Bhupendra Dhruw</strong>. All Rights Reserved.
            </span>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Navigation Dock */}
      <MobileBottomNav onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      {/* Modals with exclusive rendering & solid backdrop */}
      {selectedPondModal && (
        <PondDetailModal
          pond={selectedPondModal}
          onClose={closeAllModals}
          onLogFeeding={openFeedingForPond}
          onRecordHarvest={openHarvestForPond}
        />
      )}

      {showPurchaseModal && <PurchaseModal onClose={closeAllModals} />}

      {showFeedingModal && <FeedingModal initialPond={modalTargetPond} onClose={closeAllModals} />}

      {showHarvestModal && (
        <HarvestSaleModal initialPond={modalTargetPond} onClose={closeAllModals} />
      )}

      {showSearchModal && <SearchModal isOpen={showSearchModal} onClose={closeAllModals} />}

      {/* Toast notifications */}
      <Toast />
    </div>
  );
}
