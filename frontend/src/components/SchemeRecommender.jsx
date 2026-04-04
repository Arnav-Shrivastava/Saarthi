import React, { useState } from 'react'
import { ArrowLeft, ArrowRight, Sparkles, RefreshCw, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getT, INDIAN_STATES } from '@/lib/translations'
import SchemeCard from './SchemeCard'

const API_BASE_URL = 'https://saarthi-production-7b58.up.railway.app'

// Combined occupation data — explicit emoji, label, and card colour
const OCCUPATION_META = [
    { key: 'farmer', emoji: '🌾', bg: 'bg-green-50 border-green-200 hover:bg-green-100' },
    { key: 'student', emoji: '📚', bg: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
    { key: 'msme', emoji: '💼', bg: 'bg-amber-50 border-amber-200 hover:bg-amber-100' },
    { key: 'labour', emoji: '👷', bg: 'bg-orange-50 border-orange-200 hover:bg-orange-100' },
    { key: 'senior_citizen', emoji: '👴', bg: 'bg-purple-50 border-purple-200 hover:bg-purple-100' },
    { key: 'other', emoji: '🔘', bg: 'bg-muted/40 border-border/60 hover:bg-muted/70' },
]

function ProgressBar({ step, total }) {
    return (
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(step / total) * 100}%` }}
            />
        </div>
    )
}

function SchemeRecommender({ language, onLearnMore }) {
    const t = getT(language)
    const [step, setStep] = useState(1) // 1=occupation, 2=state, 3=income, 4=details
    const [profile, setProfile] = useState({
        occupation: '',
        state: 'All India',
        income: 0,
        age: '',
        land_size: '',
    })
    const [schemes, setSchemes] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const TOTAL_STEPS = 4

    const handleOccupation = (occ) => {
        setProfile(p => ({ ...p, occupation: occ }))
        setStep(2)
    }

    const handleState = (st) => {
        setProfile(p => ({ ...p, state: st }))
        setStep(3)
    }

    const handleIncome = (val) => {
        setProfile(p => ({ ...p, income: val }))
        setStep(4)
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`${API_BASE_URL}/recommend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    occupation: profile.occupation || 'other',
                    income: Number(profile.income) || 0,
                    state: profile.state || 'All India',
                    // Coerce empty strings to 0 to avoid 422 from FastAPI
                    land_size: profile.land_size === '' ? 0 : Number(profile.land_size) || 0,
                    age: profile.age === '' ? 25 : Number(profile.age) || 25,
                    language: language || 'English',
                }),
            })
            if (!res.ok) throw new Error('Server error')
            const data = await res.json()
            setSchemes(data.schemes || [])
        } catch (e) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setStep(1)
        setProfile({ occupation: '', state: 'All India', income: 0, age: '', land_size: '' })
        setSchemes(null)
        setError(null)
    }

    // ── Wizard Speech Guidance ────────────────────────────────────────────────
    const speakStep = (text) => {
        if (!('speechSynthesis' in window)) return

        const langMap = {
            English: 'en-US', Hindi: 'hi-IN', Tamil: 'ta-IN', Telugu: 'te-IN',
            Marathi: 'mr-IN', Bengali: 'bn-IN', Kannada: 'kn-IN', Gujarati: 'gu-IN',
            Punjabi: 'pa-IN', Malayalam: 'ml-IN',
        }
        const langCode = langMap[language] || 'en-US'

        const performSpeak = () => {
            window.speechSynthesis.cancel()
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = langCode
            utterance.rate = 0.95

            const voices = window.speechSynthesis.getVoices()
            const bestVoice =
                voices.find(v => v.lang === langCode && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))) ||
                voices.find(v => v.lang === langCode)

            if (bestVoice) utterance.voice = bestVoice
            window.speechSynthesis.speak(utterance)
        }

        // If voices aren't loaded yet, wait for them
        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                performSpeak()
                window.speechSynthesis.onvoiceschanged = null
            }
        } else {
            performSpeak()
        }
    }

    React.useEffect(() => {
        if (loading) return

        // Small timeout to ensure component is ready and any previous speech is cleared
        const timer = setTimeout(() => {
            let text = ""
            if (schemes !== null) {
                text = `${t.resultsTitle}. ${schemes.length} ${t.schemesFound || 'schemes found'}`
            } else if (step === 1) {
                text = t.steps.occupation.title
            } else if (step === 2) {
                text = t.steps.state.title
            } else if (step === 3) {
                text = t.steps.income.title
            } else if (step === 4) {
                text = t.steps.details.title
            }
            if (text) speakStep(text)
        }, 150)

        return () => clearTimeout(timer)
    }, [step, schemes, loading, language, t])

    // ── Results view ──────────────────────────────────────────────────────────
    if (schemes !== null && !loading) {
        return (
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
                    {/* Results header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                                    <Target className="h-3.5 w-3.5 text-white" />
                                </div>
                                <h2 className="text-lg font-bold text-foreground">{t.resultsTitle}</h2>
                                {schemes.length > 0 && (
                                    <span className="flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                                        {schemes.length}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground capitalize">
                                {profile.occupation} · {profile.state} · Age {profile.age || '—'}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className="gap-1.5 text-xs"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            {t.tryAgain}
                        </Button>
                    </div>

                    {schemes.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">
                            <div className="text-4xl mb-4">🔍</div>
                            <p className="text-sm max-w-sm mx-auto">{t.noResults}</p>
                            <Button onClick={handleReset} className="mt-6" size="sm">{t.tryAgain}</Button>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                            {schemes.map((scheme) => (
                                <SchemeCard
                                    key={scheme.id}
                                    scheme={scheme}
                                    language={language}
                                    onLearnMore={onLearnMore}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // ── Loading view ──────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center flex-col gap-4 py-20">
                <div className="relative flex h-16 w-16 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                    </div>
                </div>
                <p className="text-sm text-muted-foreground text-center max-w-xs">{t.loading}</p>
            </div>
        )
    }

    // ── Wizard steps ──────────────────────────────────────────────────────────
    return (
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
                {/* Progress */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-3">
                        <span 
                          className="text-[11px] font-bold uppercase tracking-widest"
                          style={{ color: 'var(--text-tertiary)', fontFamily: 'Syne, sans-serif' }}
                        >
                            {t.step} {step} {t.of} {TOTAL_STEPS}
                        </span>
                        <span className="text-[11px] font-bold" style={{ color: 'var(--brand-indigo)' }}>
                          {Math.round((step / TOTAL_STEPS) * 100)}%
                        </span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-soft)' }}>
                        <div
                            className="h-full transition-all duration-700 ease-out"
                            style={{ 
                              width: `${(step / TOTAL_STEPS) * 100}%`,
                              backgroundColor: 'var(--brand-indigo)',
                              boxShadow: '0 0 12px rgba(27,20,100,0.2)'
                            }}
                        />
                    </div>
                </div>

                {/* ── Step 1: Occupation ── */}
                {step === 1 && (
                    <div className="animate-fade-in">
                        <h2 
                          className="mb-1"
                          style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}
                        >
                          {t.steps.occupation.title}
                        </h2>
                        <p className="text-sm mb-8" style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--text-secondary)' }}>
                          {t.steps.occupation.subtitle}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {OCCUPATION_META.map(({ key, emoji, bg }) => {
                                // Get translated label and strip any trailing emoji from the translation
                                const raw = t.occupations[key] || key
                                const lastSpace = raw.lastIndexOf(' ')
                                const lastWord = lastSpace >= 0 ? raw.slice(lastSpace + 1) : ''
                                const isEmoji = lastWord.length <= 2 && !/[a-zA-Z]/.test(lastWord)
                                const label = (lastSpace >= 0 && isEmoji) ? raw.slice(0, lastSpace).trim() : raw
                                const isSelected = profile.occupation === key;

                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleOccupation(key)}
                                        className={cn(
                                            'relative flex flex-col items-center justify-center text-center gap-3 p-5 rounded-2xl border transition-all duration-200 cursor-pointer group',
                                            isSelected ? 'ring-2 ring-offset-2' : ''
                                        )}
                                        style={{
                                          backgroundColor: isSelected ? 'var(--brand-saffron-bg)' : 'var(--bg-surface)',
                                          borderColor: isSelected ? 'var(--brand-saffron)' : 'var(--border-soft)',
                                          boxShadow: isSelected ? '0 8px 24px rgba(255,159,28,0.15)' : 'none'
                                        }}
                                    >
                                        <div 
                                          className="text-3xl transition-transform group-hover:scale-110 duration-200"
                                        >
                                          {emoji}
                                        </div>
                                        <span 
                                          className="text-xs font-bold uppercase tracking-wider"
                                          style={{ 
                                            color: isSelected ? 'var(--brand-indigo)' : 'var(--text-secondary)',
                                            fontFamily: 'DM Sans, sans-serif'
                                          }}
                                        >
                                          {label}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* ── Step 2: State ── */}
                {step === 2 && (
                    <div className="animate-fade-in">
                        <h2 
                          className="mb-1"
                          style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}
                        >
                          {t.steps.state.title}
                        </h2>
                        <p className="text-sm mb-8" style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--text-secondary)' }}>
                          {t.steps.state.subtitle}
                        </p>
                        <div 
                          className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1 p-2 rounded-xl"
                          style={{ backgroundColor: 'rgba(27, 20, 100, 0.02)', border: '1px solid var(--border-soft)' }}
                        >
                            {INDIAN_STATES.map((st) => {
                                const isSelected = profile.state === st;
                                return (
                                    <button
                                        key={st}
                                        onClick={() => handleState(st)}
                                        className={cn(
                                            'text-left text-xs px-4 py-3 rounded-xl border transition-all duration-150',
                                            isSelected
                                                ? 'font-bold'
                                                : 'bg-white hover:border-indigo-200'
                                        )}
                                        style={{
                                          borderColor: isSelected ? 'var(--brand-indigo)' : 'var(--border-soft)',
                                          backgroundColor: isSelected ? 'var(--brand-indigo)' : 'white',
                                          color: isSelected ? 'white' : 'var(--text-secondary)',
                                          fontFamily: 'DM Sans, sans-serif'
                                        }}
                                    >
                                        {st}
                                    </button>
                                )
                            })}
                        </div>
                        <div className="flex gap-2 mt-8">
                            <Button 
                              variant="outline" 
                              onClick={() => setStep(1)} 
                              className="gap-2 px-6 rounded-xl border-border-medium hover:bg-slate-50"
                              style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600 }}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                {t.back}
                            </Button>
                        </div>
                    </div>
                )}

                {/* ── Step 3: Income ── */}
                {step === 3 && (
                    <div className="animate-fade-in">
                        <h2 
                          className="mb-1"
                          style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}
                        >
                          {t.steps.income.title}
                        </h2>
                        <p className="text-sm mb-8" style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--text-secondary)' }}>
                          {t.steps.income.subtitle}
                        </p>
                        <div className="flex flex-col gap-3">
                            {t.incomeRanges.map((range) => {
                                const isSelected = profile.income === range.value;
                                return (
                                    <button
                                        key={range.value}
                                        onClick={() => handleIncome(range.value)}
                                        className={cn(
                                            'flex items-center justify-between px-6 py-4 rounded-2xl border transition-all duration-150 group',
                                            isSelected ? 'shadow-md scale-[1.01]' : ''
                                        )}
                                        style={{
                                          borderColor: isSelected ? 'var(--brand-indigo)' : 'var(--border-soft)',
                                          backgroundColor: isSelected ? 'rgba(27, 20, 100, 0.05)' : 'white',
                                        }}
                                    >
                                        <span 
                                          style={{ 
                                            fontFamily: 'DM Sans, sans-serif', 
                                            fontWeight: isSelected ? 700 : 500,
                                            color: isSelected ? 'var(--brand-indigo)' : 'var(--text-primary)'
                                          }}
                                        >
                                          {range.label}
                                        </span>
                                        <div 
                                          className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all", 
                                            isSelected ? "border-brand-indigo bg-brand-indigo" : "border-slate-200"
                                          )}
                                          style={{ 
                                            borderColor: isSelected ? 'var(--brand-indigo)' : '#e2e8f0',
                                            backgroundColor: isSelected ? 'var(--brand-indigo)' : 'transparent' 
                                          }}
                                        >
                                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                        <div className="flex gap-2 mt-8">
                            <Button 
                              variant="outline" 
                              onClick={() => setStep(2)} 
                              className="gap-2 px-6 rounded-xl border-border-medium hover:bg-slate-50"
                              style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600 }}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                {t.back}
                            </Button>
                        </div>
                    </div>
                )}

                {/* ── Step 4: Details (Age + Land) ── */}
                {step === 4 && (
                    <div className="animate-fade-in">
                        <h2 
                          className="mb-1"
                          style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}
                        >
                          {t.steps.details.title}
                        </h2>
                        <p className="text-sm mb-8" style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--text-secondary)' }}>
                          {t.steps.details.subtitle}
                        </p>

                        <div className="flex flex-col gap-6 mb-10">
                            <div>
                                <label 
                                  className="text-[11px] font-bold uppercase tracking-widest mb-2 block"
                                  style={{ color: 'var(--text-tertiary)', fontFamily: 'Syne, sans-serif' }}
                                >
                                    {t.steps.details.ageLabel}
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="120"
                                    placeholder={t.steps.details.agePlaceholder}
                                    value={profile.age}
                                    onChange={(e) => setProfile(p => ({ ...p, age: e.target.value }))}
                                    className="w-full px-5 py-4 text-sm outline-none transition-all placeholder:text-slate-400"
                                    style={{
                                      borderRadius: '16px',
                                      border: '1px solid var(--border-medium)',
                                      backgroundColor: 'white',
                                      fontFamily: 'DM Sans, sans-serif'
                                    }}
                                />
                            </div>

                            {/* Show land size only for farmers/msme */}
                            {(profile.occupation === 'farmer' || profile.occupation === 'msme') && (
                                <div>
                                    <label 
                                      className="text-[11px] font-bold uppercase tracking-widest mb-2 block"
                                      style={{ color: 'var(--text-tertiary)', fontFamily: 'Syne, sans-serif' }}
                                    >
                                        {t.steps.details.landLabel}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        placeholder={t.steps.details.landPlaceholder}
                                        value={profile.land_size}
                                        onChange={(e) => setProfile(p => ({ ...p, land_size: e.target.value }))}
                                        className="w-full px-5 py-4 text-sm outline-none transition-all placeholder:text-slate-400"
                                        style={{
                                          borderRadius: '16px',
                                          border: '1px solid var(--border-medium)',
                                          backgroundColor: 'white',
                                          fontFamily: 'DM Sans, sans-serif'
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {error && (
                            <div 
                              className="text-xs mb-6 p-4 rounded-xl flex items-start gap-3"
                              style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#b91c1c' }}
                            >
                                <div className="mt-0.5">⚠️</div>
                                <p style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                  {error} — Please ensure the backend is running at localhost:8000
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button 
                              variant="outline" 
                              onClick={() => setStep(3)} 
                              className="gap-2 px-8 py-6 rounded-xl border-border-medium hover:bg-slate-50"
                              style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600 }}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                {t.back}
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={!profile.age}
                                className="flex-1 gap-3 py-6 shadow-xl"
                                style={{
                                  backgroundColor: 'var(--brand-saffron)',
                                  color: 'var(--brand-indigo)',
                                  fontFamily: 'Syne, sans-serif',
                                  fontWeight: 700,
                                  fontSize: '16px',
                                  borderRadius: '16px',
                                  boxShadow: '0 8px 32px rgba(255,159,28,0.3)'
                                }}
                            >
                                <Sparkles className="h-5 w-5" />
                                {t.submit}
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SchemeRecommender
