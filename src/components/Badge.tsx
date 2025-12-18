import React from 'react';
import { colors, space, radii, typography } from '../theme';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
  size?: 'sm' | 'md';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', children, style, ...props }, ref) => {
    const getVariantStyles = (v: string) => {
      switch (v) {
        case 'success':
          return { background: 'rgba(0, 224, 150, 0.15)', color: '#00E096', border: '1px solid rgba(0, 224, 150, 0.2)' };
        case 'warning':
          return { background: 'rgba(255, 185, 0, 0.15)', color: '#FFB900', border: '1px solid rgba(255, 185, 0, 0.2)' };
        case 'danger':
          return { background: 'rgba(255, 59, 48, 0.15)', color: '#FF3B30', border: '1px solid rgba(255, 59, 48, 0.2)' };
        case 'info':
          return { background: 'rgba(0, 122, 255, 0.15)', color: '#007AFF', border: '1px solid rgba(0, 122, 255, 0.2)' };
        case 'accent':
          return { background: 'rgba(212, 175, 55, 0.15)', color: colors.accent, border: `1px solid ${colors.accent}` };
        default:
          return { background: 'rgba(255, 255, 255, 0.1)', color: colors.textSecondary, border: '1px solid rgba(255, 255, 255, 0.1)' };
      }
    };

    const sizeStyles = size === 'sm'
      ? { padding: `2px ${space.sm}px`, fontSize: '11px' }
      : { padding: `4px ${space.md}px`, fontSize: '13px' };

    return (
      <span
        ref={ref}
        style={{
          ...getVariantStyles(variant),
          ...sizeStyles,
          borderRadius: radii.full, // Pills
          fontFamily: typography.fontBody, // Inter
          fontWeight: '600',
          display: 'inline-block',
          whiteSpace: 'nowrap',
          letterSpacing: '0.01em',
          backdropFilter: 'blur(4px)',
          ...style,
        }}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
