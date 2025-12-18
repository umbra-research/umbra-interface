import React from 'react';
import { colors, space, radii, shadows, typography, motion } from '../theme';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  if (!isOpen) return null;

  const getSizeWidth = (s: string) => ({
    sm: '400px',
    md: '600px',
    lg: '800px',
  }[s]);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          animation: 'fadeIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: getSizeWidth(size),
          maxWidth: '90vw',
          maxHeight: '90vh',
          background: 'rgba(20, 20, 30, 0.8)', // Deep glass
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: radii.xl,
          boxShadow: `${shadows.glass}, ${shadows.md}`,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1001,
          animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {title && (
          <div
            style={{
              padding: `${space.lg}px ${space.xl}px`,
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              fontSize: '20px',
              fontFamily: typography.h1.fontFamily,
              fontWeight: '700',
              background: colors.accentGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </div>
        )}
        <div style={{ flex: 1, overflow: 'auto', padding: `${space.lg}px ${space.xl}px` }}>
          {children}
        </div>
        {footer && (
          <div
            style={{
              padding: `${space.lg}px`,
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              gap: `${space.md}px`,
              justifyContent: 'flex-end',
              background: 'rgba(0,0,0,0.2)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </>
  );
};
