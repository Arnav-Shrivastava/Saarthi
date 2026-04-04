import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function AppNavbar({ onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="sticky top-0 z-50 w-full flex items-center justify-between px-6"
      style={{
        height: scrolled ? '52px' : '64px',
        backgroundColor: 'rgba(250, 250, 247, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-soft)',
        transition: 'height 0.2s ease',
      }}
    >
      {/* Left side: Logo */}
      <div className="flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="var(--brand-indigo)" strokeWidth="2" strokeLinejoin="round" fill="rgba(27, 20, 100, 0.1)" />
        </svg>
        <span 
          style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: 'var(--brand-indigo)', fontSize: '18px' }}
        >
          Saarthi
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4 hidden sm:flex">
        <div 
          className="px-3 py-1.5 rounded-full"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-soft)' }}
        >
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Multilingual AI for Citizens
          </span>
        </div>
        <button
          onClick={onGetStarted}
          className="flex items-center gap-1 rounded-full px-4 py-1.5 transition-all"
          style={{
            backgroundColor: 'var(--brand-saffron)',
            color: 'var(--brand-indigo)',
            fontFamily: 'Syne, sans-serif',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          Get Started <span>&rarr;</span>
        </button>
      </div>
    </div>
  );
}

export default AppNavbar;
