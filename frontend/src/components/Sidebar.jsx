import React from 'react';
import { Home, Globe, Target, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

function Sidebar({ activeNav = 'Change Language', onNavigate }) {
  const navItems = [
    { label: 'Home', icon: Home, id: 'landing' },
    { label: 'Change Language', icon: Globe, id: 'language' },
    { label: 'Find My Schemes', icon: Target, id: 'recommend' },
    { label: 'Scam Detector', icon: ShieldAlert, id: 'verify' },
  ];

  return (
    <motion.aside
      initial={{ x: -20 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="hidden md:flex flex-col flex-shrink-0 relative"
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-medium)',
        padding: '24px 16px',
        height: '100%',
      }}
    >
      {/* Top section: Logo */}
      <div className="flex flex-col gap-[2px] mb-8">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="var(--brand-indigo)" strokeWidth="2" strokeLinejoin="round" fill="rgba(27, 20, 100, 0.1)" />
          </svg>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '18px', color: 'var(--text-primary)' }}>
            Saarthi
          </span>
        </div>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'var(--text-tertiary)', marginLeft: '32px' }}>
          AI for Citizens
        </span>
      </div>

      {/* Navigation links */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = activeNav === item.label;
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.id)}
              className="relative flex items-center gap-[10px] w-full text-left overflow-hidden group transition-all"
              style={{
                height: '44px',
                borderRadius: '12px',
                padding: '0 14px',
                backgroundColor: isActive ? 'var(--brand-saffron-bg)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--brand-saffron)' : '3px solid transparent',
              }}
            >
              {/* Hover bg effect */}
              {!isActive && (
                <div 
                  className="absolute inset-0 bg-[var(--bg-surface-hover)] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-out z-0"
                />
              )}
              
              <Icon 
                className="relative z-10 transition-colors duration-200"
                size={18} 
                style={{ color: isActive ? 'var(--brand-saffron)' : 'var(--text-tertiary)' }}
              />
              <span 
                className="relative z-10 transition-colors duration-200 w-full"
                style={{ 
                  fontFamily: 'DM Sans, sans-serif', 
                  fontSize: '14px', 
                  fontWeight: 500,
                  color: isActive ? 'var(--brand-indigo)' : 'var(--text-secondary)'
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom version pill */}
      <div 
        className="absolute animate-pulse"
        style={{
          bottom: '20px',
          left: '16px',
        }}
      >
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '4px 10px',
          borderRadius: '20px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '11px',
          color: 'var(--text-tertiary)',
          animation: 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}>
          v1.0.0 · GPT-5
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </motion.aside>
  );
}

export default Sidebar;
