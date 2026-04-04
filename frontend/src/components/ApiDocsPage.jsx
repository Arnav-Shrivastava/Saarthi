import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Key, Code, Webhook, FileJson, Activity, Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'

const endpoints = [
  {
    method: 'POST',
    path: '/whatsapp',
    title: 'Twilio WhatsApp Webhook',
    description: 'Receives and processes incoming WhatsApp messages via Twilio.',
    icon: Webhook,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    payload: `// URL-encoded form data (Twilio standard)
SmsMessageSid: string
NumMedia: string
Body: string
From: string
...Twilio metadata`,
    response: `// Response content is spoken directly back to Twilio as TwiML XML
<Response>
  <Message>Hello! How can I help you?</Message>
</Response>`,
  },
  {
    method: 'POST',
    path: '/voice',
    title: 'Twilio Voice Inbound',
    description: 'Initial webhook triggered when a user calls the Saarthi phone number.',
    icon: PhoneHero, // We'll just map this to a different icon visually
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    payload: `// URL-encoded form data (Twilio standard)
CallSid: string
From: string
Direction: string`,
    response: `// Returns TwiML with <Gather> block requesting speed input
<Response>
  <Gather input="speech" action="/voice_response" timeout="5">
    <Say beep="true">Namaste. Welcome to Saarthi. Please speak your question.</Say>
  </Gather>
</Response>`,
  },
  {
    method: 'POST',
    path: '/voice_response',
    title: 'Twilio Voice Processor',
    description: 'Receives the transcribed text from Twilio/Whisper, runs it through RAG, and returns an audio response.',
    icon: Terminal,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    payload: `// URL-encoded form data
SpeechResult: string // The transcribed text
Confidence: string
From: string`,
    response: `// Returns spoken TwiML
<Response>
  <Say language="hi-IN">यहां आपकी योजना का विवरण है...</Say>
</Response>`,
  },
  {
    method: 'POST',
    path: '/recommend',
    title: 'Eligibility Engine',
    description: 'Accepts a user profile and returns a list of government schemes they are eligible for.',
    icon: FileJson,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    payload: `// application/json
{
  "profile": {
    "occupation": "farmer",
    "income": "50000",
    "age": "30",
    "land_size": "2"
  },
  "language": "Hindi"
}`,
    response: `// application/json
{
  "schemes": [
    {
      "name": "PM-KISAN",
      "description": "...",
      "benefit": "...",
      "how_to_apply": "...",
      "url": "..."
    }
  ]
}`,
  },
  {
    method: 'POST',
    path: '/verify-scam',
    title: 'Scam Detection',
    description: 'Verifies forwarded messages against known scam patterns and official data.',
    icon: Activity,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    payload: `// multipart/form-data
message: string (optional)
file: File (optional, image or pdf)`,
    response: `// application/json
{
  "status": "Scam" | "Real",
  "reasoning": "...",
  "confidence": "High"
}`,
  },
]

// Mocking PhoneHero since imported Phone might clash
function PhoneHero(props) {
  return <Terminal {...props} />
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.45 } }),
}

export default function ApiDocsPage({ onBack }) {
  // If no onBack is passed (e.g. opened in new tab), provide a fallback
  const handleBack = () => {
    if (onBack) onBack()
    else window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200">
      {/* Hero */}
      <div className="border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-14">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8 bg-transparent border-0 cursor-pointer p-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Code className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-sm font-medium text-gray-400">Saarthi Developers</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">REST API Documentation</h1>
          <p className="text-lg text-gray-400 max-w-2xl leading-relaxed">
            Integrate Saarthi's multilingual AI, scheme recommendation engine, and compliance tools directly into your own public service applications.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 space-y-12">
        {/* Auth callout */}
        <div className="flex items-start gap-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6">
          <Key className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-1" />
          <div>
            <p className="font-semibold text-white text-base mb-2">Authentication</p>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              All API endpoints require a Bearer token in the Authorization header. Waitlist registration is required to receive API keys. Twilio webhooks are protected by Twilio Signature Validation.
            </p>
            <pre className="bg-black/50 p-3 rounded-lg border border-white/5 text-xs text-emerald-400 font-mono inline-block">
              Authorization: Bearer saarthi_test_xxxxx
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">Endpoints</h2>
          <div className="space-y-6">
            {endpoints.map((ep, i) => (
              <motion.div
                key={ep.path}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
              >
                <div className="p-5 border-b border-white/5 flex items-center justify-between flex-wrap gap-4 bg-white/[0.02]">
                  <div className="flex items-center gap-4">
                    <span className={cn('px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border', ep.color, ep.bg, ep.border)}>
                      {ep.method}
                    </span>
                    <h3 className="font-mono text-sm text-white">{ep.path}</h3>
                  </div>
                  <span className="text-sm font-medium text-gray-400">{ep.title}</span>
                </div>
                
                <div className="p-6">
                  <p className="text-sm text-gray-400 mb-6">{ep.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 font-mono">Request Payload</p>
                      <div className="bg-[#0d0d12] border border-white/10 rounded-xl p-4 overflow-x-auto">
                        <pre className="text-[13px] leading-relaxed font-mono text-gray-300">
                          {ep.payload}
                        </pre>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 font-mono">Response Payload</p>
                      <div className="bg-[#0d0d12] border border-white/10 rounded-xl p-4 overflow-x-auto">
                        <pre className="text-[13px] leading-relaxed font-mono text-emerald-400">
                          {ep.response}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
