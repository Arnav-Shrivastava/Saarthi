import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
    ShieldAlert, ShieldCheck, ShieldQuestion,
    AlertTriangle, Search, Info, Trash2, MessageSquare,
    CheckCircle2, XCircle, AlertCircle, Loader2,
    Mic, MicOff, Upload, Volume2, Square
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TRANSLATIONS } from '@/lib/translations'

export default function ScamDetector({ language = 'English' }) {
    const t = TRANSLATIONS[language]?.scamDetector || TRANSLATIONS.English.scamDetector
    const [text, setText] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)

    // Voice & File States
    const [isRecording, setIsRecording] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [file, setFile] = useState(null)
    const recognitionRef = React.useRef(null)

    const handleVerify = async () => {
        if (!text.trim() && !file) return
        setLoading(true)
        setResult(null)

        try {
            const formData = new FormData()
            formData.append('text', text)
            formData.append('language', language)
            if (file) {
                formData.append('file', file)
            }

            const response = await fetch('https://saarthi-production-7b58.up.railway.app/verify', {
                method: 'POST',
                body: formData
            })
            const data = await response.json()
            setResult(data)
        } catch (error) {
            console.error('Verification Error:', error)
            setResult({
                verdict: 'Suspicious',
                reasoning: 'Could not connect to the verification engine. Please try again later.',
                confidence: 0
            })
        } finally {
            setLoading(false)
        }
    }

    // --- Voice Input Logic (Mic) ---
    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop()
            setIsRecording(false)
            return
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
            alert('Speech recognition is not supported in this browser.')
            return
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true

        // Map UI languages to BCP-47 tags
        const langMap = {
            English: 'en-IN', Hindi: 'hi-IN', Tamil: 'ta-IN', Telugu: 'te-IN',
            Bengali: 'bn-IN', Marathi: 'mr-IN', Kannada: 'kn-IN',
            Gujarati: 'gu-IN', Punjabi: 'pa-IN', Malayalam: 'ml-IN'
        }
        recognition.lang = langMap[language] || 'en-IN'

        recognition.onresult = (event) => {
            let finalTranscript = ''
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript
                }
            }
            if (finalTranscript) {
                setText((prev) => prev ? prev + ' ' + finalTranscript : finalTranscript)
            }
        }

        recognition.onend = () => setIsRecording(false)
        recognitionRef.current = recognition
        recognition.start()
        setIsRecording(true)
    }

    // --- TTS Logic (Listen) ---
    const getLanguageCode = (langName) => {
        const map = { Hindi: 'hi-IN', Tamil: 'ta-IN', Telugu: 'te-IN', Bengali: 'bn-IN', Marathi: 'mr-IN', Kannada: 'kn-IN', Gujarati: 'gu-IN', Punjabi: 'pa-IN', Malayalam: 'ml-IN' }
        return map[langName] || 'en-IN'
    }

    const speakVerdict = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel()
            setIsSpeaking(false)
            return
        }
        if (!result) return

        let textToSpeak = `${t.verdict}: ${result.verdict === 'Authentic' ? t.authentic :
            result.verdict === 'Fake' ? t.fake : t.suspicious
            }. ${result.reasoning}`

        const utterance = new SpeechSynthesisUtterance(textToSpeak)
        utterance.lang = getLanguageCode(language)
        utterance.onend = () => setIsSpeaking(false)

        setIsSpeaking(true)
        window.speechSynthesis.speak(utterance)
    }

    // --- File Input Logic ---
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0])
            setText('') // Clear text when file is selected to avoid confusion
        }
    }

    const clearFile = () => {
        setFile(null)
    }

    const reset = () => {
        setText('')
        setFile(null)
        setResult(null)
        if (isSpeaking) {
            window.speechSynthesis.cancel()
            setIsSpeaking(false)
        }
    }

    const getVerdictStyle = (verdict) => {
        switch (verdict) {
            case 'Authentic':
                return {
                    bg: 'bg-green-50/50 border-green-200',
                    icon: <ShieldCheck className="h-12 w-12 text-green-500" />,
                    badge: 'bg-green-100 text-green-700 border-green-200',
                    title: 'text-green-800'
                }
            case 'Fake':
                return {
                    bg: 'bg-red-50/50 border-red-200',
                    icon: <ShieldAlert className="h-12 w-12 text-red-500" />,
                    badge: 'bg-red-100 text-red-700 border-red-200',
                    title: 'text-red-800'
                }
            default: // Suspicious
                return {
                    bg: 'bg-amber-50/50 border-amber-200',
                    icon: <ShieldQuestion className="h-12 w-12 text-amber-500" />,
                    badge: 'bg-amber-100 text-amber-700 border-amber-200',
                    title: 'text-amber-800'
                }
        }
    }

    const style = result ? getVerdictStyle(result.verdict) : null

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
                        <ShieldAlert className="h-7 w-7 text-white" />
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

                {!result ? (
                    <Card
                        style={{
                            borderRadius: '16px',
                            border: '1px solid var(--border-soft)',
                            backgroundColor: 'var(--bg-surface)',
                            overflow: 'hidden'
                        }}
                    >
                        <CardHeader className="pb-4" style={{ backgroundColor: 'rgba(27, 20, 100, 0.02)' }}>
                            <CardTitle
                                className="flex items-center gap-2"
                                style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 600, color: 'var(--brand-indigo)' }}
                            >
                                <MessageSquare className="h-5 w-5" />
                                Paste Message to Verify
                            </CardTitle>
                            <CardDescription style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                Copy the WhatsApp forward or news snippet and paste it below.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-6">
                            {!file && (
                                <div className="relative">
                                    <Textarea
                                        placeholder={t.placeholder}
                                        className="min-h-[220px] resize-none text-sm placeholder:text-muted-foreground/50 pr-14"
                                        style={{
                                            borderRadius: '12px',
                                            border: '1px solid var(--border-medium)',
                                            backgroundColor: 'var(--bg-base)',
                                            fontFamily: 'DM Sans, sans-serif'
                                        }}
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                    />
                                    <Button
                                        size="icon"
                                        className={cn(
                                            "absolute bottom-4 right-4 rounded-xl shadow-lg transition-all hover:scale-110",
                                            isRecording && "animate-pulse"
                                        )}
                                        style={{
                                            backgroundColor: isRecording ? '#ef4444' : 'var(--brand-saffron)',
                                            color: isRecording ? 'white' : 'var(--brand-indigo)',
                                        }}
                                        onClick={toggleRecording}
                                        title={isRecording ? t.micStop : t.micStart}
                                    >
                                        {isRecording ? <Square className="h-4 w-4" fill="currentColor" /> : <Mic className="h-5 w-5" />}
                                    </Button>
                                </div>
                            )}

                            {/* File Upload Area */}
                            {!text && !isRecording && (
                                <div className="relative border-2 border-dashed border-border/60 rounded-xl p-6 text-center hover:bg-muted/10 transition-colors">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {file ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                            <div className="text-sm font-medium">{file.name}</div>
                                            <Button variant="ghost" size="sm" onClick={clearFile} className="text-destructive h-8 px-2">
                                                <Trash2 className="h-4 w-4 mr-2" /> Remove File
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-1">
                                                <Upload className="h-5 w-5" />
                                            </div>
                                            <div className="text-sm font-medium">{t.uploadPdf}</div>
                                            <p className="text-xs text-muted-foreground">Tap to upload a PDF document for verification.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div
                                className="flex justify-between items-center p-4 rounded-xl"
                                style={{ backgroundColor: 'rgba(27, 20, 100, 0.03)', border: '1px solid var(--border-soft)' }}
                            >
                                <div
                                    className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold"
                                    style={{ color: 'var(--text-tertiary)' }}
                                >
                                    <ShieldCheck className="h-4 w-4" style={{ color: 'var(--success)' }} />
                                    Fact-Check Engine Active
                                </div>
                                <Button
                                    onClick={handleVerify}
                                    disabled={loading || (!text.trim() && !file) || isRecording}
                                    className="gap-2 shadow-md px-6 py-5"
                                    style={{
                                        backgroundColor: 'var(--brand-indigo)',
                                        color: 'white',
                                        fontFamily: 'Syne, sans-serif',
                                        fontWeight: 600,
                                        borderRadius: '12px'
                                    }}
                                >
                                    {loading ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> {file ? t.readingPdf : t.verifying}</>
                                    ) : (
                                        <><Search className="h-4 w-4" /> {t.verifyBtn}</>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card
                            className={cn("border overflow-hidden relative", style.bg)}
                            style={{ borderRadius: '24px', border: '1px solid var(--border-medium)', boxShadow: '0 12px 48px rgba(27,20,100,0.08)' }}
                        >
                            {/* TTS Listen Button */}
                            <Button
                                size="icon"
                                className="absolute top-5 right-5 hover:scale-110 transition-all shadow-md h-11 w-11 rounded-xl"
                                style={{
                                    backgroundColor: 'white',
                                    border: '1px solid var(--border-soft)',
                                    color: 'var(--brand-indigo)'
                                }}
                                onClick={speakVerdict}
                                title={t.listen}
                            >
                                {isSpeaking ? (
                                    <Square className="h-5 w-5" fill="currentColor" />
                                ) : (
                                    <Volume2 className="h-5 w-5" />
                                )}
                            </Button>

                            <div className="p-10 text-center space-y-8">
                                <div className="flex justify-center">
                                    <div
                                        className="p-5 bg-white rounded-2xl shadow-sm"
                                        style={{ border: '1px solid var(--border-soft)' }}
                                    >
                                        {style.icon}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Badge
                                        variant="outline"
                                        className={cn("mb-2 uppercase tracking-widest text-[11px] font-bold px-4 py-1", style.badge)}
                                        style={{ borderRadius: '50px' }}
                                    >
                                        Verdict: {result.verdict}
                                    </Badge>
                                    <h2
                                        className={cn("text-4xl font-bold tracking-tight", style.title)}
                                        style={{ fontFamily: 'Syne, sans-serif' }}
                                    >
                                        {result.verdict === 'Authentic' && "This Scheme is Authentic"}
                                        {result.verdict === 'Fake' && "Warning: This is Fake"}
                                        {result.verdict === 'Suspicious' && "Caution: Potential Scam"}
                                    </h2>
                                    <p
                                        className="text-slate-600 max-w-lg mx-auto text-[16px] leading-relaxed"
                                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        {result.reasoning}
                                    </p>
                                </div>

                                {result.official_details && (
                                    <div className="bg-white/80 border border-border/60 rounded-xl p-6 text-left shadow-sm max-w-xl mx-auto space-y-3">
                                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                                            <Info className="h-3.5 w-3.5" />
                                            Official Information
                                        </div>
                                        <p className="text-sm font-medium leading-relaxed">
                                            {result.official_details}
                                        </p>
                                    </div>
                                )}

                                <div className="pt-4 flex items-center justify-center gap-3">
                                    <Button variant="outline" className="gap-2" onClick={reset}>
                                        <Trash2 className="h-4 w-4" /> {t.clearBtn}
                                    </Button>
                                    <Button className="gap-2 shadow-md">
                                        Learn More Safety Tips
                                    </Button>
                                </div>
                            </div>

                            {/* Tips bar */}
                            <div className="bg-muted/30 border-t p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-muted-foreground font-medium">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-primary" /> Verified by Saarthi RAG</span>
                                    <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-primary" /> Real-time Govt. Data</span>
                                </div>
                                <p>Confidence Score: {Math.round(result.confidence * 100)}%</p>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Secondary Info */}
                <div className="grid sm:grid-cols-3 gap-6">
                    <div
                        className="p-6 rounded-2xl border transition-all hover:shadow-md"
                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-soft)' }}
                    >
                        <div
                            className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
                            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                        >
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <h4
                            className="text-[11px] font-bold uppercase tracking-widest mb-2"
                            style={{ color: 'var(--brand-indigo)', fontFamily: 'Syne, sans-serif' }}
                        >
                            What we check
                        </h4>
                        <p
                            className="text-[13px] leading-relaxed text-slate-500"
                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                        >
                            We analyze benefit amounts, application processes, and suspicious patterns like requests for OTPs or personal money.
                        </p>
                    </div>
                    <div
                        className="p-6 rounded-2xl border transition-all hover:shadow-md"
                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-soft)' }}
                    >
                        <div
                            className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
                            style={{ backgroundColor: 'rgba(27, 20, 100, 0.1)', color: 'var(--brand-indigo)' }}
                        >
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <h4
                            className="text-[11px] font-bold uppercase tracking-widest mb-2"
                            style={{ color: 'var(--brand-indigo)', fontFamily: 'Syne, sans-serif' }}
                        >
                            Official Source
                        </h4>
                        <p
                            className="text-[13px] leading-relaxed text-slate-500"
                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                        >
                            Claims are verified directly against government PDFs and policy documents indexed in the Saarthi knowledge base.
                        </p>
                    </div>
                    <div
                        className="p-6 rounded-2xl border transition-all hover:shadow-md"
                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-soft)' }}
                    >
                        <div
                            className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
                            style={{ backgroundColor: 'rgba(255, 159, 28, 0.1)', color: 'var(--brand-saffron)' }}
                        >
                            <MessageSquare className="h-5 w-5" />
                        </div>
                        <h4
                            className="text-[11px] font-bold uppercase tracking-widest mb-2"
                            style={{ color: 'var(--brand-indigo)', fontFamily: 'Syne, sans-serif' }}
                        >
                            Stay Informed
                        </h4>
                        <p
                            className="text-[13px] leading-relaxed text-slate-500"
                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                        >
                            Found a scam? Share it with neighbors and friends. Awareness is the best defense against digital financial fraud.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
