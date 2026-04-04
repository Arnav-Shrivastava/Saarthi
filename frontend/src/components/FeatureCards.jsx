import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, MessageSquare, Mic, Eye } from 'lucide-react'

const CATEGORY_COLORS = {
  'Document AI': '#185FA5',
  'WhatsApp Bot': '#1D9E75',
  'Voice Channel': '#E8601C',
  'Vision AI': '#7F77DD',
}

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

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 180,
      damping: 20,
    },
  },
}

export default function FeatureCards() {
  return (
    <section className="relative overflow-hidden border-y border-border/40">
      {/* Layer 1: Subtle grid lines */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'white',
          backgroundImage: `
            linear-gradient(to right, rgba(71,85,105,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(71,85,105,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Layer 2: Saffron glow — left */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,153,51,0.08) 0%, transparent 60%)',
        }}
      />
      {/* Layer 3: Violet glow — right */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 80% 30%, rgba(127,119,221,0.08) 0%, transparent 60%)',
        }}
      />
      {/* Layer 4: Soft center bloom */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(24,95,165,0.05) 0%, transparent 50%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 relative z-10">
      <div className="text-center mb-14">
        <Badge variant="secondary" className="mb-4 bg-white/60 backdrop-blur-sm border border-border/40">
          Features
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
          Everything a citizen needs
        </h2>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Built ground-up for accessibility, voice-first interaction, and support for every major Indian language.
        </p>
      </div>

      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        {features.map((feature) => {
          const borderColor = CATEGORY_COLORS[feature.badge] || '#185FA5'
          return (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{
                y: -6,
                boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
              }}
              transition={{ type: 'spring', stiffness: 180, damping: 20 }}
            >
              <Card
                className="h-full group cursor-default"
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: 'none',
                  borderLeft: `3px solid ${borderColor}`,
                  borderRadius: '12px',
                }}
              >
                <CardHeader className="pb-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg mb-3 transition-all duration-300"
                    style={{
                      background: `${borderColor}12`,
                      border: `1px solid ${borderColor}25`,
                    }}
                  >
                    <feature.icon className="h-4.5 w-4.5" style={{ color: borderColor }} />
                  </div>
                  <Badge
                    variant="secondary"
                    className="w-fit text-[10px] mb-2"
                    style={{
                      backgroundColor: `${borderColor}10`,
                      color: borderColor,
                      border: `1px solid ${borderColor}20`,
                    }}
                  >
                    {feature.badge}
                  </Badge>
                  <CardTitle className="text-sm leading-snug">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>
      </div>
    </section>
  )
}
