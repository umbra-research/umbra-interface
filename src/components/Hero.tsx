'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export const Hero = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleBreakSeal = () => {
    setIsOpen(true);
    // Delay navigation for animation
    setTimeout(() => {
        router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="relative h-[80vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Book / Seal Animation */}
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative z-20 text-center"
        >
            <h1 className="text-6xl md:text-9xl font-bold font-cinzel text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-700 mb-8 drop-shadow-2xl">
                THE FORBIDDEN LEDGER
            </h1>
            
            <p className="max-w-xl mx-auto text-amber-200/60 text-lg mb-12 font-mono">
                Silence is the only true currency. Transact without trace, vanish without a whisper.
            </p>

            <motion.button
                onClick={handleBreakSeal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-12 py-4 bg-transparent border border-amber-500/30 overflow-hidden"
            >
                <div className="absolute inset-0 w-0 bg-amber-600/20 transition-all duration-[250ms] ease-out group-hover:w-full" />
                <span className="relative text-amber-100 font-cinzel text-xl tracking-[0.2em] group-hover:text-white transition-colors">
                    BREAK THE SEAL
                </span>
            </motion.button>
        </motion.div>

        {/* Transition Overlay */}
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-50 bg-[#050505] flex items-center justify-center"
            >
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 20, opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeIn" }}
                    className="w-32 h-32 rounded-full bg-amber-500 blur-3xl"
                />
            </motion.div>
        )}
    </div>
  );
};
