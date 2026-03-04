import React, { useState } from 'react'
import { Volume2, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const langMap = {
  English: 'en-US', Hindi: 'hi-IN', Tamil: 'ta-IN', Telugu: 'te-IN',
  Marathi: 'mr-IN', Bengali: 'bn-IN', Kannada: 'kn-IN', Gujarati: 'gu-IN',
  Punjabi: 'pa-IN', Malayalam: 'ml-IN',
}

function AnswerCard({ content, language }) {
  const { text, sources = [] } = content
  const [expandedSource, setExpandedSource] = useState(null)

  if (!text) return null

  const speak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech not supported in this browser.')
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = langMap[language] || 'en-US'
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="flex flex-col gap-3 w-full animate-fade-in">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Saarthi
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={speak}
          className="h-6 px-2 text-[11px] gap-1 rounded"
        >
          <Volume2 className="h-3 w-3" />
          Listen
        </Button>
      </div>

      {/* Main answer bubble */}
      <div className="rounded-2xl rounded-tl-sm border border-border/60 bg-muted/30 px-4 py-3">
        <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{text}</p>
      </div>

      {/* Sources — Perplexity style */}
      {sources.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {/* Source chips row */}
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
            Sources
          </p>
          <div className="flex flex-wrap gap-2">
            {sources.map((src, idx) => {
              const isGeneralKnowledge = src.filename === 'General Knowledge (GPT-4o)'
              return (
                <button
                  key={idx}
                  onClick={() => setExpandedSource(expandedSource === idx ? null : idx)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-150',
                    expandedSource === idx
                      ? isGeneralKnowledge
                        ? 'border-amber-300 bg-amber-50 text-amber-700'
                        : 'border-primary/30 bg-primary/5 text-primary'
                      : 'border-border/60 bg-background text-muted-foreground hover:border-primary/20 hover:text-foreground'
                  )}
                >
                  <span className={cn(
                    'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded text-[9px] font-bold',
                    isGeneralKnowledge ? 'bg-amber-100 text-amber-700' : 'bg-muted text-foreground'
                  )}>
                    {isGeneralKnowledge ? 'AI' : idx + 1}
                  </span>
                  {isGeneralKnowledge
                    ? <span className="text-amber-600">⚡</span>
                    : <FileText className="h-3 w-3 flex-shrink-0" />}
                  <span className="max-w-[160px] truncate">
                    {src.filename}
                    {!isGeneralKnowledge && src.page !== null && src.page !== undefined ? `, p.${src.page}` : ''}
                  </span>
                  {expandedSource === idx
                    ? <ChevronUp className="h-3 w-3 ml-0.5" />
                    : <ChevronDown className="h-3 w-3 ml-0.5" />}
                </button>
              )
            })}
          </div>

          {/* Expanded snippet */}
          {expandedSource !== null && sources[expandedSource]?.snippet && (
            <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-[11px] text-muted-foreground leading-relaxed animate-fade-in">
              <p className="font-medium text-foreground text-xs mb-1">
                {sources[expandedSource].filename}
                {sources[expandedSource].page !== null && sources[expandedSource].page !== undefined
                  ? ` — Page ${sources[expandedSource].page}`
                  : ''}
              </p>
              <p className="italic">"{sources[expandedSource].snippet}..."</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AnswerCard
