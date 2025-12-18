import React from 'react';
import { colors, radii, space, shadows, motion } from '../theme';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'outlined' | 'flat';
  hoverable?: boolean;
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', hoverable = false, children, style: customStyle = {}, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const getVariantStyles = (v: string): React.CSSProperties => {
      switch (v) {
        case 'glass':
          return { 
            background: 'rgba(20, 20, 30, 0.4)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          };
        case 'outlined':
          return { 
            background: 'transparent', 
            border: `1px solid ${colors.border}`,
          };
        case 'flat':
          return {
            background: colors.bgElev1,
            border: 'none',
          };
        default: // Default is essentially glass but slightly more opaque
          return { 
            background: colors.surface, 
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          };
      }
    };

    const variantStyle = getVariantStyles(variant);
    
    const baseStyle: React.CSSProperties = {
      borderRadius: radii.lg,
      padding: space.lg,
      ...variantStyle,
      boxShadow: isHovered && hoverable 
        ? `${shadows.md}, ${shadows.glowSm}` 
        : shadows.sm,
      transition: motion.normal,
      transform: isHovered && hoverable ? 'translateY(-2px)' : 'translateY(0)',
      position: 'relative',
      overflow: 'hidden',
    };

    return (
      <div
        ref={ref}
        onMouseEnter={() => hoverable && setIsHovered(true)}
        onMouseLeave={() => hoverable && setIsHovered(false)}
        style={{
          ...baseStyle,
          ...customStyle,
        }}
        {...props}
      >
        {/* Subtle Gradient Overlay for sheen */}
         <div style={{
          position: 'absolute',
          top: 0, 
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </div>
    );
  }
);

Card.displayName = 'Card';
