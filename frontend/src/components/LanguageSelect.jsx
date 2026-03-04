import React from 'react'
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
  return (
    <div className="flex flex-col items-center justify-center min-h-full w-full px-4 sm:px-6 py-16">
      <div className="w-full max-w-2xl text-center">
        {/* Icon */}
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-muted/40 mb-6 shadow-sm">
          <Globe className="h-6 w-6 text-muted-foreground" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">
          Choose Your Language
        </h1>
        <p className="text-muted-foreground text-sm mb-10">
          Saarthi will respond in the language you select. You can always change it later.
        </p>

        {/* Language Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {languages.map((lang) => (
            <button
              key={lang.name}
              onClick={() => onSelect(lang.name)}
              className={cn(
                'group flex flex-col items-center gap-2.5 p-4 rounded-xl border border-border/60 bg-background',
                'hover:border-primary/30 hover:bg-muted/40 hover:shadow-sm',
                'transition-all duration-150 cursor-pointer text-center'
              )}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted border border-border/60 text-xs font-bold font-mono text-primary group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-150">
                {lang.code}
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground leading-none">{lang.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{lang.native}</p>
              </div>
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          More languages coming soon · Voice input supported in all languages
        </p>
      </div>
    </div>
  )
}

export default LanguageSelect
