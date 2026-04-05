import React from 'react';
import { Home, Globe, Target, ShieldAlert, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Sidebar({ activeNav = 'Change Language', onNavigate, isOpen, onClose }) {
  const navItems = [
    { label: 'Home', icon: Home, id: 'landing' },
    { label: 'Change Language', icon: Globe, id: 'language' },
    { label: 'Find My Schemes', icon: Target, id: 'recommend' },
    { label: 'Scam Detector', icon: ShieldAlert, id: 'verify' },
    { label: 'Complaint Drafter', icon: FileText, id: 'draft' },
  ];

  const handleNavClick = (id) => {
    onNavigate(id);
    if (onClose) onClose();
  };

  const sidebarContent = (
    <div
      className="flex flex-col flex-shrink-0 relative h-full w-full"
      style={{
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-medium)',
        padding: '24px 16px',
      }}
    >
      {/* Top section: Logo */}
      <div className="flex flex-col gap-[2px] mb-8 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="var(--brand-indigo)" strokeWidth="2" strokeLinejoin="round" fill="rgba(27, 20, 100, 0.1)" />
            </svg>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '18px', color: 'var(--text-primary)' }}>
              Saarthi
            </span>
          </div>
          {/* Mobile close button */}
          <button onClick={onClose} className="md:hidden p-1 text-muted-foreground hover:bg-[var(--bg-surface-hover)] rounded-md transition-colors">
            <X size={20} />
          </button>
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
              onClick={() => handleNavClick(item.id)}
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
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -20 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="hidden md:block h-full relative z-0 shrink-0"
        style={{ width: '260px' }}
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="md:hidden fixed inset-0 z-50 overflow-hidden flex">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm shadow-2xl"
              onClick={onClose}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
              className="relative w-[260px] h-full shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
