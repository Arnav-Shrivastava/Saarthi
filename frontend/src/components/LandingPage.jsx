import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Globe, FileText, Mic, Eye, ArrowRight, BookOpen,
    Zap, Shield, Languages, MessageSquare, ChevronRight
} from 'lucide-react'

const features = [
    {
        icon: FileText,
        title: 'Legal & Policy Document Simplifier',
        description:
            'Upload complex legal, government, or policy documents. Saarthi translates and explains them in plain language — in any Indian language you choose.',
        badge: 'Document AI',
    },
    {
        icon: MessageSquare,
        title: 'WhatsApp Chat Interface',
        description:
            'Access Saarthi directly on WhatsApp. Send text queries, photos of documents, or PDFs. Saarthi analyzes media and responds in your language instantly.',
        badge: 'WhatsApp Bot',
    },
    {
        icon: Mic,
        title: 'Voice Helpline Assistant',
        description:
            'Call the Saarthi helpline. Speak your question in your mother tongue. Saarthi listens and speaks back the answer in a natural localized voice.',
        badge: 'Voice Channel',
    },
    {
        icon: Eye,
        title: 'Image & Document OCR',
        description:
            'Take a photo of a printed government form or notice. Saarthi reads and explains it using Vision AI — ideal for paper-heavy rural contexts.',
        badge: 'Vision AI',
    },
]

const steps = [
    {
        number: '01',
        title: 'Choose Your Language',
        description: 'Select one of 10+ supported Indian languages so Saarthi can communicate in your mother tongue.',
    },
    {
        number: '02',
        title: 'Ask or Upload',
        description: 'Type your question, speak it aloud, or upload a government document or photo for analysis.',
    },
    {
        number: '03',
        title: 'Get a Clear Answer',
        description: 'Receive a simple, actionable explanation sourced from verified government documents — read aloud if needed.',
    },
]

