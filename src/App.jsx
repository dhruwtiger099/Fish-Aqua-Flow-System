import React, { useState, useEffect } from 'react';
import { useFarm } from './context/FarmContext';
import BackgroundWaves from './components/BackgroundWaves';
import Navbar from './components/Navbar';
import AppSkeleton from './components/AppSkeleton';
import Sidebar from './components/Sidebar';
import {
  DESKTOP_MIN_WIDTH,
  SIDEBAR_EXPANDED_WIDTH,
  SIDEBAR_RAIL_WIDTH,
} from './shared/config/layout';

const SIDEBAR_PREF_KEY = 'fms.sidebar';

function readSidebarExpandedPref() {
  try {
    return window.localStorage.getItem(SIDEBAR_PREF_KEY) !== 'collapsed';
  } catch {
    return true;
  }
}
import MobileBottomNav from './components/MobileBottomNav';
import Toast from './components/Toast';

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
import { getSession, signIn, signUp, signOut } from './services/auth';

export default function App() {
  const {
    activeTab,
    selectedPondModal,
    setSelectedPondModal,
    syncState,
    setCurrentUser,
    addToast,
  } = useFarm();
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= DESKTOP_MIN_WIDTH);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showFeedingModal, setShowFeedingModal] = useState(false);
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [modalTargetPond, setModalTargetPond] = useState(null);
  const [hasActiveOverlay, setHasActiveOverlay] = useState(false);
  const lastBackPressTimeRef = React.useRef(0);

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

  const handleLogout = async () => {
    try {
      await signOut();
      setAuthenticated(false);
    } catch (error) {
      addToast(error.message || 'Logout failed. Please try again.', 'warning');
    }
  };

  // Desktop: sidebar is either expanded or collapsed to an icon rail (choice remembered).
  // Mobile: sidebar is a slide-in drawer that starts closed.
  // State only resets when the viewport crosses the desktop breakpoint.
  useEffect(() => {
    let lastDesktop = null;
    const handleResize = () => {
      const desktop = window.innerWidth >= DESKTOP_MIN_WIDTH;
      if (desktop === lastDesktop) return;
      lastDesktop = desktop;
      setIsDesktop(desktop);
      setSidebarOpen(desktop ? readSidebarExpandedPref() : false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    try {
      window.localStorage.setItem(SIDEBAR_PREF_KEY, sidebarOpen ? 'expanded' : 'collapsed');
    } catch {
      /* storage unavailable: preference simply isn't remembered */
    }
  }, [isDesktop, sidebarOpen]);

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

  const markLifecyclePondHarvested = (cycleId, pondName) => {
    try {
      const key = 'aquaflow_fish_cycles';
      const cycles = JSON.parse(localStorage.getItem(key) || '[]');
      const nextCycles = cycles.map((cycle) =>
        cycle.id === cycleId
          ? {
              ...cycle,
              harvestedPonds: { ...(cycle.harvestedPonds || {}), [pondName]: true },
            }
          : cycle,
      );
      localStorage.setItem(key, JSON.stringify(nextCycles));
      window.dispatchEvent(new CustomEvent('aquaflow-cycle-updated'));
    } catch {
      // Keep the sale saved even if lifecycle history cannot be updated.
    }
  };

  const isAnyModalOpen = !!(
    selectedPondModal ||
    showPurchaseModal ||
    showFeedingModal ||
    showHarvestModal ||
    showSearchModal
  );

  // Monitor any active modal in App state or child views
  useEffect(() => {
    const checkModal = () => {
      const modalInDom = document.querySelector('.modal-overlay');
      const isOpen = Boolean(modalInDom || isAnyModalOpen);
      setHasActiveOverlay(isOpen);
      if (isOpen) {
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
      } else {
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
      }
    };

    checkModal();
    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    };
  }, [isAnyModalOpen]);

  // Handle mobile hardware back button and browser back
  useEffect(() => {
    // Seed history stack so back button can be intercepted
    window.history.replaceState({ appRoot: true }, '');
    window.history.pushState({ appHome: true }, '');

    const handlePopState = () => {
      const modalInDom = document.querySelector('.modal-overlay');
      const isModalActive = isAnyModalOpen || Boolean(modalInDom);

      // 1. If any modal form is open, close it and stay in app
      if (isModalActive) {
        closeAllModals();
        window.dispatchEvent(new CustomEvent('close-active-modal'));
        window.history.pushState({ appHome: true }, '');
        return;
      }

      // 2. If mobile sidebar navigation is open, close it and stay in app
      if (sidebarOpen && window.innerWidth < 1024) {
        setSidebarOpen(false);
        window.history.pushState({ appHome: true }, '');
        return;
      }

      // 3. User is on dashboard/main screen: require double back within 2.5s to exit
      const now = Date.now();
      const elapsed = now - lastBackPressTimeRef.current;

      if (elapsed < 2500) {
        // Double-tap detected: allow exit
      } else {
        lastBackPressTimeRef.current = now;
        window.history.pushState({ appHome: true }, '');
        if (addToast) {
          addToast('Press back again to exit Aqua Flow', 'info');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAnyModalOpen, sidebarOpen, addToast]);

  if (authLoading) return <AppSkeleton />;
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
        return <FishTransfersView onOpenHarvest={openHarvestForPond} />;
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

      {/* Deep Ocean Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen || isDesktop}
        collapsed={isDesktop && !sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          transition: 'padding-left 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          paddingLeft: isDesktop
            ? `${sidebarOpen ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_RAIL_WIDTH}px`
            : '0',
          position: 'relative',
          zIndex: 'auto',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
        }}
      >
        {/* Sticky Glass Navbar */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onLogout={handleLogout}
          onOpenSearchModal={() => {
            closeAllModals();
            setShowSearchModal(true);
          }}
        />
        {syncState.status === 'error' && (
          <div className="data-sync-banner" role="status">
            {syncState.message}
          </div>
        )}

        {/* View Body with bottom safe padding for mobile bottom bar */}
        <main className="main-content-area">{renderActiveView()}</main>

        {/* Ghost styled subtle copyright footer */}
        <footer className="app-footer-copyright">
          <span>
            Copyright © 2026 Bhupendra Dhruw. All Rights Reserved.
          </span>
        </footer>
      </div>

      {/* Mobile Bottom Navigation Dock (Hidden whenever any modal is open) */}
      {!hasActiveOverlay && (
        <MobileBottomNav onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      )}

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
        <HarvestSaleModal
          initialPond={modalTargetPond?.pond || modalTargetPond}
          initialCycle={modalTargetPond?.cycle}
          initialHarvestPonds={modalTargetPond?.harvestPonds}
          initialHarvestPond={modalTargetPond?.harvestPond}
          onHarvestRecorded={markLifecyclePondHarvested}
          onClose={closeAllModals}
        />
      )}

      {showSearchModal && <SearchModal isOpen={showSearchModal} onClose={closeAllModals} />}

      {/* Toast notifications */}
      <Toast />
    </div>
  );
}
