import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Globe, ArrowRight, Languages, MessageSquare, Mic,
  Shield, ChevronRight
} from 'lucide-react'
import Navbar from './Navbar'
import Hero from './Hero'
import FeatureCards from './FeatureCards'
import HowItWorks from './HowItWorks'
import CaseStudy from './CaseStudy'
import MagneticButton from './MagneticButton'
import AnimatedFooter from '@/components/ui/animated-footer'
import { SmokeBackground } from '@/components/ui/spooky-smoke-animation'
import { SpiralAnimation } from '@/components/ui/spiral-animation'
import { ContainerScroll } from '@/components/ui/container-scroll-animation'

export default function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen bg-white text-foreground font-sans">
      {/* Scroll-responsive Navbar */}
      <Navbar onStart={onStart} />

      {/* Hero — full wow treatment */}
      <Hero onStart={onStart} />

      {/* Omnichannel Section */}
      <section id="omnichannel" className="scroll-mt-14 relative overflow-hidden bg-[#f8f9fb] border-y border-border/60">
        {/* Subtle background shape */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#e8ecf4] blur-[80px] opacity-60" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 relative z-10">
          <div className="flex flex-col lg:flex-row items-start gap-16">
            {/* Left content */}
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            >
              <span className="inline-block px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-widest text-white bg-[#1a1a2e] mb-6">
                Digital Inclusion Hero
              </span>

              <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-foreground leading-[1.1] mb-6">
                No Internet? No<br />
                Smartphone?<br />
                <span className="underline decoration-[#FF9933] decoration-4 underline-offset-4">No Problem.</span>
              </h2>

              <p className="text-muted-foreground text-lg mb-10 max-w-lg leading-relaxed">
                Saarthi is built for the <strong className="text-foreground font-semibold">real India</strong>. While other apps require expensive phones and high-speed data, Saarthi works over a simple phone call.
              </p>

              {/* Voice Helpline Card */}
              <motion.div
                className="bg-white border border-border/60 rounded-2xl p-6 mb-4 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 140, damping: 20, delay: 0.1 }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 border border-amber-100 flex-shrink-0">
                    <Mic className="h-6 w-6 text-[#E8601C]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-lg">Voice Helpline (AI IVR)</h4>
                    <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                      Just dial <strong className="text-foreground font-semibold">+1 (360) 233-2489</strong> from any phone. Speak your question in your mother tongue, and Saarthi speaks the answer back.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* WhatsApp Card */}
              <motion.div
                className="bg-white border border-border/60 rounded-2xl p-6 mb-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 140, damping: 20, delay: 0.2 }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 border border-green-100 flex-shrink-0">
                    <MessageSquare className="h-6 w-6 text-[#1D9E75]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-lg">WhatsApp: +1 (415) 523-8886</h4>
                    <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                      Low data? No problem. Saarthi's lightweight WhatsApp bot handles text and voice notes effortlessly even on slow rural networks.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Live helpline bar */}
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-border/60 shadow-sm">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-muted-foreground text-sm font-medium">
                  Live Helpline: <strong className="text-foreground">+1 (360) 233-2489</strong>
                </span>
              </div>
            </motion.div>

            {/* Right — Bouncing phone call mockup */}
            <div className="flex-1 w-full max-w-lg lg:max-w-none flex justify-center lg:justify-end">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 via-violet-500/10 to-transparent blur-3xl rounded-full opacity-60 group-hover:opacity-80 transition-opacity" />

                <motion.div
                  className="relative w-64 sm:w-72 bg-[#1a1c1e] rounded-[40px] border-[8px] border-[#2d2f31] shadow-2xl overflow-hidden p-6 flex flex-col ring-1 ring-white/10"
                  style={{ aspectRatio: '1/2' }}
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {/* White screen area */}
                  <div className="w-full bg-[#f8fafc] rounded-xl flex-1 mb-8 overflow-hidden flex flex-col border border-black/10">
                    <div className="h-6 bg-[#e2e8f0] flex items-center justify-between px-3">
                      <div className="h-1.5 w-6 bg-[#94a3b8] rounded-full" />
                      <div className="flex gap-1">
                        <div className="h-1.5 w-1.5 bg-[#94a3b8] rounded-full" />
                        <div className="h-1.5 w-3 bg-[#94a3b8] rounded-full" />
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                      <div className="mb-4 p-3 bg-primary/10 rounded-full animate-bounce">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-primary">
                          <path d="M12 19v3" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                          <rect x="9" y="2" width="6" height="13" rx="3" />
                        </svg>
                      </div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter mb-1">Incoming call</p>
                      <p className="text-lg font-black text-[#0f172a] leading-none mb-4">Saarthi AI</p>
                      <div className="space-y-1.5 w-full">
                        <div className="h-2 w-full bg-slate-200 rounded-full" />
                        <div className="h-2 w-3/4 bg-slate-200 rounded-full mx-auto" />
                      </div>
                    </div>
                    <div className="p-3 bg-primary text-white text-[10px] font-bold text-center">SPEAKING...</div>
                  </div>

                  {/* Dial pad */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[1,2,3,4,5,6,7,8,9,'*',0,'#'].map((key) => (
                      <div key={key} className="h-10 sm:h-12 bg-[#2d2f31] rounded-lg flex items-center justify-center text-white/40 font-bold text-sm shadow-inner border border-white/5">
                        {key}
                      </div>
                    ))}
                  </div>
                  <div className="w-12 h-1 bg-[#2d2f31] rounded-full mx-auto" />
                </motion.div>

                {/* Speech bubble — top right */}
                <div className="absolute -top-6 -right-12 bg-white border border-border/60 shadow-xl rounded-2xl p-4 max-w-[180px]">
                  <p className="text-[11px] font-medium leading-relaxed italic">"Mera PM Kisan ka paisa kab aayega?"</p>
                </div>

                {/* Speech bubble — left */}
                <div className="absolute top-1/2 -left-12 bg-primary text-white shadow-xl rounded-2xl p-4 max-w-[180px]">
                  <p className="text-[11px] font-bold leading-relaxed">"Aapki agli kist ₹2000 jald hi aapke bank account mein jama hogi."</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <FeatureCards />

      {/* Case Study wrapped in ContainerScroll for 3D perspective effect */}
      <div className="bg-gradient-to-b from-white to-muted/20">
        <ContainerScroll
          titleComponent={
            <div>
              <Badge variant="outline" className="mb-4 backdrop-blur-sm">How Saarthi Works in Action</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
                Real-World <span className="bg-gradient-to-r from-[#185FA5] to-[#7F77DD] bg-clip-text text-transparent">Case Study</span>
              </h2>
              <p className="text-muted-foreground text-sm max-w-lg mx-auto">Scroll to reveal how Saarthi guides citizens through complex eligibility checks</p>
            </div>
          }
        >
          <div className="h-full w-full overflow-auto">
            <CaseStudy />
          </div>
        </ContainerScroll>
      </div>

      {/* How It Works */}
      <HowItWorks />

      {/* Language Support Banner */}
      <section className="border-t border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-gradient-to-r from-muted/30 to-muted/10 border border-border/40"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 140, damping: 20 }}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#185FA5] to-[#7F77DD] text-white shadow-lg">
                <Languages className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">10+ Indian Languages Supported</p>
                <p className="text-xs text-muted-foreground">Hindi · Tamil · Telugu · Kannada · Marathi · Bengali · Gujarati · Punjabi · Malayalam · Odia</p>
              </div>
            </div>
            <MagneticButton
              onClick={onStart}
              className="inline-flex items-center justify-center gap-2 h-10 px-6 text-sm font-medium rounded-lg bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-0 flex-shrink-0"
            >
              Select Your Language <ChevronRight className="h-4 w-4" />
            </MagneticButton>
          </motion.div>
        </div>
      </section>

      {/* Spiral Animation Showcase → CTA */}
      <section className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <SpiralAnimation />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <motion.h2
            className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 text-white text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 140, damping: 20 }}
          >
            Ready to get started?
          </motion.h2>
          <motion.p
            className="text-white/60 text-sm mb-10 max-w-md mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 140, damping: 20, delay: 0.1 }}
          >
            Join thousands of citizens who use Saarthi to understand their rights and entitlements.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 140, damping: 20, delay: 0.2 }}
          >
            <MagneticButton
              onClick={onStart}
              className="inline-flex items-center justify-center gap-2 h-12 px-10 text-base font-medium rounded-xl bg-gradient-to-r from-[#FF9933] to-[#E8601C] text-white shadow-xl shadow-[#FF9933]/20 hover:shadow-2xl hover:shadow-[#FF9933]/30 transition-shadow cursor-pointer border-0"
            >
              Start for Free <ArrowRight className="h-4 w-4" />
            </MagneticButton>
          </motion.div>
        </div>
      </section>

      {/* Animated Footer */}
      <AnimatedFooter onStart={onStart} />
    </div>
  )
}