export default function LandingPage({ onStart }) {
    return (
        <div className="min-h-screen bg-white text-foreground font-sans">
            {/* Navigation */}
            <header className="sticky top-0 z-50 border-b border-border/60 bg-white/80 backdrop-blur-md">
                <nav className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-2.5">
                        {/* Logo */}
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/20">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="2" strokeLinejoin="round" fill="rgba(255,255,255,0.15)" />
                                <path d="M12 7v10M7 9.5l5 2.5 5-2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="font-bold text-lg tracking-tight">Saarthi</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="hidden sm:flex">
                            Multilingual AI for Citizens
                        </Badge>
                        <Button size="sm" onClick={onStart}>
                            Get Started <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </nav>
            </header>

            {/* Hero */}
            <section className="relative overflow-hidden border-b border-border/60">
                {/* Grid background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
                {/* Gradient blobs */}
                <div className="absolute top-0 left-1/4 h-72 w-72 -translate-y-1/2 rounded-full bg-blue-100/60 blur-3xl" />
                <div className="absolute top-0 right-1/4 h-72 w-72 -translate-y-1/2 rounded-full bg-violet-100/60 blur-3xl" />

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-white px-3 py-1 text-xs text-muted-foreground shadow-sm animate-fade-in">
                        <Zap className="h-3 w-3 text-amber-500" />
                        Powered by GPT-4o + RAG · 10+ Indian Languages
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4 animate-fade-in">
                        Your AI Guide to
                        <br />
                        <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                            Government Schemes
                        </span>
                    </h1>

                    <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground mb-4 animate-fade-in">
                        Saarthi is a <strong className="text-foreground font-medium">multilingual generative FAQ assistant</strong> and <strong className="text-foreground font-medium">legal/policy document simplifier</strong> built for rural citizens of India.
                    </p>

                    <p className="mx-auto max-w-xl text-sm text-muted-foreground mb-10 animate-fade-in">
                        Ask questions about PM Kisan, PMFBY, or any government policy — in Hindi, Tamil, Telugu, Marathi, and more. Upload a document or photo. Get a clear, simple answer.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in">
                        <Button size="xl" onClick={onStart} className="w-full sm:w-auto shadow-md">
                            Try Saarthi Free
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="xl"
                            className="w-full sm:w-auto"
                            onClick={() => document.getElementById('omnichannel')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            <BookOpen className="h-4 w-4" />
                            See How It Works
                        </Button>
                    </div>
                </div>
            </section>

            {/* Omnichannel Section */}
            <section id="omnichannel" className="py-20 border-b border-border/60 scroll-mt-14">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <div className="flex-1 text-left">
                            <Badge variant="secondary" className="mb-4">Omnichannel Accessibility</Badge>
                            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                                Accessible anywhere,
                                <br />
                                <span className="text-blue-600">even without a computer.</span>
                            </h2>
                            <p className="text-muted-foreground text-lg mb-8">
                                We designed Saarthi to meet citizens where they are. Whether they have a smartphone or just a feature phone, Saarthi is just a message or a call away.
                            </p>

                            <div className="grid gap-6">
                                <div className="flex gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 border border-green-100 shadow-sm">
                                        <MessageSquare className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">WhatsApp Integration</h4>
                                        <p className="text-sm text-muted-foreground">Send messages, photos, or PDFs. Get instant explanations in your chat.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shadow-sm">
                                        <Mic className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Voice Helpline</h4>
                                        <p className="text-sm text-muted-foreground">Speak your question on a call. Saarthi speaks the answer back in natural voice.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 relative">
                            {/* Visual representation placeholder */}
                            <div className="rounded-3xl border border-border/60 bg-muted/30 aspect-square overflow-hidden shadow-2xl p-8 flex items-center justify-center">
                                <div className="relative w-full max-w-md">
                                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full" />
                                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-violet-500/10 blur-3xl rounded-full" />

                                    <div className="relative bg-white border border-border/60 rounded-2xl shadow-xl p-6 space-y-4">
                                        <div className="flex items-center gap-3 border-b pb-4">
                                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">S</div>
                                            <div>
                                                <p className="font-bold text-sm">Saarthi AI</p>
                                                <p className="text-[10px] text-green-500">Online | Multilingual</p>
                                            </div>
                                        </div>
                                        <div className="bg-muted/50 p-3 rounded-lg rounded-tl-none mr-8">
                                            <p className="text-xs">"Namaste! Aap PM Kisan scheme ke baare mein jaanna chahte hain?"</p>
                                        </div>
                                        <div className="bg-primary text-white p-3 rounded-lg rounded-tr-none ml-8 text-right">
                                            <p className="text-xs">"Yes, in English please."</p>
                                        </div>
                                        <div className="bg-muted/50 p-3 rounded-lg rounded-tl-none mr-8">
                                            <p className="text-xs line-clamp-2">"Certainly! PM Kisan provides ₹6,000 per year to farmers in three installments..."</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
                <div className="text-center mb-12">
                    <Badge variant="secondary" className="mb-4">Features</Badge>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
                        Everything a citizen needs
                    </h2>
                    <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                        Built ground-up for accessibility, voice-first interaction, and support for every major Indian language.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {features.map((feature) => (
                        <Card key={feature.title} className="border-border/60 hover:border-primary/20 hover:shadow-md transition-all duration-200 group">
                            <CardHeader className="pb-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border/60 bg-muted/50 mb-3 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-200">
                                    <feature.icon className="h-4 w-4" />
                                </div>
                                <Badge variant="secondary" className="w-fit text-[10px] mb-2">{feature.badge}</Badge>
                                <CardTitle className="text-sm leading-snug">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-xs leading-relaxed">{feature.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Example Flow Section */}
            <section className="py-24 bg-muted/40 border-y border-border/60">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <Badge variant="outline" className="mb-4">Real-World Case Study</Badge>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                            How Saarthi Helps You
                        </h2>
                        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                            Saarthi guides citizens through complex eligibility checks by asking the right questions.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-4">User</span>
                                <div className="bg-white border border-border/60 shadow-sm p-4 rounded-2xl rounded-tl-none max-w-[85%]">
                                    <p className="text-sm font-medium">"Am I eligible for PM Kisan?"</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 items-end">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary mr-4">Saarthi</span>
                                <div className="bg-primary text-primary-foreground p-5 rounded-2xl rounded-tr-none max-w-[90%] shadow-lg shadow-primary/10">
                                    <p className="text-sm font-medium mb-3 font-mono leading-tight">Please answer:</p>
                                    <ul className="space-y-1 text-sm opacity-90">
                                        <li className="flex items-center gap-2">• Land size?</li>
                                        <li className="flex items-center gap-2">• Which state?</li>
                                        <li className="flex items-center gap-2">• Land ownership?</li>
                                        <li className="flex items-center gap-2">• Annual income?</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 items-end">
                                <div className="bg-primary text-primary-foreground p-5 rounded-2xl rounded-tr-none max-w-[90%] shadow-lg shadow-primary/10 border-t border-primary-foreground/10">
                                    <p className="text-base font-bold mb-4 flex items-center gap-2">
                                        You are eligible ✅
                                    </p>
                                    <p className="text-sm font-bold mb-2">Steps to apply:</p>
                                    <ol className="space-y-2 text-sm opacity-90 list-decimal pl-4">
                                        <li>Visit CSC</li>
                                        <li>Carry Aadhaar</li>
                                        <li>Bank details</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        <div className="relative group p-1">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                            <div className="relative bg-white border border-border/60 rounded-2xl p-10 shadow-xl overflow-hidden">
                                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                    Dynamic Reasoning
                                </h4>
                                <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                                    Saarthi doesn't just read documents — it understands the logic of government schemes and performs real-time eligibility checks in your language.
                                </p>
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            <span>Policy Matching</span>
                                            <span>94%</span>
                                        </div>
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden p-0.5">
                                            <div className="h-full bg-primary rounded-full w-[94%]"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            <span>Logical Deduction</span>
                                            <span>88%</span>
                                        </div>
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden p-0.5">
                                            <div className="h-full bg-violet-500 rounded-full w-[88%]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="border-t border-border/60 bg-muted/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
                    <div className="text-center mb-12">
                        <Badge variant="secondary" className="mb-4">How It Works</Badge>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
                            Simple as 1 — 2 — 3
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-6">
                        {steps.map((step, i) => (
                            <div key={step.number} className="flex flex-col items-start">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl font-bold text-primary/20 font-mono">{step.number}</span>
                                    {i < steps.length - 1 && (
                                        <div className="hidden sm:block h-px flex-1 bg-border/60" />
                                    )}
                                </div>
                                <h3 className="font-semibold text-sm mb-2">{step.title}</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Language Support Banner */}
            <section className="border-t border-border/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white">
                                <Languages className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">10+ Indian Languages Supported</p>
                                <p className="text-xs text-muted-foreground">Hindi · Tamil · Telugu · Kannada · Marathi · Bengali · Gujarati · Punjabi · Malayalam · Odia</p>
                            </div>
                        </div>
                        <Button onClick={onStart} size="lg" className="flex-shrink-0">
                            Select Your Language <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="border-t border-border/60 bg-primary text-primary-foreground">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
                        Ready to get started?
                    </h2>
                    <p className="text-primary-foreground/70 text-sm mb-8 max-w-md mx-auto">
                        Join thousands of citizens who use Saarthi to understand their rights and entitlements.
                    </p>
                    <Button
                        variant="outline"
                        size="xl"
                        onClick={onStart}
                        className="bg-white text-primary hover:bg-primary-foreground border-white/20"
                    >
                        Start for Free <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="2" strokeLinejoin="round" fill="rgba(255,255,255,0.15)" />
                            </svg>
                        </div>
                        <span className="font-semibold text-xs text-muted-foreground">Saarthi</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Multilingual AI assistant for Indian citizens · Built with OpenAI GPT-4o + RAG
                    </p>
                    <div className="flex flex-col items-center sm:items-end gap-1">
                        <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">Privacy First</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            Developed for LinguaVerse by <span className="font-semibold text-foreground/80">Arnav Shrivastava & Kunal Krishna</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
