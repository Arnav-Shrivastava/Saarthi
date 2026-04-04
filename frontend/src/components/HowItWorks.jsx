import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Globe, Upload, CheckCircle } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Choose Your Language',
    description: 'Select one of 10+ supported Indian languages. Saarthi adapts its entire interface — text, voice, and document analysis — to your mother tongue.',
    icon: Globe,
    status: 'Start Here',
    tags: ['Multilingual', 'Inclusive'],
    gradient: 'from-violet-500 to-indigo-500',
    gradientLight: 'from-violet-400 to-indigo-400',
    iconColor: 'text-violet-500',
    iconBg: 'bg-violet-500/10',
    features: ['Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', '+ more'],
    colSpan: 'col-span-12 md:col-span-5',
  },
  {
    number: '02',
    title: 'Ask or Upload',
    description: 'Type your question, speak it aloud via phone call, send a WhatsApp message, or upload a government document or photo for instant AI analysis.',
    icon: Upload,
    status: 'Multi-Channel',
    tags: ['Voice', 'WhatsApp', 'OCR', 'Text'],
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
    description: 'Receive a simple, actionable explanation sourced from verified government documents — read aloud in natural voice if needed. Saarthi even checks your eligibility.',
    icon: CheckCircle,
    status: 'AI-Powered',
    tags: ['RAG', 'Eligibility', 'Verified'],
    gradient: 'from-emerald-500 to-green-500',
    gradientLight: 'from-emerald-400 to-green-400',
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-500/10',
    features: ['Scheme Eligibility', 'Step-by-step Guide', 'Voice Response', 'Scam Detection'],
    colSpan: 'col-span-12 md:col-span-12',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 md:py-32 border-t border-border/60 bg-gradient-to-b from-white to-muted/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header — Features-5 inspired */}
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end md:px-4">
          <div>
            <Badge variant="secondary" className="mb-4">How It Works</Badge>
            <h2 className="max-w-lg text-4xl font-bold md:text-5xl tracking-tight">
              Simple as
              <span className="bg-gradient-to-r from-[#185FA5] to-[#7F77DD] bg-clip-text text-transparent"> 1 — 2 — 3</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-md">
              From language selection to clear answers — Saarthi does the heavy lifting so citizens don't have to.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="whitespace-nowrap rounded-lg bg-[#1a1a2e] px-5 py-2.5 font-medium text-white shadow-xl transition-colors hover:bg-[#16213e] text-sm"
          >
            Try it now →
          </motion.button>
        </div>

        {/* Bento Grid — mashed from BentoGrid + BouncyCards */}
        <div className="grid grid-cols-12 gap-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              whileHover={{ scale: 0.97, rotate: index === 0 ? '-1deg' : index === 2 ? '0.5deg' : '-0.5deg' }}
              className={cn(
                'group relative min-h-[360px] cursor-pointer overflow-hidden rounded-2xl p-6 md:p-8 transition-all duration-300',
                'border border-gray-100 bg-white',
                'hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]',
                'hover:-translate-y-1 will-change-transform',
                step.colSpan,
                step.hasPersistentHover && 'shadow-[0_4px_20px_rgba(0,0,0,0.04)] -translate-y-0.5',
              )}
            >
              {/* Dot pattern overlay — BentoGrid */}
              <div className={`absolute inset-0 ${step.hasPersistentHover ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[length:4px_4px]" />
              </div>

              {/* Content */}
              <div className="relative flex flex-col h-full z-10">
                {/* Top row — icon + status */}
                <div className="flex items-center justify-between mb-4">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300', step.iconBg, 'group-hover:scale-110')}>
                    <step.icon className={cn('w-5 h-5', step.iconColor)} />
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-lg backdrop-blur-sm bg-black/[0.03] text-muted-foreground transition-colors duration-300 group-hover:bg-black/[0.06]">
                    {step.status}
                  </span>
                </div>

                {/* Step number + title */}
                <div className="mb-3">
                  <span className={cn('text-5xl font-bold bg-gradient-to-br bg-clip-text text-transparent opacity-20 group-hover:opacity-40 transition-opacity select-none', step.gradient)}>
                    {step.number}
                  </span>
                  <h3 className="font-semibold text-lg text-foreground tracking-tight -mt-2">
                    {step.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-md">
                  {step.description}
                </p>



              </div>

              {/* Bouncy gradient reveal panel — BouncyCards */}
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

              {/* Gradient border overlay — BentoGrid */}
              <div className={cn(
                'absolute inset-0 -z-10 rounded-2xl p-px bg-gradient-to-br from-transparent via-gray-100/50 to-transparent',
                step.hasPersistentHover ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                'transition-opacity duration-300',
              )} />
            </motion.div>
          ))}
        </div>


      </div>
    </section>
  )
}
