import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import {
  FileText, Copy, Printer, Download, Search,
  Loader2, Sparkles, Volume2, Square, ArrowRight,
  ShieldCheck, AlertCircle, RefreshCw
} from 'lucide-react';
import { getT } from '@/lib/translations';
import { cn } from '@/lib/utils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://saarthi-production-7b58.up.railway.app';

export default function ComplaintDrafter({ language = 'English' }) {
  const t_full = getT(language);
  const t = t_full.legalDrafter || t_full.scamDetector; // Fallback to scamDetector if legalDrafter missing in some languages

  const [story, setStory] = useState('');
  const [targetLanguage, setTargetLanguage] = useState(language || 'English');
  const [recipient, setRecipient] = useState('Police Station');
  const [draft, setDraft] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const formattedDraft = typeof draft === 'string' ? draft.replace(/\r\n/g, '\n') : '';

  // Sync target language with component language prop initially
  useEffect(() => {
    setTargetLanguage(language || 'English');
  }, [language]);

  // Cleanup TTS on unmount to prevent floating audio when navigating away
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleDraft = async () => {
    if (!story.trim()) return;
    setIsDrafting(true);
    setDraft('');
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/draft-complaint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story,
          language: targetLanguage,
          recipient
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const detail = errData?.detail;
        let message = `Server error: ${response.status}`;
        if (typeof detail === 'string') {
          message = detail;
        } else if (Array.isArray(detail)) {
          message = detail
            .map((d) => d?.msg || d?.message || JSON.stringify(d))
            .join('; ');
        } else if (detail && typeof detail === 'object') {
          message = detail.message || JSON.stringify(detail);
        }
        throw new Error(message);
      }

      const data = await response.json();
      setDraft(data.draft || 'No draft was returned.');
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while drafting your complaint.');
    } finally {
      setIsDrafting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Legal Draft - Saarthi</title>
          <style>
            body { padding: 40px; line-height: 1.6; font-size: 14px; }
            pre {
              margin: 0;
              white-space: pre-wrap;
              word-wrap: break-word;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
              line-height: 1.6;
              font-size: 14px;
            }
          </style>
        </head>
        <body onload="window.print()">
          <pre>${formattedDraft}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const speakDraft = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    if (!draft) return;

    const utterance = new SpeechSynthesisUtterance(draft);

    const langMap = {
      English: 'en-IN', Hindi: 'hi-IN', Tamil: 'ta-IN', Telugu: 'te-IN',
      Bengali: 'bn-IN', Marathi: 'mr-IN', Kannada: 'kn-IN',
      Gujarati: 'gu-IN', Punjabi: 'pa-IN', Malayalam: 'ml-IN'
    };
    utterance.lang = langMap[targetLanguage] || 'en-IN';

    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const reset = () => {
    setStory('');
    setDraft('');
    setError('');
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-10" style={{ backgroundColor: 'transparent' }}>
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-5 border-b border-border-soft pb-8">
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center transition-transform hover:scale-105"
            style={{
              backgroundColor: 'var(--brand-indigo)',
              border: '1px solid var(--border-medium)',
              boxShadow: '0 8px 32px rgba(27,20,100,0.12)'
            }}
          >
            <FileText className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1
              style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '32px', color: 'var(--text-primary)' }}
            >
              {t.title}
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '15px', color: 'var(--text-secondary)' }}>
              {t.subtitle}
            </p>
          </div>
        </div>

        {!draft && !isDrafting ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card
              style={{
                borderRadius: '20px',
                border: '1px solid var(--border-soft)',
                backgroundColor: 'var(--bg-surface)',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
              }}
            >
              <CardHeader className="pb-4" style={{ backgroundColor: 'rgba(27, 20, 100, 0.02)' }}>
                <CardTitle
                  className="flex items-center gap-2"
                  style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 600, color: 'var(--brand-indigo)' }}
                >
                  <Sparkles className="h-5 w-5" />
                  {t.whatHappened}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div>
                  <textarea
                    placeholder={t.placeholder}
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    rows={8}
                    className="w-full p-5 text-sm resize-none outline-none transition-all placeholder:text-slate-400"
                    style={{
                      borderRadius: '16px',
                      border: '1px solid var(--border-medium)',
                      backgroundColor: 'var(--bg-base)',
                      fontFamily: 'DM Sans, sans-serif'
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-tertiary)', fontFamily: 'Syne, sans-serif' }}>
                      {t.languageLabel}
                    </label>
                    <select
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value)}
                      className="w-full px-4 py-3 text-sm outline-none bg-white border border-slate-200 rounded-xl"
                      style={{ fontFamily: 'DM Sans, sans-serif' }}
                    >
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Marathi</option>
                      <option>Tamil</option>
                      <option>Telugu</option>
                      <option>Bengali</option>
                      <option>Gujarati</option>
                      <option>Punjabi</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-tertiary)', fontFamily: 'Syne, sans-serif' }}>
                      {t.authorityLabel}
                    </label>
                    <select
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="w-full px-4 py-3 text-sm outline-none bg-white border border-slate-200 rounded-xl"
                      style={{ fontFamily: 'DM Sans, sans-serif' }}
                    >
                      <option>Police Station</option>
                      <option>Sarpanch</option>
                      <option>District Magistrate</option>
                      <option>Bank Manager</option>
                      <option>Consumer Court</option>
                    </select>
                  </div>
                </div>

                {error && (
                  <div
                    className="text-xs p-4 rounded-xl flex items-start gap-3"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#b91c1c' }}
                  >
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <p style={{ fontFamily: 'DM Sans, sans-serif' }}>{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleDraft}
                  disabled={!story.trim()}
                  className="w-full py-7 gap-3 shadow-xl"
                  style={{
                    backgroundColor: 'var(--brand-saffron)',
                    color: 'var(--brand-indigo)',
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 700,
                    fontSize: '16px',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(255,159,28,0.25)'
                  }}
                >
                  <Sparkles className="h-5 w-5" />
                  {t.formatBtn}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            {isDrafting ? (
              <div className="h-[400px] flex flex-col items-center justify-center gap-6 bg-white/50 rounded-3xl border border-dashed border-slate-200">
                <div className="relative flex h-20 w-20 items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {t.drafting}
                  </p>
                  <p className="text-sm text-slate-500" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    Formulating legal terminology and formatting...
                  </p>
                </div>
              </div>
            ) : (
              <>
                <Card
                  className="overflow-hidden border-none"
                  style={{
                    borderRadius: '24px',
                    boxShadow: '0 12px 48px rgba(27,20,100,0.08)',
                    backgroundColor: 'white'
                  }}
                >
                  <div className="p-1 sm:p-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 px-4 py-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400" style={{ fontFamily: 'Syne, sans-serif' }}>
                        {t.resultTitle}
                      </span>
                    </div>
                    <div className="flex gap-1 p-1">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={handleCopy}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={speakDraft}>
                        {isSpeaking ? <Square className="h-4 w-4 fill-current" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={handlePrint}>
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-8 sm:p-10 min-h-[400px]">
                    <pre
                      className="max-w-none whitespace-pre-wrap break-words"
                      style={{
                        margin: 0,
                        lineHeight: 1.6,
                        fontSize: '14px',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                      }}
                    >
                      {formattedDraft}
                    </pre>
                  </div>

                  <div className="bg-slate-50 border-t border-slate-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[11px] text-slate-400 font-medium italic">
                      * This draft is AI-generated for structural guidance. Please review before official submission.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={reset}
                      className="gap-2 rounded-xl border-slate-200"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Draft Another
                    </Button>
                  </div>
                </Card>

                {/* Secondary Actions / Tips */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100 flex gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                      <Search className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-indigo-900" style={{ fontFamily: 'Syne, sans-serif' }}>Next Steps?</h4>
                      <p className="text-xs text-indigo-700/80 leading-relaxed mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                        You can take this draft to your nearest Common Service Centre (CSC) or Police Station for formal filing.
                      </p>
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 flex gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-white flex items-center justify-center text-amber-600 shadow-sm">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-900" style={{ fontFamily: 'Syne, sans-serif' }}>Know Your Rights</h4>
                      <p className="text-xs text-amber-700/80 leading-relaxed mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                        Ask Saarthi if you're entitled to free legal aid under NALSA (National Legal Services Authority).
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}