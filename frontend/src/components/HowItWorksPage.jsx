import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Globe, Upload, CheckCircle, MessageSquare, Phone, FileText,
  Shield, Bot, Mic, Smartphone, ArrowLeft, Zap, Database, Users
} from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Choose Your Language',
    description: 'Select one of 10+ supported Indian languages. Saarthi adapts its entire interface — text, voice, and document analysis — to your mother tongue.',
    icon: Globe,
    status: 'Start Here',
    gradient: 'from-violet-500 to-indigo-500',
    gradientLight: 'from-violet-400 to-indigo-400',
    iconColor: 'text-violet-500',
    iconBg: 'bg-violet-500/10',
    features: ['Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', '+ 5 more'],
    colSpan: 'col-span-12 md:col-span-5',
  },
  {
    number: '02',
    title: 'Ask or Upload',
    description: 'Type your question, speak it aloud via phone call, send a WhatsApp message, or upload a government document or photo for instant AI analysis.',
    icon: Upload,
    status: 'Multi-Channel',
    gradient: 'from-amber-500 to-orange-500',
    gradientLight: 'from-amber-400 to-orange-400',
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-500/10',
    features: ['Voice Call IVR', 'WhatsApp Bot', 'Document Upload', 'Photo OCR'],
    colSpan: 'col-span-12 md:col-span-7',
    hasPersistentHover: true,
  },
  {
    number: '03',
    title: 'Get a Clear Answer',
    description: 'Receive a simple, actionable explanation sourced from verified government documents — read aloud in natural voice if needed. Saarthi even checks your eligibility step by step.',
    icon: CheckCircle,
    status: 'AI-Powered',
    gradient: 'from-emerald-500 to-green-500',
    gradientLight: 'from-emerald-400 to-green-400',
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-500/10',
    features: ['Scheme Eligibility', 'Step-by-step Guide', 'Voice Response', 'Scam Detection'],
    colSpan: 'col-span-12',
  },
]

