import React from 'react'
import { ArrowLeft, Scale, ShieldAlert, BookOpen, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
}

export default function TermsOfServicePage({ onBack }) {
  const handleBack = () => {
    if (onBack) onBack()
    else window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200 font-sans leading-relaxed">
      {/* Hero */}
      <div className="border-b border-gray-800/60 bg-gray-900/30">
        <div className="max-w-4xl mx-auto px-6 pt-12 pb-16">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-10 bg-transparent border-0 cursor-pointer p-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </button>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-inner shadow-orange-500/10">
              <Scale className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-sm font-semibold tracking-wide text-gray-400 uppercase">Legal Agreement</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-6">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            Please read these terms carefully before using Saarthi. By accessing or using the Saarthi platform via web, voice, or WhatsApp, you agree to be bound by these terms.
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs font-mono text-gray-500">
            <span>Last Updated: April 14, 2026</span>
            <span>•</span>
            <span>Effective immediately</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        {/* Important Notice */}
        <div className="flex items-start gap-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6">
          <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-white text-lg mb-2">Important Disclaimer</h3>
            <p className="text-sm text-gray-400">
              Saarthi is an independent AI tool designed to summarize publicly available Indian government scheme information. <strong>It is NOT an official government platform.</strong> Saarthi does not provide legally binding advice, guarantee scheme eligibility, or finalize government applications. Always verify details on official portals (e.g., india.gov.in).
            </p>
          </div>
        </div>

        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="space-y-4">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-3 border-b border-gray-800 pb-3">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            1. Use of Service
          </h2>
          <div className="space-y-4 text-gray-400 text-sm pl-8">
            <p>1.1. <strong>Eligibility:</strong> You must be at least 18 years old to use this Service. Minors may use the Service only under the supervision of a parent or legal guardian.</p>
            <p>1.2. <strong>Acceptable Use:</strong> You agree not to use Saarthi to generate spam, harass others, impersonate government officials, or submit fraudulent complaints via the Legal Drafter feature.</p>
            <p>1.3. <strong>Availability:</strong> While we strive for 99.9% uptime, Saarthi is provided on an "AS IS" and "AS AVAILABLE" basis. We reserve the right to modify, suspend, or discontinue the service (or any part thereof) with or without notice.</p>
          </div>
        </motion.div>

        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="space-y-4">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-3 border-b border-gray-800 pb-3">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            2. AI Limitations & Liability
          </h2>
          <div className="space-y-4 text-gray-400 text-sm pl-8">
            <p>2.1. <strong>Generative AI Nature:</strong> Because Saarthi relies on Generative AI (LLMs), it may occasionally produce "hallucinations" or inaccurate information. You should not rely on Saarthi alone for decisions with life-altering financial or legal consequences.</p>
            <p>2.2. <strong>Legal Drafter:</strong> The Legal Drafter tool provides formatting assistance based on user input. It does not constitute legal representation. Formatting a complaint through Saarthi does not automatically file it with the police or judiciary.</p>
            <p>2.3. <strong>Limitation of Liability:</strong> To the maximum extent permitted by applicable law, the creators of Saarthi shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.</p>
          </div>
        </motion.div>

        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="space-y-4">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-3 border-b border-gray-800 pb-3">
            <Scale className="w-5 h-5 text-emerald-400" />
            3. Privacy & Data
          </h2>
          <div className="space-y-4 text-gray-400 text-sm pl-8">
            <p>3.1. Our privacy practices are governed by our Privacy Policy. By using Saarthi, you acknowledge that you have read and understood our strict "No Data Stored" policy.</p>
            <p>3.2. Do not upload sensitive personal documents (e.g., unredacted Aadhaar cards with full numbers) unless strictly required for a query. Saarthi deletes uploads immediately after processing, but avoiding unnecessary sensitive uploads is a best practice.</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
