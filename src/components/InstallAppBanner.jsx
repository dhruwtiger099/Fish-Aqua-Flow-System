import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';

export default function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone (installed) mode
    const isApp =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandalone(isApp);

    // Check if dismissed in this session
    if (sessionStorage.getItem('aquaflow_install_dismissed') === 'true') {
      setIsDismissed(true);
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.__pwaDeferredPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    const promptEvent = deferredPrompt || window.__pwaDeferredPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        window.__pwaDeferredPrompt = null;
      }
    } else {
      // Fallback instruction for browsers where beforeinstallprompt doesn't fire directly (e.g. iOS Safari)
      alert(
        'To install: Tap your browser menu (3 dots or Share button) and select "Install app" or "Add to Home screen" 📲'
      );
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('aquaflow_install_dismissed', 'true');
  };

  // Don't show if already installed in standalone mode, or dismissed
  if (isStandalone || isDismissed) {
    return null;
  }

  return (
    <aside
      className="install-pwa-banner"
      style={{
        margin: '8px 12px 4px 12px',
        padding: '10px 14px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #063B5C 0%, #087EA4 100%)',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxShadow: '0 4px 18px rgba(6, 59, 92, 0.22)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
        zIndex: 90,
        animation: 'fadeInSlide 0.3s ease-out',
      }}
      role="banner"
      aria-label="Install App Prompt"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <Smartphone size={20} color="#FFFFFF" />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                fontSize: '0.88rem',
                letterSpacing: '-0.01em',
                color: '#FFFFFF',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Install AquaFlow App
            </span>
            <Sparkles size={13} color="#FFD166" />
          </div>
          <p
            style={{
              margin: '2px 0 0 0',
              fontSize: '0.72rem',
              color: 'rgba(255, 255, 255, 0.88)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Faster access • Real app experience
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={handleInstall}
          type="button"
          style={{
            padding: '7px 14px',
            borderRadius: '9px',
            background: '#FFFFFF',
            color: '#063B5C',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.8rem',
            fontFamily: 'Outfit, sans-serif',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.18)',
            whiteSpace: 'nowrap',
            transition: 'transform 0.15s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Download size={14} color="#063B5C" />
          <span>Install Now</span>
        </button>

        <button
          onClick={handleDismiss}
          type="button"
          aria-label="Dismiss install banner"
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={16} />
        </button>
      </div>
    </aside>
  );
}

