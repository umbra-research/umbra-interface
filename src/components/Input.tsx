import React from 'react';
import { colors, radii, space, shadows, typography, motion } from '../theme';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  success?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    success,
    prefix,
    suffix,
    clearable,
    onClear,
    disabled,
    value,
    onFocus: customOnFocus,
    onBlur: customOnBlur,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const hasValue = Boolean(value);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      customOnFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      customOnBlur?.(e);
    };
    
    return (
      <div style={{ width: '100%' }}>
        {label && (
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontFamily: typography.h3.fontFamily, // Inter
              fontWeight: '600',
              color: isFocused ? colors.accent : colors.textSecondary,
              marginBottom: `${space.xs}px`,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: motion.fast,
            }}
          >
            {label}
          </label>
        )}
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            borderRadius: radii.md,
            // Minimalist styling: Filled background, border only on focus
            border: `1px solid ${
              error ? colors.danger : 
              success ? colors.success : 
              isFocused ? 'rgba(212, 175, 55, 0.5)' : 
              'rgba(255, 255, 255, 0.05)'
            }`,
            backgroundColor: disabled ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
            boxShadow: isFocused ? shadows.glowSm : 'none',
            transition: motion.normal,
            height: '48px',
          }}
        >
          {prefix && (
            <span style={{ paddingLeft: `${space.lg}px`, color: colors.textSecondary, flexShrink: 0 }}>
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            disabled={disabled}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              color: colors.text,
              padding: `0 ${space.lg}px`,
              fontSize: '15px',
              outline: 'none',
              fontFamily: typography.fontBody,
              width: '100%',
              height: '100%',
              letterSpacing: '-0.01em',
            }}
            placeholder={props.placeholder}
            {...props}
          />
          {(clearable && hasValue && !disabled) && (
            <button
              onClick={onClear}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: `${space.md}px`,
                color: colors.textSecondary,
                display: 'flex',
                alignItems: 'center',
                transition: motion.fast,
                flexShrink: 0,
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.text}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}
            >
              ✕
            </button>
          )}
          {suffix && !clearable && (
            <span style={{ paddingRight: `${space.lg}px`, color: colors.textSecondary, fontSize: '13px', fontWeight: '500' }}>
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <div style={{
            fontSize: '12px',
            color: colors.danger,
            marginTop: `${space.xs}px`,
            fontFamily: typography.fontBody,
            animation: 'fadeIn 0.2s',
          }}>
            {error}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
