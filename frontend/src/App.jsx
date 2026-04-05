import React, { useState } from 'react'
import './index.css'
import LanguageSelectorPage from './components/LanguageSelectorPage'
import ChatInterface from './components/ChatInterface'
import LandingPage from './components/LandingPage'
import SchemeRecommender from './components/SchemeRecommender'
import HowItWorksPage from './components/HowItWorksPage'
import PrivacyPolicyPage from './components/PrivacyPolicyPage'
import TermsOfServicePage from './components/TermsOfServicePage'
import ApiDocsPage from './components/ApiDocsPage'
import Sidebar from './components/Sidebar'
import ScamDetector from './components/ScamDetector'
import ComplaintDrafter from './components/ComplaintDrafter'

function App() {
  const getInitialView = () => {
    const params = new URLSearchParams(window.location.search);
    const viewQuery = params.get('view');
    if (viewQuery === 'how-it-works') return 'how-it-works';
    if (viewQuery === 'privacy') return 'privacy';
    if (viewQuery === 'terms') return 'terms';
    if (viewQuery === 'api-docs') return 'api-docs';
    return 'landing';
  }

  const [view, setView] = useState(getInitialView()) // landing, language, chat, etc.
  const [language, setLanguage] = useState(null)
  const [preFillMessage, setPreFillMessage] = useState(null)

  const handleStart = () => setView('language')

  const handleLanguageSelect = (lang) => {
    // Prime the speech engine to unlock it for future automated guidance
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('')
      utterance.volume = 0
      window.speechSynthesis.speak(utterance)
    }
    setLanguage(lang)
    setView('chat')
    localStorage.setItem('saarthi-language', lang)
  }

  const handleNavigate = (id) => {
    if (id === 'landing') {
      setView('landing')
      setLanguage(null)
    } else {
      setView(id)
    }
  }

  // Called from ChatInterface "Find My Schemes" suggestion
  const handleFindSchemes = () => setView('recommend')

  // Called from SchemeCard "Learn More" button — navigates to chat with pre-filled question
  const handleLearnMore = (scheme) => {
    const question = language === 'English'
      ? `Tell me everything about ${scheme.name} — how to apply, eligibility, and benefits.`
      : `${scheme.name} के बारे में सब कुछ बताएं।`
    setPreFillMessage(question)
    setView('chat')
  }

  // Determine active nav
  let activeNav = 'Home';
  if (view === 'language' || view === 'chat') activeNav = 'Change Language';
  if (view === 'recommend') activeNav = 'Find My Schemes';
  if (view === 'verify') activeNav = 'Scam Detector';
  if (view === 'draft') activeNav = 'Complaint Drafter';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans">
      {view === 'landing' ? (
        // Landing page: full width, scrollable
        <div className="flex-1 overflow-y-auto w-full">
          <LandingPage onStart={handleStart} onNavigate={(id) => setView(id)} />
        </div>
      ) : view === 'how-it-works' ? (
        <div className="flex-1 overflow-y-auto w-full">
          <HowItWorksPage onBack={() => setView('landing')} />
        </div>
      ) : view === 'privacy' ? (
        <div className="flex-1 overflow-y-auto w-full">
          <PrivacyPolicyPage onBack={() => setView('landing')} />
        </div>
      ) : view === 'terms' ? (
        <div className="flex-1 overflow-y-auto w-full">
          <TermsOfServicePage onBack={() => setView('landing')} />
        </div>
      ) : view === 'api-docs' ? (
        <div className="flex-1 overflow-y-auto w-full">
          <ApiDocsPage onBack={() => setView('landing')} />
        </div>
      ) : (
        <>
          {/* Sidebar and Main Content Area */}
          <div className="flex flex-1 overflow-hidden w-full">
            <Sidebar activeNav={activeNav} onNavigate={handleNavigate} />

            <main
              className="flex-1 flex flex-col relative overflow-hidden"
              style={{ backgroundColor: 'var(--bg-base)' }}
            >
              {view === 'language' && <LanguageSelectorPage onSelect={handleLanguageSelect} />}
              {view === 'chat' && (
                <ChatInterface
                  language={language}
                  onBack={() => setView('language')}
                  onFindSchemes={handleFindSchemes}
                  preFillMessage={preFillMessage}
                  onPreFillConsumed={() => setPreFillMessage(null)}
                />
              )}
              {view === 'recommend' && (
                <div className="flex-1 overflow-y-auto w-full h-full">
                  <SchemeRecommender
                    language={language}
                    onLearnMore={handleLearnMore}
                  />
                </div>
              )}
              {view === 'verify' && (
                <div className="flex-1 overflow-y-auto w-full h-full">
                  <ScamDetector
                    language={language}
                  />
                </div>
              )}
              {view === 'draft' && (
                <div className="flex-1 overflow-y-auto w-full h-full">
                  <ComplaintDrafter />
                </div>
              )}
            </main>
          </div>
        </>
      )}
    </div>
  )
}

export default App