const channels = [
  {
    icon: MessageSquare,
    title: 'Web Chat',
    description: 'Chat directly on our website in your language. Upload documents or images and ask questions about them instantly.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: Phone,
    title: 'Voice Helpline',
    description: 'Call our IVR helpline and speak your question. Saarthi understands speech in 6 languages and reads the answer back to you.',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
  },
  {
    icon: Smartphone,
    title: 'WhatsApp Bot',
    description: 'Send a message on WhatsApp, share a photo of a document, or even a PDF — Saarthi will reply in your language instantly.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: FileText,
    title: 'Legal Drafter',
    description: 'Describe your problem naturally and Saarthi formats it into a formal complaint or FIR addressed to the relevant authority.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    icon: Shield,
    title: 'Scam Detector',
    description: 'Paste a forwarded message or upload an image. Saarthi cross-checks it against official government data and flags fakes.',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
  {
    icon: Bot,
    title: 'Scheme Recommender',
    description: 'Tell us your occupation, income, age and land size. Saarthi instantly finds every government scheme you are eligible for.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
]

const techStack = [
  {
    icon: Zap,
    title: 'gpt-5.4-nano',
    description: 'OpenAI\'s fastest, most cost-efficient model powers all language understanding, translation, and generation tasks.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
  {
    icon: Database,
    title: 'RAG Pipeline',
    description: 'Retrieval-Augmented Generation grounds every answer in verified PDF documents from official government sources.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Mic,
    title: 'Whisper ASR',
    description: 'OpenAI Whisper transcribes voice calls accurately in Indian languages — powering the entire IVR helpline.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Phone,
    title: 'Twilio IVR',
    description: 'Twilio handles inbound/outbound voice calls and WhatsApp messages, bridging citizens to Saarthi\'s AI.',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
}

export default function HowItWorksPage({ onBack }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <div className="border-b border-border/60 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-16">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF9933] to-[#E8601C] shadow-lg shadow-[#FF9933]/20">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="2" strokeLinejoin="round" fill="rgba(255,255,255,0.15)" />
              </svg>
            </div>
            <span className="text-sm font-medium text-muted-foreground">Saarthi</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            How Saarthi Works
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Saarthi is a multilingual AI assistant that bridges the gap between India's rural citizens and government services — across voice, WhatsApp, and web — in their own language.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-24">

        {/* 3 Steps Section */}
        <section>
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">The Process</p>
            <h2 className="text-3xl font-bold tracking-tight">Simple as <span className="bg-gradient-to-r from-[#185FA5] to-[#7F77DD] bg-clip-text text-transparent">1 — 2 — 3</span></h2>
            <p className="text-muted-foreground mt-2 max-w-lg">From language selection to clear answers — Saarthi does the heavy lifting so citizens don't have to.</p>
          </div>
          <div className="grid grid-cols-12 gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ scale: 0.97, rotate: index === 0 ? '-1deg' : index === 2 ? '0.5deg' : '-0.5deg' }}
                className={cn(
                  'group relative min-h-[320px] cursor-pointer overflow-hidden rounded-2xl p-6 md:p-8 transition-all duration-300',
                  'border border-gray-100 bg-white',
                  'hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 will-change-transform',
                  step.hasPersistentHover && 'shadow-[0_4px_20px_rgba(0,0,0,0.04)] -translate-y-0.5',
                  step.colSpan,
                )}
              >
                <div className={`absolute inset-0 ${step.hasPersistentHover ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[length:4px_4px]" />
                </div>
                <div className="relative flex flex-col h-full z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110', step.iconBg)}>
                      <step.icon className={cn('w-5 h-5', step.iconColor)} />
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-black/[0.03] text-muted-foreground">
                      {step.status}
                    </span>
                  </div>
                  <div className="mb-3">
                    <span className={cn('text-5xl font-bold bg-gradient-to-br bg-clip-text text-transparent opacity-20 group-hover:opacity-40 transition-opacity select-none', step.gradient)}>
                      {step.number}
                    </span>
                    <h3 className="font-semibold text-lg text-foreground tracking-tight -mt-2">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-md">{step.description}</p>
                </div>
                <div className={cn(
                  'absolute bottom-0 left-4 right-4 top-[65%] translate-y-8 rounded-t-2xl p-4 transition-transform duration-[250ms] group-hover:translate-y-4 group-hover:rotate-[2deg]',
                  'bg-gradient-to-br', step.gradientLight,
                )}>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {step.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-white/90">
                        <div className="w-1 h-1 rounded-full bg-white/60 flex-shrink-0" />
                        <span className="text-xs font-medium truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Channels */}
        <section>
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Access Channels</p>
            <h2 className="text-3xl font-bold tracking-tight">Every way to reach Saarthi</h2>
            <p className="text-muted-foreground mt-2 max-w-lg">No smartphone? No problem. Saarthi works across every channel a citizen might have access to.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((ch, i) => (
              <motion.div
                key={ch.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className={cn('rounded-2xl border p-5 bg-white hover:shadow-md transition-all', ch.border)}
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', ch.bg)}>
                  <ch.icon className={cn('w-5 h-5', ch.color)} />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{ch.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{ch.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section>
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Under the Hood</p>
            <h2 className="text-3xl font-bold tracking-tight">Built on cutting-edge AI</h2>
            <p className="text-muted-foreground mt-2 max-w-lg">Every layer of the Saarthi stack is chosen to maximise accuracy, speed, and language support at scale.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {techStack.map((t, i) => (
              <motion.div
                key={t.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="rounded-2xl border border-border/60 p-5 bg-muted/20 hover:bg-muted/40 transition-all"
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', t.bg)}>
                  <t.icon className={cn('w-5 h-5', t.color)} />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{t.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Who it's for */}
        <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-muted/30 to-muted/10 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#FF9933]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#FF9933]" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Built For</p>
              <h2 className="text-xl font-bold">Every Indian citizen</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { emoji: '🌾', title: 'Farmers', text: 'Find crop insurance, PM-KISAN eligibility, and Kisan Credit Card details in Hindi or Telugu.' },
              { emoji: '👷', title: 'Daily-wage Workers', text: 'Get MGNREGA job cards, ESIC health benefits, and PM Awas Yojana applications explained simply.' },
              { emoji: '🎓', title: 'Students', text: 'Discover scholarship schemes, PMKVY skill training, and Post-Matric benefits in your language.' },
            ].map((item) => (
              <div key={item.title} className="flex flex-col gap-2">
                <span className="text-3xl">{item.emoji}</span>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
