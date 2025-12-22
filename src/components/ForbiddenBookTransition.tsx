'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from './Providers';

interface ForbiddenBookTransitionProps {
  children: React.ReactNode;
}

export function ForbiddenBookTransition({ children }: ForbiddenBookTransitionProps) {
  const [status, setStatus] = useState<'LOCKED' | 'OPENING' | 'UNLOCKED'>('LOCKED');
  const { setShowUI } = useAppContext();
  
  // Holographic Data
  const [codes, setCodes] = useState<string[]>([]);
  useEffect(() => {
    setCodes(Array.from({ length: 12 }).map(() => 
      `0x${Math.random().toString(16).slice(2, 6).toUpperCase()} // ${Math.random() > 0.5 ? 'SYNC' : 'AUTH'}`
    ));
  }, []);

  // Manage UI
  useEffect(() => {
    setShowUI(status === 'UNLOCKED');
  }, [status, setShowUI]);

  const handleEnter = () => {
    setStatus('OPENING');
    setTimeout(() => {
      setStatus('UNLOCKED');
    }, 2200); // Wait for zoom sequence
  };

  return (
    <>
      <AnimatePresence>
        {status !== 'UNLOCKED' && (
          <motion.div
            key="gate-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1, ease: "easeOut" } }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden perspective-[2000px]"
          >
            {/* === AMBIENCE === */}
            {/* Gold/Lapis Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(212,175,55,0.05),_rgba(5,5,5,1)_60%)] pointer-events-none" />
            <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-20" />
            
            {/* CSS Particles (Stars/Dust) */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse" />
                <div className="absolute top-3/4 left-2/3 w-1 h-1 bg-[#D4AF37] rounded-full animate-pulse delay-700" />
                <div className="absolute top-1/2 left-1/2 w-px h-px bg-white rounded-full shadow-[0_0_10px_white]" />
            </div>

            {/* === 3D OBSIDIAN DIARY === */}
            <motion.div
              initial={{ scale: 0.85, rotateY: 0, rotateX: 10 }}
              animate={{ 
                scale: status === 'OPENING' ? 3.8 : 0.9, 
                rotateY: 0,
                rotateX: status === 'OPENING' ? 0 : 10,
                y: status === 'OPENING' ? 50 : 0,
              }}
              transition={{ duration: 2.2, ease: [0.25, 1, 0.5, 1] }} 
              className="relative w-[340px] h-[500px] md:w-[420px] md:h-[620px] preserve-3d cursor-pointer shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]"
              onClick={handleEnter}
            >
              
              {/* === BACK COVER (Base Station) === */}
              <div className="absolute inset-0 bg-[#050505] rounded-r-xl border-l-[8px] border-[#111] shadow-2xl">
                 {/* Gold Trim */}
                 <div className="absolute inset-0 border border-[#D4AF37]/10 rounded-r-xl" />
                 
                 {/* INNER PAGES BLOCK (Data Core) */}
                 <div className="absolute top-3 bottom-3 left-3 right-4 bg-gradient-to-br from-[#0a0a0a] to-black rounded-r-lg shadow-inner flex flex-col p-6 overflow-hidden border-r border-[#D4AF37]/20 relative preserve-3d">
                    
                    {/* Holographic Projection Layer */}
                    <motion.div 
                      initial={{ opacity: 0, z: 0 }}
                      animate={{ opacity: status === 'OPENING' ? 1 : 0, z: 30 }}
                      transition={{ delay: 0.8, duration: 0.8 }}
                      className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none"
                    >
                        {/* Central Glyph */}
                        <div className="w-32 h-32 rounded-full border border-[#D4AF37]/30 flex items-center justify-center animate-spin-slow shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                            <div className="w-24 h-24 border border-[#26619C]/30 rotate-45" />
                        </div>
                    </motion.div>

                    {/* Scrolling Data Stream */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: status === 'OPENING' ? 0.8 : 0 }}
                      transition={{ delay: 1, duration: 0.5 }}
                      className="mt-8 font-mono text-[9px] md:text-[10px] text-[#D4AF37] space-y-2 z-10 mix-blend-screen"
                    >
                       <div className="border-b border-[#D4AF37]/30 pb-2 mb-4 tracking-[0.2em] text-[#26619C]">SYSTEM_WAKE // UMBRA_OS</div>
                       {codes.map((code, i) => (
                         <div key={i} className="flex justify-between items-center opacity-70">
                           <span className="font-light">{code}</span>
                           <div className="w-1 h-1 bg-[#26619C] rounded-full animate-ping" style={{ animationDelay: `${i * 100}ms`}} />
                         </div>
                       ))}
                    </motion.div>
                 </div>
              </div>

              {/* === FRONT COVER (Obsidian Slab) === */}
              <motion.div
                className="absolute inset-0 bg-black rounded-r-xl shadow-2xl origin-left preserve-3d border-l border-[#222]"
                initial={{ rotateY: 0 }}
                animate={{ rotateY: status === 'OPENING' ? -150 : 0 }}
                transition={{ duration: 1.8, ease: [0.3, 1, 0.4, 1] }}
              >
                  {/* FRONT FACE (Glossy Obsidian) */}
                  <div className="absolute inset-0 backface-hidden rounded-r-xl bg-[#030303] overflow-hidden group">
                      
                      {/* Material Effect: Noise + Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-20" />
                      
                      {/* Gold Geometric Inlay */}
                      <div className="absolute inset-4 border border-[#D4AF37]/40 rounded-sm opacity-60" />
                      <div className="absolute top-0 bottom-0 left-8 w-[1px] bg-[#D4AF37]/20" />

                      {/* Central Seal (Relief) */}
                      <div className="absolute inset-0 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-700">
                          {/* Outer Ring */}
                          <div className={`w-48 h-48 rounded-full border border-[#D4AF37]/10 flex items-center justify-center relative ${status === 'OPENING' ? 'opacity-0 scale-150 blur-lg' : 'opacity-100'} transition-all duration-1000`}>
                             <div className="absolute inset-0 border-t border-[#D4AF37]/40 rounded-full animate-spin-slow" />
                             {/* Inner Core */}
                             <div className="w-24 h-24 bg-gradient-to-b from-[#111] to-black rounded-full border border-[#D4AF37]/30 shadow-[0_0_40px_rgba(0,0,0,0.8)] flex items-center justify-center">
                                <div className="text-[#D4AF37] text-2xl font-serif">U</div>
                             </div>
                          </div>
                      </div>

                      {/* Title */}
                      <div className="absolute bottom-12 w-full text-center">
                        <h1 className="font-serif text-[#888] tracking-[0.4em] text-xs uppercase group-hover:text-[#D4AF37] transition-colors duration-500">
                            The Black Ledger
                        </h1>
                      </div>
                  </div>

                  {/* BACK FACE (Inside Cover) */}
                  <div 
                    className="absolute inset-0 backface-hidden bg-[#080808] rounded-l-xl border-l-[1px] border-[#222]"
                    style={{ transform: 'rotateY(180deg)' }}
                  >
                     <div className="absolute inset-6 border border-[#D4AF37]/10 opacity-30" />
                     <div className="absolute bottom-6 left-6 text-[10px] text-[#444] font-mono tracking-widest">
                        AUTHENTICATED PERSONNEL ONLY
                     </div>
                  </div>
              </motion.div>

              {/* SPINE */}
              <div className="absolute top-0 bottom-0 left-[-16px] w-[16px] bg-[#0a0a0a] rounded-l-md shadow-xl transform-gpu border-r border-[#222]" />

            </motion.div>

            {/* === INITIALIZE BUTTON === */}
            <motion.div
               animate={{ opacity: status === 'OPENING' ? 0 : 1, y: status === 'OPENING' ? 80 : 0 }}
               transition={{ duration: 0.6 }}
               className="relative z-50 mt-16 group"
            >
               <button
                 onClick={handleEnter}
                 className="px-12 py-5 relative bg-black border border-[#D4AF37]/30 overflow-hidden cursor-pointer"
               >
                 {/* Shine Effect */}
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                 
                 <span className="font-mono text-xs tracking-[0.3em] text-[#D4AF37] uppercase group-hover:text-white transition-colors relative z-10">
                   Open The Ledger
                 </span>
               </button>
            </motion.div>

            {/* === TRANSITION FLASH === */}
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: status === 'OPENING' ? [0, 1] : 0 }}
               transition={{ delay: 1.6, duration: 0.6, ease: "easeIn" }}
               className="fixed inset-0 z-[200] bg-white pointer-events-none mix-blend-overlay"
            />

          </motion.div>
        )}
      </AnimatePresence>

      {/* DASHBOARD */}
      <div className={status === 'UNLOCKED' ? "animate-in fade-in duration-1000" : "fixed inset-0 overflow-hidden pointer-events-none"}>
        {children}
      </div>
    </>
  );
}
