import React from 'react';
import { useFarm } from '../context/FarmContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useFarm();

  if (!toasts.length) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color="#16A085" />;
      case 'warning':
        return <AlertTriangle size={18} color="#E9A23B" />;
      case 'danger':
        return <AlertCircle size={18} color="#E05260" />;
      default:
        return <Info size={18} color="#087EA4" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success':
        return 'rgba(22, 160, 133, 0.4)';
      case 'warning':
        return 'rgba(233, 162, 59, 0.4)';
      case 'danger':
        return 'rgba(224, 82, 96, 0.4)';
      default:
        return 'rgba(8, 126, 164, 0.35)';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: 'calc(100% - 48px)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            pointerEvents: 'auto',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1.5px solid ${getBorderColor(toast.type)}`,
            borderRadius: '16px',
            padding: '12px 16px',
            boxShadow: '0 12px 32px rgba(6, 59, 92, 0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            animation: 'fadeInModal 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            {getIcon(toast.type)}
            <span
              style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F2942', lineHeight: 1.35 }}
            >
              {toast.message}
            </span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#7A97AA',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
            }}
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
