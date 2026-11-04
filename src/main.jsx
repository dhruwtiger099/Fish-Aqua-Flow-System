import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { FarmProvider } from './context/FarmContext.jsx';
import { Button } from './shared/ui';
import './styles/theme.css';
import './style.css';
import './styles/design-system.css';

class AppErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            padding: 24,
            background: '#EBF8FA',
            color: '#063B5C',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: 620,
              padding: 24,
              borderRadius: 16,
              background: '#fff',
              boxShadow: '0 12px 35px rgba(6,59,92,.14)',
            }}
          >
            <h2>Aqua Flow System temporarily stopped</h2>
            <p style={{ color: '#547185' }}>
              A data record or sheet response caused an error. Refresh the app after correcting the
              source data.
            </p>
            <pre style={{ whiteSpace: 'pre-wrap', color: '#B42318', fontSize: 12 }}>
              {this.state.error.message}
            </pre>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Reload app
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <FarmProvider>
        <App />
      </FarmProvider>
    </AppErrorBoundary>
  </React.StrictMode>,
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
