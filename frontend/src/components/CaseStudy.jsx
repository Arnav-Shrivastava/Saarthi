import React, { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Mic } from 'lucide-react'

// Animated counter hook
function useCountUp(target, duration = 1000, shouldStart = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!shouldStart) return
    let startTime = null
    let animId

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))

      if (progress < 1) {
        animId = requestAnimationFrame(step)
      }
    }

    animId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animId)
  }, [target, duration, shouldStart])

  return count
}

function AnimatedBar({ label, value, color, delay = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const count = useCountUp(value, 1000, isInView)

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        <span>{label}</span>
        <span>{count}%</span>
      </div>
      <div className="h-2.5 w-full bg-muted/60 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: '0%' }}
          animate={isInView ? { width: `${value}%` } : { width: '0%' }}
          transition={{
            duration: 1.2,
            ease: 'easeOut',
            delay: delay,
          }}
        />
      </div>
    </div>
  )
}

export default function CaseStudy() {
  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-muted/10 border-y border-border/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 backdrop-blur-sm">
            Real-World Case Study
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            How Saarthi Helps You
          </h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Saarthi guides citizens through complex eligibility checks by asking the right questions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Chat conversation demo */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          >
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-4">User</span>
              <div className="bg-white border border-border/40 shadow-sm p-4 rounded-2xl rounded-tl-none max-w-[85%]">
                <p className="text-sm font-medium">"Am I eligible for PM Kisan?"</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 items-end">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#185FA5] mr-4">Saarthi</span>
              <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white p-5 rounded-2xl rounded-tr-none max-w-[90%] shadow-lg">
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
              <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white p-5 rounded-2xl rounded-tr-none max-w-[90%] shadow-lg border-t border-white/10">
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
          </motion.div>

          {/* Dynamic Reasoning card */}
          <motion.div
            className="relative group p-1"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.2 }}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[#185FA5] to-[#FF9933] rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative bg-white/80 backdrop-blur-sm border border-border/40 rounded-2xl p-10 shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#185FA5]/5 rounded-full blur-3xl"></div>
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                Dynamic Reasoning
              </h4>
              <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                Saarthi doesn't just read documents — it understands the logic of government schemes and performs real-time eligibility checks in your language.
              </p>
              <div className="space-y-5">
                <AnimatedBar
                  label="Policy Matching"
                  value={94}
                  color="#185FA5"
                  delay={0}
                />
                <AnimatedBar
                  label="Logical Deduction"
                  value={88}
                  color="#7F77DD"
                  delay={0.15}
                />
              </div>

              {/* Channel badges */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-border/40">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-medium">
                  <MessageSquare className="h-3 w-3" />
                  WhatsApp
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-medium">
                  <Mic className="h-3 w-3" />
                  Voice
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
