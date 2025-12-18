import React from 'react';
import { colors, space, shadows, radii } from '../theme';

export interface ToastProps {
  type: 'success' | 'danger' | 'info' | 'warning';
  message: string;
  onClose?: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ type, message, onClose, duration = 3000 }) => {
  React.useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success': 
        return { background: colors.successLight, color: colors.success, border: `1px solid ${colors.success}` };
      case 'danger': 
        return { background: colors.dangerLight, color: colors.danger, border: `1px solid ${colors.danger}` };
      case 'warning': 
        return { background: colors.warningLight, color: colors.warning, border: `1px solid ${colors.warning}` };
      case 'info': 
        return { background: colors.infoLight, color: colors.info, border: `1px solid ${colors.info}` };
    }
  };

  return (
    <div
      style={{
        ...getTypeStyles(),
        padding: `${space.lg}px`,
        borderRadius: `${radii.md}px`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: `${space.lg}px`,
        minWidth: '300px',
        boxShadow: shadows.lg,
        animation: 'slideUp 0.3s ease',
      }}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '18px',
            padding: 0,
            opacity: 0.7,
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Toast;
