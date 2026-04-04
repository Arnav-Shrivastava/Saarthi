import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Lock, Eye, Trash2, Server, UserX, Globe, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const sections = [
  {
    icon: Eye,
    title: 'What We Collect',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    content: [
      'When you use the web chat, we temporarily process your text message and selected language to generate a response. This is not stored after your session.',
      'When you upload a document or image, the file is sent to our servers to extract text and generate a summary. Files are deleted immediately after processing.',
      'When you use the Voice Helpline via Twilio, your phone number is processed to maintain conversational context within a single call session only.',
      'When you use WhatsApp, your WhatsApp phone number is used as a session key to preserve conversational flow. No names or contacts are stored.',
    ],
  },
  {
    icon: Lock,
    title: 'What We Do NOT Collect',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    content: [
      'We do not store your Aadhaar number, PAN, bank account details, or any other sensitive government ID.',
      'We do not build user profiles, track browsing behaviour, or use cookies for advertising.',
      'We do not sell, rent, or share your data with any third parties beyond the AI and communication services listed below.',
      'We do not require account creation or email registration to use Saarthi.',
    ],
  },
  {
    icon: Server,
    title: 'Third-Party Services',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    content: [
      'OpenAI (gpt-5.4-nano): Your text queries are sent to OpenAI\'s API to generate responses. OpenAI\'s own privacy policy applies to this data. We use the API in a zero-data-retention configuration where available.',
      'Twilio: Voice and WhatsApp messages are routed through Twilio\'s infrastructure. Twilio\'s privacy policy applies to call and message metadata.',
      'FAISS Vector Store: Our RAG pipeline stores embeddings of government PDFs locally on our server. No personal data is indexed in the vector store.',
      'Railway.app: Our backend is hosted on Railway. Server logs may include IP addresses for error debugging, which are rotated regularly.',
    ],
  },
  {
    icon: Trash2,
    title: 'Data Retention',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    content: [
      'In-session chat history is held in memory only for the duration of your session (up to 10 messages) to enable conversational context. It is never written to a database.',
      'Uploaded files (PDF/image) are deleted from our server immediately after the AI processes them — usually within seconds.',
      'Voice call sessions expire after the call ends. WhatsApp conversation state expires when inactivity exceeds 24 hours.',
      'We do not maintain backups of user conversation data.',
    ],
  },
  {
    icon: UserX,
    title: 'Your Rights',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    content: [
      'Since we do not store personal data, there is nothing to delete upon request — your conversation data is already ephemeral by design.',
      'You may stop using Saarthi at any time without any data consequences.',
      'If you believe a document you uploaded was not deleted or you have a data concern, contact us at the email below and we will respond within 72 hours.',
      'Saarthi is intended for general informational purposes. It does not provide legal advice. Always verify scheme details with official government portals.',
    ],
  },
  {
    icon: Globe,
    title: 'Cookies & Tracking',
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
    content: [
      'We use localStorage to remember your selected language preference across browser sessions. This is a local browser store and not sent to our servers.',
      'We do not use Google Analytics, Meta Pixel, or any third-party analytics tracking scripts.',
      'We do not use advertising cookies or cross-site tracking of any kind.',
    ],
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.45 } }),
}

export default function PrivacyPolicyPage({ onBack }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <div className="border-b border-border/60 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-14">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Saarthi · Legal</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Saarthi is built for India's most vulnerable citizens. We take privacy seriously — our core principle is <strong className="text-foreground">Privacy First, No Data Stored</strong>.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: April 2026 · This policy applies to the Saarthi web app, voice helpline, and WhatsApp bot.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 space-y-6">

        {/* Privacy First callout */}
        <div className="flex items-start gap-4 rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
          <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground text-sm mb-1">Our core commitment</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Saarthi does not create accounts, require sign-ups, or build user profiles. All conversational data is ephemeral by design — held in memory for your session only and never written to a database.
            </p>
          </div>
        </div>

        {/* Sections */}
        {sections.map((sec, i) => (
          <motion.div
            key={sec.title}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className={cn('rounded-2xl border p-6 bg-white', sec.border)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', sec.bg)}>
                <sec.icon className={cn('w-4 h-4', sec.color)} />
              </div>
              <h2 className="font-semibold text-foreground text-lg">{sec.title}</h2>
            </div>
            <ul className="space-y-3">
              {sec.content.map((line, j) => (
                <li key={j} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                  <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2', sec.color.replace('text-', 'bg-'))} />
                  {line}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}

        {/* Disclaimer */}
        <div className="flex items-start gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground text-sm mb-1">Legal Disclaimer</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Saarthi provides general informational responses based on publicly available government data. It is not a substitute for professional legal or financial advice. Always verify eligibility and scheme details on official government portals such as india.gov.in or your state government website.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-2xl border border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-2">Contact Us</p>
          <p>
            For privacy-related concerns or data requests, reach out to the Saarthi team on GitHub:{' '}
            <a href="https://github.com/kunal12krishna" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@kunal12krishna</a>
            {' '}or{' '}
            <a href="https://github.com/Arnav-Shrivastava" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@Arnav-Shrivastava</a>.
            We aim to respond within 72 hours.
          </p>
        </div>
      </div>
    </div>
  )
}
