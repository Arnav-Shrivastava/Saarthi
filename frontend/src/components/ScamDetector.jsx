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

            const response = await fetch('http://localhost:8000/verify', {
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
        <div className="flex-1 overflow-y-auto bg-white p-4 sm:p-8">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4 border-b pb-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
                        <p className="text-muted-foreground text-sm">{t.subtitle}</p>
                    </div>
                </div>

                {!result ? (
                    <Card className="border-border/60 shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/30 pb-4">
                            <CardTitle className="text-base flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-primary" />
                                Paste Message to Verify
                            </CardTitle>
                            <CardDescription>
                                Copy the WhatsApp forward or news snippet and paste it below.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {!file && (
                                <div className="relative">
                                    <Textarea
                                        placeholder={t.placeholder}
                                        className="min-h-[200px] resize-none text-sm placeholder:text-muted-foreground/50 border-border/80 pr-12"
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                    />
                                    <Button
                                        size="icon"
                                        variant={isRecording ? "destructive" : "secondary"}
                                        className={cn(
                                            "absolute bottom-4 right-4 rounded-full shadow-sm transition-all",
                                            isRecording && "animate-pulse"
                                        )}
                                        onClick={toggleRecording}
                                        title={isRecording ? t.micStop : t.micStart}
                                    >
                                        {isRecording ? <Square className="h-4 w-4" fill="currentColor" /> : <Mic className="h-4 w-4" />}
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

                            <div className="flex justify-between items-center bg-muted/20 p-3 rounded-lg border border-border/40">
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                    <ShieldCheck className="h-3 w-3" />
                                    RAG Fact-Check Engine Active
                                </div>
                                <Button
                                    onClick={handleVerify}
                                    disabled={loading || (!text.trim() && !file) || isRecording}
                                    className="gap-2 shadow-sm"
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
                        <Card className={cn("border shadow-sm overflow-hidden relative", style.bg)}>

                            {/* TTS Listen Button */}
                            <Button
                                size="icon"
                                variant="outline"
                                className="absolute top-4 right-4 bg-white/50 hover:bg-white/80 rounded-full h-10 w-10 shadow-sm border-border/40 transition-all hover:scale-105"
                                onClick={speakVerdict}
                                title={t.listen}
                            >
                                {isSpeaking ? (
                                    <Square className="h-4 w-4 text-primary" fill="currentColor" />
                                ) : (
                                    <Volume2 className="h-4 w-4 text-primary" />
                                )}
                            </Button>

                            <div className="p-8 text-center space-y-6">
                                <div className="flex justify-center">
                                    <div className="p-4 bg-white rounded-full shadow-sm border border-border/40">
                                        {style.icon}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Badge variant="outline" className={cn("mb-2 uppercase tracking-tighter text-[10px] font-black px-3", style.badge)}>
                                        Verdict: {result.verdict}
                                    </Badge>
                                    <h2 className={cn("text-3xl font-black tracking-tight", style.title)}>
                                        {result.verdict === 'Authentic' && "This Scheme is Authentic"}
                                        {result.verdict === 'Fake' && "Warning: This is Fake"}
                                        {result.verdict === 'Suspicious' && "Caution: Potential Scam"}
                                    </h2>
                                    <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
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
                <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-border/60 bg-muted/5 flex flex-col gap-3">
                        <div className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
                            <AlertTriangle className="h-4 w-4" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">What we check</h4>
                        <p className="text-[11px] leading-relaxed text-muted-foreground/80">
                            We analyze benefit amounts, application processes, and suspicious patterns like requests for OTPs or personal money.
                        </p>
                    </div>
                    <div className="p-4 rounded-xl border border-border/60 bg-muted/5 flex flex-col gap-3">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Official Source</h4>
                        <p className="text-[11px] leading-relaxed text-muted-foreground/80">
                            Claims are verified directly against government PDFs and policy documents indexed in the Saarthi knowledge base.
                        </p>
                    </div>
                    <div className="p-4 rounded-xl border border-border/60 bg-muted/5 flex flex-col gap-3">
                        <div className="h-8 w-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
                            <MessageSquare className="h-4 w-4" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Stay Informed</h4>
                        <p className="text-[11px] leading-relaxed text-muted-foreground/80">
                            Found a scam? Share it with neighbors and friends. Awareness is the best defense against digital financial fraud.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
