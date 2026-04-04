import React from 'react';
import { motion } from 'framer-motion';

function LanguageTile({ lang, isSelected, onClick, index }) {
  // Entrance animation: opacity 0, translateY(20px), scale(0.96)
  // Animate: opacity 1, translateY(0), scale(1)
  // Spring: stiffness 200, damping 22
  // Delay: index × 0.04s

  const tileVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 22,
        delay: index * 0.04,
      }
    }
  };

  const badgeGradient = isSelected 
    ? 'linear-gradient(135deg, #FF9F1C 0%, #E8850A 100%)' 
    : 'linear-gradient(135deg, var(--brand-indigo) 0%, #3730A3 100%)';

  return (
    <motion.button
      variants={tileVariants}
      initial="hidden"
      animate="visible"
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02, y: -4, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
      onClick={() => onClick(lang)}
      className="relative flex flex-col items-center cursor-pointer w-full"
      style={{
        backgroundColor: isSelected ? 'var(--brand-saffron-bg)' : 'var(--bg-surface)',
        border: isSelected ? '2px solid var(--brand-saffron)' : '1px solid var(--border-soft)',
        borderRadius: '16px',
        padding: '20px 12px',
        gap: '10px',
        transition: 'background-color 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: isSelected 
          ? '0 8px 24px rgba(255,159,28,0.18)' 
          : '0 4px 12px rgba(27,20,100,0.02)', // Default soft shadow; hover shadow handled via CSS classes or motion
      }}
    >
      {/* 2-letter badge */}
      <div 
        className="flex items-center justify-center font-bold text-white transition-all duration-200"
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: badgeGradient,
          fontFamily: 'Syne, sans-serif',
          fontSize: '14px',
          boxShadow: isSelected ? '0 6px 16px rgba(255,159,28,0.28)' : '0 4px 12px rgba(27,20,100,0.2)',
        }}
      >
        {lang.code}
      </div>

      <div className="flex flex-col items-center">
        <span style={{ 
          fontFamily: 'Syne, sans-serif', 
          fontWeight: 500, 
          fontSize: '15px', 
          color: isSelected ? 'var(--brand-indigo)' : 'var(--text-primary)',
          transition: 'color 0.22s ease'
        }}>
          {lang.name}
        </span>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--text-tertiary)' }}>
          {lang.native}
        </span>
      </div>

      {/* Selected Checkmark */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          className="absolute -top-2 -right-2 flex items-center justify-center rounded-full"
          style={{ width: '22px', height: '22px', backgroundColor: 'var(--brand-saffron)', border: '2px solid var(--bg-base)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </motion.div>
      )}

      {/* Hover styles for non-selected state handled here since inline pseudo-classes aren't ideal without emotion/styled */}
      <style>{`
        button:not([style*="border: 2px solid"]) {
          /* target non-selected hover */
        }
        button:hover:not([style*="border: 2px solid"]) {
          background-color: var(--bg-surface-hover) !important;
          border-color: var(--border-medium) !important;
          box-shadow: 0 8px 24px rgba(27,20,100,0.08) !important;
        }
        button:hover:not([style*="border: 2px solid"]) > div:first-child {
          box-shadow: 0 6px 16px rgba(27,20,100,0.28) !important;
        }
      `}</style>
    </motion.button>
  );
}

export default LanguageTile;
