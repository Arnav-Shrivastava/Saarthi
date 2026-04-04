import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Globe } from 'lucide-react'

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
]

function LanguageSelect({ onSelect }) {
  const [selected, setSelected] = useState(null)

  const handleClick = (lang) => {
    setSelected(lang.name)
    // Brief delay for the spring animation to play before transition
    setTimeout(() => onSelect(lang.name), 300)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full w-full px-4 sm:px-6 py-16">
      <style>{`
        @keyframes shimmer-sweep {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .lang-tile:hover .shimmer-overlay {
          animation: shimmer-sweep 0.6s ease-in-out;
        }
      `}</style>

      <div className="w-full max-w-2xl text-center">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#185FA5] to-[#7F77DD] mb-6 shadow-xl shadow-[#185FA5]/20"
        >
          <Globe className="h-7 w-7 text-white" />
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2"
        >
          Choose Your Language
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted-foreground text-sm mb-10"
        >
          Saarthi will respond in the language you select. You can always change it later.
        </motion.p>

        {/* Language Grid */}
        <div
          className="grid gap-[10px]"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          }}
        >
          {languages.map((lang, i) => {
            const isSelected = selected === lang.name
            return (
              <motion.button
                key={lang.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                  delay: 0.05 * i,
                }}
                whileTap={{
                  scale: 0.94,
                  transition: { type: 'spring', stiffness: 400, damping: 17 },
                }}
                onClick={() => handleClick(lang)}
                className={cn(
                  'lang-tile relative flex flex-col items-center gap-2.5 p-4 rounded-xl bg-white cursor-pointer text-center overflow-hidden transition-all duration-200',
                  isSelected
                    ? 'ring-2 ring-[#FF9933] shadow-[0_0_0_4px_rgba(255,153,51,0.25)]'
                    : 'hover:shadow-md'
                )}
                style={{
                  border: isSelected ? '2px solid #FF9933' : '0.5px solid rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                }}
              >
                {/* Shimmer overlay */}
                <div
                  className="shimmer-overlay absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    backgroundPosition: '-200% 0',
                  }}
                />

                {/* Badge */}
                <span
                  className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold font-mono text-white transition-all duration-200"
                  style={{
                    background: isSelected
                      ? 'linear-gradient(135deg, #FF9933, #E8601C)'
                      : 'linear-gradient(135deg, #185FA5, #7F77DD)',
                  }}
                >
                  {lang.code}
                </span>

                {/* Labels */}
                <div className="relative z-10">
                  <p
                    className="font-medium text-foreground leading-none"
                    style={{ fontSize: '15px', fontWeight: 500 }}
                  >
                    {lang.name}
                  </p>
                  <p className="text-muted-foreground mt-1" style={{ fontSize: '12px' }}>
                    {lang.native}
                  </p>
                </div>
              </motion.button>
            )
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-muted-foreground mt-8"
        >
          More languages coming soon · Voice input supported in all languages
        </motion.p>
      </div>
    </div>
  )
}

export default LanguageSelect
