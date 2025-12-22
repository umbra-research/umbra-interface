'use client';

import React, { useState } from 'react';
import gsap from 'gsap';

interface SealProps {
  onBreak: () => void;
}

export function Seal({ onBreak }: SealProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isBroken, setIsBroken] = useState(false);
  
  const handleBreak = () => {
    if (isBroken) return;
    setIsBroken(true);
    
    // Play sound if we had one, but visual feedback is key
    onBreak();

    // GSAP animation for breaking
    const timeline = gsap.timeline();
    timeline.to('.seal-path', {
      strokeDashoffset: 0,
      duration: 1,
      ease: 'power2.inOut',
      stagger: 0.1,
    })
    .to('.seal-container', {
      scale: 1.5,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
    }, '+=0.2');
  };

  return (
    <div 
      className="seal-wrapper"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleBreak}
      style={{ cursor: 'pointer', position: 'relative', zIndex: 10 }}
    >
      <svg 
        className="seal-container"
        width="200" 
        height="200" 
        viewBox="0 0 200 200"
        style={{
          transition: 'transform 0.3s ease, filter 0.3s ease',
          transform: isHovering ? 'scale(1.05)' : 'scale(1)',
          filter: isHovering ? 'drop-shadow(0 0 20px #D4AF37)' : 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.3))'
        }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Outer Ring */}
        <circle cx="100" cy="100" r="90" stroke="#D4AF37" strokeWidth="2" fill="none" opacity="0.8" />
        <circle cx="100" cy="100" r="85" stroke="#D4AF37" strokeWidth="1" fill="none" opacity="0.5" strokeDasharray="5,5" />

        {/* Inner Mystical Symbols (Abstract representation) */}
        <path d="M100 20 L100 180 M20 100 L180 100" stroke="#D4AF37" strokeWidth="1" opacity="0.3" />
        <rect x="58" y="58" width="84" height="84" transform="rotate(45 100 100)" stroke="#D4AF37" strokeWidth="1" fill="none" opacity="0.6" />

        {/* The Seal "Wax" */}
        <circle 
          cx="100" 
          cy="100" 
          r="40" 
          fill={isHovering ? '#9945FF' : '#1a1a1a'} 
          stroke="#D4AF37" 
          strokeWidth="2"
          style={{ transition: 'fill 0.3s ease' }}
        />
        
        {/* Text */}
        <text 
          x="100" 
          y="105" 
          textAnchor="middle" 
          fill="#D4AF37" 
          fontSize="10" 
          fontFamily="Cinzel, serif"
          letterSpacing="1"
          style={{ pointerEvents: 'none' }}
        >
          BREAK SEAL
        </text>
        
        {/* Fracture Lines (Hidden initially) */}
        {isBroken && (
           <g className="fractures">
             {/* Add fracture paths here if complex, for now we animate opacity/scale */}
           </g>
        )}
      </svg>
    </div>
  );
}
