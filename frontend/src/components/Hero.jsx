import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, Zap } from 'lucide-react'
import Antigravity from './Antigravity'
import MagneticButton from './MagneticButton'
import { GooeyText } from '@/components/ui/gooey-text-morphing'

export default function Hero({ onStart }) {
  return (
    <section className="relative overflow-hidden min-h-[100vh] flex items-center justify-center" style={{ position: 'relative' }}>
      {/* Antigravity particle canvas — absolute background */}
      <Antigravity
        particleColor="#FF9933"
        backgroundColor="transparent"
        particleCount={80}
        interactionRadius={150}
      />

      {/* Gradient mesh background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] -translate-y-1/3 rounded-full bg-gradient-to-br from-[#FF9933]/20 to-[#FF9933]/5 blur-[100px]" />
        <div className="absolute top-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-[#185FA5]/15 to-[#7F77DD]/10 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[300px] w-[600px] rounded-full bg-gradient-to-t from-violet-100/30 to-transparent blur-[80px]" />
      </div>

      {/* Hero Content — above particles */}
      <div className="relative z-[1] max-w-4xl mx-auto px-4 sm:px-6 py-32 sm:py-40 text-center">
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/40 bg-white/70 backdrop-blur-sm px-4 py-1.5 text-xs text-muted-foreground shadow-sm"
        >
          <Zap className="h-3 w-3 text-amber-500" />
          Powered by GPT-4o + RAG · 10+ Indian Languages
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-2"
        >
          Your AI Guide to
        </motion.h1>

        {/* Gooey morphing text */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="h-[90px] sm:h-[110px] lg:h-[130px] mb-6 flex items-center justify-center"
        >
          <GooeyText
            texts={["Government Schemes", "सरकारी योजनाएं", "Citizen Rights", "Policy Access"]}
            morphTime={1.5}
            cooldownTime={0.5}
            className="h-full w-full"
            textClassName="font-bold bg-gradient-to-r from-[#FF9933] via-[#185FA5] to-[#7F77DD] bg-clip-text text-transparent text-3xl sm:text-5xl lg:text-6xl whitespace-nowrap"
          />
        </motion.div>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground mb-3"
        >
          Saarthi is a <strong className="text-foreground font-medium">multilingual generative FAQ assistant</strong> and <strong className="text-foreground font-medium">legal/policy document simplifier</strong> built for rural citizens of India.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mx-auto max-w-xl text-sm text-muted-foreground mb-12"
        >
          Ask questions about PM Kisan, PMFBY, or any government policy — in Hindi, Tamil, Telugu, Marathi, and more. Upload a document or photo. Get a clear, simple answer.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <MagneticButton
            onClick={onStart}
            className="inline-flex items-center justify-center gap-2 h-12 px-8 text-base font-medium rounded-xl bg-gradient-to-r from-[#FF9933] to-[#E8601C] text-white shadow-xl shadow-[#FF9933]/25 hover:shadow-2xl hover:shadow-[#FF9933]/30 transition-shadow cursor-pointer border-0"
          >
            Try Saarthi Free
            <ArrowRight className="h-4 w-4" />
          </MagneticButton>
          <MagneticButton
            onClick={() => document.getElementById('omnichannel')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center justify-center gap-2 h-12 px-8 text-base font-medium rounded-xl bg-white/70 backdrop-blur-sm border border-border/60 text-foreground shadow-sm hover:bg-white hover:shadow-md transition-all cursor-pointer"
          >
            <BookOpen className="h-4 w-4" />
            See How It Works
          </MagneticButton>
        </motion.div>

        {/* Floating stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="mt-16 flex items-center justify-center gap-8 sm:gap-12"
        >
          {[
            { value: '10+', label: 'Languages' },
            { value: '20+', label: 'Schemes' },
            { value: '3', label: 'Channels' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#FF9933] to-[#E8601C] bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent z-[2]" />
    </section>
  )
}
