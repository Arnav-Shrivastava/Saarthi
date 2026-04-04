import React, { useState } from 'react'
import './index.css'
import LanguageSelectorPage from './components/LanguageSelectorPage'
import ChatInterface from './components/ChatInterface'
import LandingPage from './components/LandingPage'
import SchemeRecommender from './components/SchemeRecommender'
import ScamDetector from './components/ScamDetector'
// Remove AppNavbar as it's not needed for app pages
import Sidebar from './components/Sidebar'

function App() {
  const [view, setView] = useState('landing') // landing, language, chat, recommend, verify
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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans">
      {view === 'landing' ? (
        // Landing page: full width, scrollable
        <div className="flex-1 overflow-y-auto w-full">
          <LandingPage onStart={handleStart} />
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
            </main>
          </div>
        </>
      )}
    </div>
  )
}

export default App
