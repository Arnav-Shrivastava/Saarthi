import React, { useState, useRef, useEffect } from 'react'
import AnswerCard from './AnswerCard'
import { Button } from '@/components/ui/button'
import { Paperclip, Mic, MicOff, Send, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

const API_BASE_URL = 'https://saarthi-production-7b58.up.railway.app'

function ChatInterface({ language, onBack, onFindSchemes, preFillMessage, onPreFillConsumed }) {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const chatEndRef = useRef(null)
  const fileInputRef = useRef(null)



  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async (textOverride = null) => {
    const text = textOverride || inputText
    if (!text.trim()) return

    const userMsg = { id: Date.now(), type: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setIsTyping(true)

    try {
      const formData = new FormData()
      formData.append('message', text)
      formData.append('language', language)

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()

      if (data.saarthi_response) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          type: 'saarthi',
          text: data.saarthi_response,
          sources: data.sources || [],
        }])
      } else {
        throw new Error('Empty response from AI')
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'saarthi',
        text: "I'm having trouble connecting to my brain right now. Please make sure the backend is running!",
      }])
    } finally {
      setIsTyping(false)
    }
  }

  // IMPORTANT: placed AFTER handleSend so the function reference is in scope
  useEffect(() => {
    if (preFillMessage) {
      handleSend(preFillMessage)
      onPreFillConsumed?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preFillMessage])

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setIsTyping(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('language', language)

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: formData })
      const data = await response.json()
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'saarthi', text: data.summary }])
    } catch (error) {
      console.error('Upload Error:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const toggleRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.')
      return
    }
    if (isRecording) { setIsRecording(false); return }

    const recognition = new window.webkitSpeechRecognition()
    const langMap = {
      English: 'en-US', Hindi: 'hi-IN', Tamil: 'ta-IN', Telugu: 'te-IN',
      Marathi: 'mr-IN', Bengali: 'bn-IN', Kannada: 'kn-IN', Gujarati: 'gu-IN',
      Punjabi: 'pa-IN', Malayalam: 'ml-IN',
    }
    recognition.lang = langMap[language] || 'en-US'
    recognition.onstart = () => setIsRecording(true)
    recognition.onend = () => setIsRecording(false)
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInputText(transcript)
      handleSend(transcript)
    }
    recognition.start()
  }

  const FIND_SCHEMES_SUGGESTION = '🎯 Find eligible schemes for me'

  const suggestions = [
    FIND_SCHEMES_SUGGESTION,
    'Tell me about PM Kisan Scheme',
    'What is crop insurance (PMFBY)?',
    'How to apply for Aadhaar card?',
  ]

  const handleSuggestionClick = (s) => {
    if (s === FIND_SCHEMES_SUGGESTION) {
      onFindSchemes?.()
    } else {
      handleSend(s)
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="2" strokeLinejoin="round" fill="rgba(255,255,255,0.15)" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">{language} Assistant</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Powered by GPT-5 + RAG</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse-soft" />
              Online
            </span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 text-muted-foreground animate-fade-in">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-muted/40 mb-5">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">How can I help you?</h2>
              <p className="text-sm text-muted-foreground mb-8 max-w-sm">
                Ask me anything about government schemes, policies, or upload a document to analyze — in {language}.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestionClick(s)}
                    className={cn(
                      'text-left text-xs px-3 py-3 rounded-lg border border-border/60 bg-background',
                      'hover:border-primary/30 hover:bg-muted/40 transition-all duration-150 text-muted-foreground hover:text-foreground',
                      s === FIND_SCHEMES_SUGGESTION && 'border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 font-medium'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex w-full animate-fade-in', msg.type === 'user' ? 'justify-end' : 'justify-start')}
              >
                {msg.type === 'saarthi' ? (
                  <div className="w-full">
                    <AnswerCard content={msg} language={language} />
                  </div>
                ) : (
                  <div className="max-w-[80%] bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed shadow-sm">
                    {msg.text}
                  </div>
                )}
              </div>
            ))
          )}

          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm border border-border/60 bg-muted/40">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border/60 bg-background/95 backdrop-blur-sm px-4 sm:px-6 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background shadow-sm px-3 py-2 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
              title="Upload document or image"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*, application/pdf"
            />

            <input
              type="text"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
              placeholder={`Type a message in ${language}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            />

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleRecording}
                className={cn(
                  'flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-lg transition-all',
                  isRecording
                    ? 'bg-red-100 text-red-500 animate-pulse'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
                title={isRecording ? 'Stop recording' : 'Start voice input'}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              <Button
                size="sm"
                onClick={() => handleSend()}
                disabled={!inputText.trim() && !isTyping}
                className="h-8 px-3 rounded-lg"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <p className="text-center text-[10px] text-muted-foreground mt-2">
            Saarthi may make mistakes. Verify important information from official government sources.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
