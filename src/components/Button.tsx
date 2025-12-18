import React from 'react';
import { colors, radii, space, shadows, typography, motion } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    disabled,
    children,
    style: customStyle = {},
    ...props 
  }, ref) => {
    
    // Size styles
    const getSizeStyles = (size: ButtonSize): React.CSSProperties => {
      switch (size) {
        case 'sm': return { padding: `0 ${space.md}px`, fontSize: '13px', height: '36px' };
        case 'md': return { padding: `0 ${space.lg}px`, fontSize: '15px', height: '48px' };
        case 'lg': return { padding: `0 ${space.xl}px`, fontSize: '17px', height: '56px' };
      }
    };

    // Variant styles
    const getVariantStyles = (variant: ButtonVariant): React.CSSProperties => {
      const isDisabled = disabled || loading;
      const baseStyle: React.CSSProperties = {
        borderRadius: radii.full,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: motion.fast,
        fontFamily: typography.fontBody, // Modern sans
        fontWeight: 600,
        letterSpacing: '-0.01em',
        whiteSpace: 'nowrap' as const,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: `${space.sm}px`,
        border: 'none',
        outline: 'none',
        opacity: isDisabled ? 0.6 : 1,
        position: 'relative',
        overflow: 'hidden',
      };

      switch (variant) {
        case 'primary':
          return {
            ...baseStyle,
            background: colors.accentGradient,
            color: colors.accentContrast,
            boxShadow: isDisabled ? 'none' : shadows.glowSm,
          };
        case 'secondary':
          return {
            ...baseStyle,
            background: 'rgba(255, 255, 255, 0.08)',
            color: colors.text,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(8px)',
          };
        case 'ghost':
          return {
            ...baseStyle,
            background: 'transparent',
            color: colors.textSecondary,
          };
        case 'destructive':
          return {
            ...baseStyle,
            background: 'rgba(255, 59, 48, 0.15)',
            color: '#FF3B30',
            border: '1px solid rgba(255, 59, 48, 0.2)',
          };
      }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !loading) {
        e.currentTarget.style.transform = 'scale(0.96)';
      }
      props.onMouseDown?.(e);
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.transform = 'scale(1)';
      props.onMouseUp?.(e);
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !loading) {
        if (variant === 'primary') {
          e.currentTarget.style.boxShadow = shadows.glow;
          e.currentTarget.style.transform = 'translateY(-1px)';
        } else if (variant === 'secondary') {
           e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
           e.currentTarget.style.color = colors.text;
        } else if (variant === 'ghost') {
           e.currentTarget.style.color = colors.accent;
           e.currentTarget.style.background = 'rgba(212, 175, 55, 0.05)';
        }
      }
      props.onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.transform = 'scale(1) translateY(0)';
      e.currentTarget.style.boxShadow = getVariantStyles(variant).boxShadow || 'none';
      
      if (variant === 'secondary') {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.color = colors.text;
      } else if (variant === 'ghost') {
        e.currentTarget.style.color = colors.textSecondary;
        e.currentTarget.style.background = 'transparent';
      }
      
      props.onMouseLeave?.(e);
    };

    const baseStyle = getVariantStyles(variant);

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        style={{
          ...baseStyle,
          ...getSizeStyles(size),
          width: fullWidth ? '100%' : 'auto',
          ...customStyle,
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {loading && <span style={{ 
          width: '1em', 
          height: '1em', 
          border: '2px solid currentColor', 
          borderRightColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite'
        }} />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
