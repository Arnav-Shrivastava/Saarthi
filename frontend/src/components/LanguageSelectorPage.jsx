import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageTile from './LanguageTile';

const languages = [
  { name: 'English', native: 'English', code: 'EN' },
  { name: 'Hindi', native: 'हिन्दी', code: 'HI' },
  { name: 'Tamil', native: 'தமிழ்', code: 'TA' },
  { name: 'Telugu', native: 'తెలుగు', code: 'TE' },
  { name: 'Bengali', native: 'বাংলা', code: 'BN' },
  { name: 'Marathi', native: 'मराठी', code: 'MR' },
  { name: 'Kannada', native: 'ಕನ್ನಡ', code: 'KN' },
  { name: 'Gujarati', native: 'ગુજરાતી', code: 'GU' },
  { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', code: 'PA' },
  { name: 'Malayalam', native: 'മലയാളം', code: 'ML' },
];

function LanguageSelectorPage({ onSelect }) {
  const [selectedLang, setSelectedLang] = useState(null);

  const handleTileClick = (lang) => {
    setSelectedLang(lang.name);
  };

  const handleContinue = () => {
    if (selectedLang) {
      onSelect(selectedLang);
    }
  };

  return (
    <div 
      className="relative flex flex-col items-center flex-1 w-full overflow-y-auto"
      style={{
        backgroundColor: 'var(--bg-base)',
      }}
    >


      {/* Main Content Area */}
      <div className="relative z-10 w-full flex flex-col items-center pt-14 pb-32">
        {/* Globe icon container */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
          className="flex items-center justify-center mb-5"
          style={{
            width: '72px',
            height: '72px',
            background: 'linear-gradient(135deg, var(--brand-indigo) 0%, #2D2A8A 100%)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(27,20,100,0.18)',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '36px',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}
        >
          Choose Your Language
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.48 }}
          className="text-center mt-3"
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '16px',
            fontWeight: 400,
            color: 'var(--text-secondary)',
            maxWidth: '420px',
          }}
        >
          Saarthi will respond in the language you select. You can always change it later.
        </motion.p>

        {/* Language Grid */}
        <div 
          className="w-full max-w-[720px] px-6 mt-9 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
        >
          {languages.map((lang, index) => (
            <LanguageTile
              key={lang.code}
              lang={lang}
              index={index}
              isSelected={selectedLang === lang.name}
              onClick={handleTileClick}
            />
          ))}
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-7 flex items-center justify-center gap-2"
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '13px',
            color: 'var(--text-tertiary)',
          }}
        >
          <span>More languages coming soon</span>
          <span style={{ color: 'var(--brand-saffron)' }}>·</span>
          <span>Voice input supported in all languages</span>
        </motion.div>

      </div>

      {/* Continue Button */}
      <AnimatePresence>
        {selectedLang && (
          <motion.button
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(255,159,28,0.45)' }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={handleContinue}
            className="fixed z-50 flex items-center gap-2"
            style={{
              bottom: '32px',
              backgroundColor: 'var(--brand-saffron)',
              color: 'var(--brand-indigo)',
              fontFamily: 'Syne, sans-serif',
              fontWeight: 600,
              fontSize: '16px',
              padding: '14px 40px',
              borderRadius: '50px',
              boxShadow: '0 8px 32px rgba(255,159,28,0.35)',
            }}
          >
            Continue with {selectedLang} <span>&rarr;</span>
          </motion.button>
        )}
      </AnimatePresence>


    </div>
  );
}

export default LanguageSelectorPage;
