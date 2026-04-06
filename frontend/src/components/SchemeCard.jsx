import React, { useEffect } from 'react'
import { Volume2, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORY_COLORS, getT } from '@/lib/translations'

const langMap = {
    English: 'en-US', Hindi: 'hi-IN', Tamil: 'ta-IN', Telugu: 'te-IN',
    Marathi: 'mr-IN', Bengali: 'bn-IN', Kannada: 'kn-IN', Gujarati: 'gu-IN',
    Punjabi: 'pa-IN', Malayalam: 'ml-IN',
}

function SchemeCard({ scheme, language, onLearnMore }) {
    const t = getT(language)
    const colors = CATEGORY_COLORS[scheme.category] || CATEGORY_COLORS['Social Security']

    // Cleanup TTS on unmount to prevent floating audio when navigating away
    useEffect(() => {
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const handleListen = () => {
        if (!('speechSynthesis' in window)) return

        // Cancel any ongoing speech
        window.speechSynthesis.cancel()

        const text = `${scheme.name}. ${scheme.description}. ${t.benefit}: ${scheme.benefit}`
        const utterance = new SpeechSynthesisUtterance(text)
        const langCode = langMap[language] || 'en-US'
        utterance.lang = langCode
        utterance.rate = 0.9

        // Smart Voice Selection: Try to find a natural/premium voice for the language
        const voices = window.speechSynthesis.getVoices()

        // Priority 1: High-quality/Natural voices for the specific language
        // Priority 2: Any voice for that language
        // Priority 3: Default system voice
        const bestVoice =
            voices.find(v => v.lang === langCode && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))) ||
            voices.find(v => v.lang === langCode) ||
            voices.find(v => v.default)

        if (bestVoice) {
            utterance.voice = bestVoice
        }

        window.speechSynthesis.speak(utterance)
    }

    return (
        <div 
          className={cn(
            'group relative flex flex-col p-6 transition-all duration-300',
            'hover:shadow-2xl hover:-translate-y-1'
          )}
          style={{
            borderRadius: '24px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-soft)',
            boxShadow: '0 8px 32px rgba(27,20,100,0.04)'
          }}
        >
            {/* Category badge */}
            <div className="flex items-center justify-between mb-4">
                <span 
                  className={cn(
                    'inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm',
                    colors.bg, colors.text, colors.border
                  )}
                  style={{ fontFamily: 'Syne, sans-serif' }}
                >
                    <span className={cn('h-2 w-2 rounded-full', colors.dot)} />
                    {scheme.category}
                </span>
                <div 
                  className="text-2xl p-2 bg-white rounded-xl shadow-sm border border-border-soft"
                >
                  {scheme.icon}
                </div>
            </div>

            {/* Scheme name */}
            <h3 
              className="text-[17px] font-bold leading-tight mb-2"
              style={{ fontFamily: 'Syne, sans-serif', color: 'var(--brand-indigo)' }}
            >
                {scheme.name}
            </h3>
            {scheme.full_name && scheme.full_name !== scheme.name && (
                <p 
                  className="text-[11px] mb-3 leading-tight font-medium"
                  style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--text-tertiary)' }}
                >
                  {scheme.full_name}
                </p>
            )}

            {/* Benefit pill — highlighted */}
            <div 
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 mb-5 w-fit border shadow-sm"
              style={{ 
                backgroundColor: 'rgba(255, 159, 28, 0.08)', 
                borderColor: 'rgba(255, 159, 28, 0.2)',
              }}
            >
                <div className="h-1.5 w-1.5 rounded-full bg-brand-saffron" style={{ backgroundColor: 'var(--brand-saffron)' }} />
                <span 
                  className="text-xs font-bold"
                  style={{ fontFamily: 'Syne, sans-serif', color: 'var(--brand-indigo)' }}
                >
                  {scheme.benefit}
                </span>
            </div>

            {/* Description */}
            <p 
              className="text-[13px] leading-relaxed flex-1 mb-6 line-clamp-3"
              style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--text-secondary)' }}
            >
                {scheme.description}
            </p>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleListen}
                    className="flex items-center justify-center h-11 w-11 rounded-xl transition-all hover:scale-105"
                    style={{ 
                      backgroundColor: 'white',
                      border: '1px solid var(--border-soft)',
                      color: 'var(--brand-indigo)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
                    }}
                    title="Listen to scheme details"
                >
                    <Volume2 className="h-4 w-4" />
                </button>
                <button
                    onClick={() => onLearnMore(scheme)}
                    className="flex-1 h-11 flex items-center justify-center gap-2 text-[13px] font-bold transition-all hover:shadow-lg"
                    style={{
                      backgroundColor: 'var(--brand-indigo)',
                      color: 'white',
                      borderRadius: '12px',
                      fontFamily: 'Syne, sans-serif'
                    }}
                >
                    {t.learnMore}
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}

export default SchemeCard
