'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppContext } from './Providers';

// === THEME COLORS ===
const GOLD = '#D4AF37';
const OBSIDIAN = '#050505';
const PAPER = '#0a0a0a'; // Dark luxury paper
const TEXT_MUTED = '#888';

export function UmbraHomepage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { setShowUI } = useAppContext();

  // Hide Global Nav on Landing Page
  useEffect(() => {
    setShowUI(false);
    return () => setShowUI(true); // Restore on unmount
  }, [setShowUI]);

  // Scroll Progress (0 to 1)
  const { scrollYProgress } = useScroll();

  // Smooth scroll for animation
  const smoothScroll = useSpring(scrollYProgress, { damping: 20, stiffness: 100 });

  // === PAGE FLIP LOGIC ===
  // We have 5 sheets (Front Cover + 3 Inner Sheets + Back Cover logic implied)
  // 0-20% -> Flip Cover
  // 20-40% -> Flip Page 1
  // 40-60% -> Flip Page 2
  // 60-80% -> Flip Page 3
  
  const rotationCover = useTransform(smoothScroll, [0, 0.2], [0, -180]);
  const rotationPage1 = useTransform(smoothScroll, [0.2, 0.4], [0, -180]);
  const rotationPage2 = useTransform(smoothScroll, [0.4, 0.6], [0, -180]);
  const rotationPage3 = useTransform(smoothScroll, [0.6, 0.8], [0, -180]);

  // Z-Index Management (Complex for 3D stacking)
  const zIndexCover = useTransform(smoothScroll, [0, 0.2], [50, 0]);
  const zIndexPage1 = useTransform(smoothScroll, [0.15, 0.4], [40, 10]);
  const zIndexPage2 = useTransform(smoothScroll, [0.35, 0.6], [30, 20]);
  const zIndexPage3 = useTransform(smoothScroll, [0.55, 0.8], [20, 30]);

  const handleLaunch = () => {
    router.push('/dashboard');
  };

  return (
    <div ref={containerRef} className="relative h-[500vh] bg-[#050505] text-white selection:bg-[#D4AF37] selection:text-black">
      
      {/* === PERSISTENT UI LAYER (Z-100) === */}
      <div className="fixed inset-0 z-[100] pointer-events-none">
         {/* Top Right CTA */}
         <div className="absolute top-8 right-8 pointer-events-auto">
            <button 
              onClick={handleLaunch}
              className="px-8 py-3 bg-[#0a0a0a] border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all duration-300 font-serif text-sm tracking-[0.2em] uppercase rounded-sm shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)]"
            >
              Launch App
            </button>
         </div>

         {/* Bottom Scroll Hint */}
         <div className="absolute bottom-8 w-full text-center pointer-events-auto">
            <motion.div 
               style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]) }}
               className="flex flex-col items-center gap-2"
            >
               <span className="font-serif text-[12px] tracking-[0.3em] text-[#D4AF37] animate-pulse">SCROLL TO OPEN</span>
               <div className="w-px h-16 bg-gradient-to-b from-[#D4AF37] to-transparent" />
            </motion.div>
         </div>
         
         {/* Ancient Progress Bar */}
         <div className="absolute bottom-0 left-0 h-1 bg-[#222] w-full">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#D4AF37] via-[#F8E7A6] to-[#D4AF37] shadow-[0_0_15px_#D4AF37]" 
              style={{ width: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]) }} 
            />
         </div>
      </div>


      {/* === STICKY BOOK CONTAINER === */}
      <div className="sticky top-0 h-screen flex items-center justify-center perspective-[1500px]">
        
        {/* Ambient Background - Egyptian Night */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#000_100%)] pointer-events-none" />
        
        {/* Floating Embers/Dust */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-[#D4AF37] rounded-full animate-float delay-100" />
            <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-[#D4AF37] rounded-full animate-float delay-300" />
            <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-[#fff] rounded-full animate-float delay-500" />
        </div>

        {/* === THE BOOK === */}
        <div className="relative w-[360px] h-[540px] md:w-[480px] md:h-[680px] preserve-3d">
            
            {/* --- BACK COVER BASE (Static) --- */}
            <div className="absolute inset-0 bg-[#020202] rounded-r-lg border-l-[6px] border-[#111] shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-center">
                
                {/* Ancient Border Inlay */}
                <div className="absolute inset-4 border double-border border-[#D4AF37]/20 rounded-sm" />

                {/* Back Cover Content (Final Page) */}
                <div className="text-center p-12 space-y-8 opacity-90 relative z-10">
                   <div className="w-20 h-20 mx-auto flex items-center justify-center mb-6 relative">
                      <div className="absolute inset-0 border border-[#D4AF37]/30 rounded-full animate-spin-slow" />
                      <span className="text-4xl text-[#D4AF37] font-serif">Ω</span>
                   </div>
                   <h2 className="font-serif text-3xl text-[#D4AF37] tracking-[0.2em] uppercase">The Cycle Begins</h2>
                   <p className="font-serif text-sm text-[#888] leading-relaxed italic">
                      "To be unseen is to be free."
                   </p>
                   <div className="pt-8">
                      <button onClick={handleLaunch} className="group relative px-8 py-3 bg-transparent overflow-hidden">
                          <span className="absolute inset-0 border border-[#D4AF37]/30 group-hover:border-[#D4AF37] transition-colors duration-500" />
                          <span className="relative font-serif text-[#D4AF37] text-sm tracking-[0.2em] uppercase group-hover:text-white transition-colors">
                              Enter The Protocol
                          </span>
                      </button>
                   </div>
                </div>
            </div>


            {/* --- PAGE 3: SECURITY (Inner Leaf) --- */}
            <BookPage 
               rotation={rotationPage3} 
               zIndex={zIndexPage3}
               frontContent={
                  <PapyrusPage 
                    title="Immutable Math" 
                    subtitle="Zero-Knowledge"
                    text="We do not ask for trust. We provide proof. Using zk-SNARKs, every byte is encrypted before it ever touches the chain."
                    glyph="𓏜" // Ancient Scroll
                    borderColor="#00FFFF"
                  />
               }
               backContent={
                  <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center border-l border-[#333] relative overflow-hidden">
                     <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,#000,#000_10px,#111_10px,#111_20px)]" />
                     <div className="text-[#222] font-serif text-xs rotate-y-180 tracking-[0.5em]">IV</div>
                  </div>
               }
            />


            {/* --- PAGE 2: SOLUTION (Inner Leaf) --- */}
            <BookPage 
               rotation={rotationPage2} 
               zIndex={zIndexPage2}
               frontContent={
                  <PapyrusPage 
                    title="The Shadow Path" 
                    subtitle="Stealth Addressing"
                    text="Umbra generates a spectral address for every transfer. Like footsteps in shifting sand, they disappear the moment they are made. Total dissociation."
                    glyph="𓁹" // Eye of Horus
                    borderColor="#D4AF37"
                  />
               }
               backContent={<EmptyBackPage id="III" />}
            />


            {/* --- PAGE 1: PROBLEM (Inner Leaf) --- */}
            <BookPage 
               rotation={rotationPage1} 
               zIndex={zIndexPage1}
               frontContent={
                  <PapyrusPage 
                    title="The Glass House" 
                    subtitle="Privacy is Dead"
                    text="On Solana, you live in a glass house. Every trade is watched. Every balance tracked. We shatter the glass and give you back the shadows."
                    glyph="𓃠" // Cat?
                    borderColor="#8A2BE2"
                  />
               }
               backContent={<EmptyBackPage id="II" />}
            />


            {/* --- FRONT COVER --- */}
            <BookPage 
               rotation={rotationCover} 
               zIndex={zIndexCover}
               classes="rounded-r-lg border-l border-[#222]"
               frontContent={
                  <div className="w-full h-full bg-[#030303] flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl">
                      {/* Obsidian Gloss Texture */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-30 pointer-events-none" />
                      
                      
                      {/* GOLD FRAME INLAY */}
                      <div className="absolute inset-6 border-2 border-[#D4AF37]/60 rounded-sm">
                         {/* Corner Ornaments */}
                         <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#D4AF37]" />
                         <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#D4AF37]" />
                         <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#D4AF37]" />
                         <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#D4AF37]" />
                      </div>

                      {/* Central Scarab/Sun Symbol */}
                      <div className="relative z-10 w-48 h-48 rounded-full border border-[#D4AF37]/30 flex items-center justify-center mb-12 bg-black shadow-[0_0_50px_rgba(212,175,55,0.1)]">
                          <div className="w-32 h-32 rounded-full border border-[#D4AF37]/50 flex items-center justify-center relative">
                             {/* Rotating Ring */}
                             <div className="absolute inset-0 border-t border-[#D4AF37] rounded-full animate-spin-slow opacity-50" />
                             <span className="text-6xl text-[#D4AF37] font-serif drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]">𓋹</span> 
                          </div>
                      </div>

                      <h1 className="font-serif text-4xl text-[#D4AF37] tracking-[0.4em] uppercase mb-4 drop-shadow-md">Umbra</h1>
                      <span className="font-serif text-[10px] text-[#888] tracking-[0.6em] uppercase">
                          The Hidden Ledger
                      </span>

                      <div className="absolute bottom-12 text-[10px] text-[#444] font-serif tracking-widest">
                          EST. 2025 // EGYPTIAN CYBERPUNK
                      </div>
                  </div>
               }
               backContent={
                  <div className="w-full h-full bg-[#080808] p-8 flex flex-col justify-end border-l border-[#222]">
                      <div className="text-right border-r-2 border-[#D4AF37]/30 pr-4">
                         <div className="text-[#D4AF37] font-serif text-xl italic mb-2 leading-relaxed">"What is known can be controlled.<br/>What is hidden is free."</div>
                         <div className="text-[#555] font-serif text-[10px] uppercase mt-4">-- The High Priest</div>
                      </div>
                  </div>
               }
            />

        </div>
      </div>

    </div>
  );
}

// === COMPONENT: PAPYRUS PAGE ===
function PapyrusPage({ title, subtitle, text, glyph, borderColor }: any) {
   return (
      <div className="w-full h-full relative overflow-hidden bg-[#16120F]">
          {/* Papyrus Texture Generator (CSS) */}
          <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,#3e2723_0px,#3e2723_1px,transparent_1px,transparent_4px)] mix-blend-overlay" />
          <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(0deg,#3e2723_0px,#3e2723_1px,transparent_1px,transparent_3px)] mix-blend-overlay" />
          
          {/* Dirt/Age Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,#000_100%)] opacity-80" />

          {/* Golden Border Frame */}
          <div className="absolute inset-4 border border-[#D4AF37]/20 flex flex-col items-center p-8 md:p-12 text-center">
             
             {/* Header Glyph */}
             <div className="text-6xl mb-8 text-[#D4AF37] drop-shadow-[0_0_10px_rgba(212,175,55,0.4)] opacity-90">{glyph}</div>
             
             <h3 className="font-mono text-[10px] tracking-[0.4em] text-[#888] uppercase mb-4">{subtitle}</h3>
             <h2 className="font-serif text-3xl md:text-4xl text-[#E0D0C0] mb-8 leading-tight drop-shadow-md">{title}</h2>
             
             <div className="w-12 h-px bg-[#D4AF37]/50 mb-8" />
             
             <p className="font-serif text-sm md:text-base text-[#aaa] leading-loose tracking-wide italic">
                {text}
             </p>

             {/* Footer Mark */}
             <div className="mt-auto opacity-30 text-[#D4AF37] text-2xl">
                𓆣
             </div>
          </div>
      </div>
   );
}

// === HELPER COMPONENTS ===

function BookPage({ rotation, zIndex, frontContent, backContent, classes = "" }: any) {
  return (
    <motion.div 
      style={{ rotateY: rotation, zIndex }}
      className={`absolute inset-0 origin-left preserve-3d transition-shadow duration-500 shadow-xl ${classes}`}
    >
        {/* Front Face */}
        <div className="absolute inset-0 backface-hidden bg-[#0a0a0a] overflow-hidden rounded-r-md">
           {frontContent}
        </div>

        {/* Back Face */}
        <div 
           className="absolute inset-0 backface-hidden bg-[#080808] overflow-hidden rounded-l-md"
           style={{ transform: 'rotateY(180deg)' }}
        >
           {backContent}
        </div>
    </motion.div>
  );
}

function EmptyBackPage({ id }: { id: string }) {
   return (
      <div className="w-full h-full bg-[#0c0c0c] flex items-center justify-center border-l border-[#333] relative">
         
         <div className="text-[#333] font-serif text-[80px] font-bold opacity-10 transform rotate-y-180 select-none">
            {id}
         </div>
      </div>
   );
}
