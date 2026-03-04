import React, { useState } from 'react'
import './index.css'
import LanguageSelect from './components/LanguageSelect'
import ChatInterface from './components/ChatInterface'
import LandingPage from './components/LandingPage'
import { Button } from '@/components/ui/button'
import { Home, Globe } from 'lucide-react'

function App() {
  const [view, setView] = useState('landing') // landing, language, chat
  const [language, setLanguage] = useState(null)

  const handleStart = () => setView('language')

  const handleLanguageSelect = (lang) => {
    setLanguage(lang)
    setView('chat')
    localStorage.setItem('saarthi-language', lang)
  }

  const handleBackToLanding = () => {
    setView('landing')
    setLanguage(null)
  }

  const handleBackToLanguage = () => setView('language')

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans">
      {view === 'landing' ? (
        // Landing page: full width, scrollable
        <div className="flex-1 overflow-y-auto">
          <LandingPage onStart={handleStart} />
        </div>
      ) : (
        <>
          {/* Sidebar — only shown in language/chat views */}
          <aside className="hidden md:flex w-[220px] flex-shrink-0 flex-col border-r border-border/60 bg-muted/20 p-4">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8 px-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="2" strokeLinejoin="round" fill="rgba(255,255,255,0.15)" />
                  <path d="M12 7v10M7 9.5l5 2.5 5-2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">Saarthi</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">AI for Citizens</p>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-1 flex-1">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2 text-muted-foreground hover:text-foreground"
                onClick={handleBackToLanding}
              >
                <Home className="h-3.5 w-3.5" />
                Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2 text-muted-foreground hover:text-foreground"
                onClick={handleBackToLanguage}
              >
                <Globe className="h-3.5 w-3.5" />
                Change Language
              </Button>
            </nav>

            {/* Footer */}
            <div className="mt-auto pt-4 border-t border-border/60">
              {language && (
                <div className="flex items-center gap-2 px-1 mb-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[9px] font-bold font-mono">
                    {language.slice(0, 2).toUpperCase()}
                  </div>
                  <p className="text-xs text-muted-foreground">{language}</p>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground px-1">v1.0.0 · GPT-4o</p>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {view === 'language' && <LanguageSelect onSelect={handleLanguageSelect} />}
            {view === 'chat' && <ChatInterface language={language} onBack={handleBackToLanguage} />}
          </main>
        </>
      )}
    </div>
  )
}

export default App
