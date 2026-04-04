import React from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'

export default function Navbar({ onStart }) {
  const [scrolled, setScrolled] = React.useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 60)
  })

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/60"
      style={{
        backgroundColor: 'rgba(250, 250, 247, 0.8)',
        backdropFilter: 'blur(12px)',
      }}
      animate={{
        height: scrolled ? 56 : 72,
      }}
      transition={{ duration: 0.2 }}
      layout
    >
      <div className="max-w-7xl mx-auto flex h-full items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          {/* Logo */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="2" strokeLinejoin="round" fill="rgba(255,255,255,0.15)" />
              <path d="M12 7v10M7 9.5l5 2.5 5-2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight">
            Saarthi
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="hidden sm:flex">
            Multilingual AI for Citizens
          </Badge>
          <Button
            size="sm"
            onClick={onStart}
          >
            Get Started <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.nav>
  )
}
