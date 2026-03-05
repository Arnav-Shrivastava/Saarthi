import React from 'react'
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
        <div className={cn(
            'group relative flex flex-col rounded-2xl border bg-white p-5 shadow-sm',
            'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
            'border-border/60 hover:border-primary/20'
        )}>
            {/* Category badge */}
            <div className="flex items-center justify-between mb-3">
                <span className={cn(
                    'inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full border',
                    colors.bg, colors.text, colors.border
                )}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', colors.dot)} />
                    {scheme.category}
                </span>
                <span className="text-xl" role="img" aria-label={scheme.name}>{scheme.icon}</span>
            </div>

            {/* Scheme name */}
            <h3 className="font-semibold text-sm text-foreground leading-snug mb-1">
                {scheme.name}
            </h3>
            {scheme.full_name && scheme.full_name !== scheme.name && (
                <p className="text-[10px] text-muted-foreground mb-2 leading-tight">{scheme.full_name}</p>
            )}

            {/* Benefit pill — highlighted */}
            <div className="inline-flex items-center gap-1 bg-primary/8 border border-primary/15 rounded-lg px-2.5 py-1.5 mb-3 w-fit">
                <span className="text-xs font-bold text-primary">{scheme.benefit}</span>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4 line-clamp-3">
                {scheme.description}
            </p>

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-auto">
                <button
                    onClick={handleListen}
                    className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground border border-border/60 rounded-lg px-2.5 py-1.5 hover:bg-muted/40 transition-all"
                    title="Listen to scheme details"
                >
                    <Volume2 className="h-3 w-3" />
                    {t.listen}
                </button>
                <button
                    onClick={() => onLearnMore(scheme)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg px-3 py-1.5 transition-all group-hover:shadow-sm"
                >
                    {t.learnMore}
                    <ChevronRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    )
}

export default SchemeCard
