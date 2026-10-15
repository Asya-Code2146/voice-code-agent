import { useState, useRef, useEffect } from 'react'
import { Send, FileCode, Bot, User, Mic, MicOff, Copy, Check, Loader2, Sparkles, Save } from 'lucide-react'

function CodeSnippet({ code, language, onApplyCode, hasActiveFile }) {
  const [copied, setCopied] = useState(false)
  const [applied, setApplied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const handleApply = async () => {
    if (!onApplyCode) return
    const success = await onApplyCode(code)
    if (success) {
      setApplied(true)
      setTimeout(() => setApplied(false), 1500)
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-dark-600 bg-dark-900 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-dark-800 border-b border-dark-700 text-xs text-dark-400">
        <span className="font-mono text-neon-blue">{language || 'code'}</span>
        <div className="flex items-center gap-1.5">
          {hasActiveFile && onApplyCode && (
            <button
              onClick={handleApply}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-dark-700 hover:bg-dark-600 text-dark-200 transition-colors cursor-pointer"
            >
              {applied ? <Check className="w-3 h-3 text-neon-green" /> : <Save className="w-3 h-3 text-neon-yellow" />}
              <span>{applied ? 'Diterapkan' : 'Terapkan'}</span>
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-dark-700 hover:bg-dark-600 text-dark-200 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3 text-dark-300" />}
            <span>{copied ? 'Tersalin' : 'Salin'}</span>
          </button>
        </div>
      </div>
      <pre className="p-3 text-xs font-mono overflow-x-auto text-dark-100 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function RenderMessageContent({ content, onApplyCode, hasActiveFile }) {
  if (!content) return null

  const parts = []
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g
  let lastIndex = 0
  let match

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        text: content.substring(lastIndex, match.index)
      })
    }
    parts.push({
      type: 'code',
      language: match[1] || 'plaintext',
      code: match[2].trim()
    })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      text: content.substring(lastIndex)
    })
  }

  if (parts.length === 0) {
    return <p className="text-sm text-dark-200 leading-relaxed whitespace-pre-wrap">{content}</p>
  }

  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <CodeSnippet
              key={index}
              code={part.code}
              language={part.language}
              onApplyCode={onApplyCode}
              hasActiveFile={hasActiveFile}
            />
          )
        }
        return (
          <p key={index} className="text-sm text-dark-200 leading-relaxed whitespace-pre-wrap">
            {part.text}
          </p>
        )
      })}
    </div>
  )
}

function ChatMessage({ message, onApplyCode, hasActiveFile }) {
  const isUser = message.role === 'user'

  return (
    <div className={`px-5 py-3 transition-colors ${isUser ? 'bg-dark-900/40' : 'bg-dark-800/30'}`}>
      <div className="flex items-start gap-3">
        <div
          className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 mt-0.5 ${
            isUser ? 'bg-neon-blue/20' : 'bg-neon-green/20'
          }`}
        >
          {isUser ? <User className="w-3.5 h-3.5 text-neon-blue" /> : <Bot className="w-3.5 h-3.5 text-neon-green" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold ${isUser ? 'text-neon-blue' : 'text-neon-green'}`}>
              {isUser ? 'You' : 'Voice Code Assistant'}
            </span>
            <span className="text-[10px] text-dark-500">{message.timestamp}</span>
            {message.attachedFile && (
              <span className="flex items-center gap-1 text-[10px] text-dark-400 bg-dark-700 px-1.5 py-0.5 rounded">
                <FileCode className="w-2.5 h-2.5" />
                {message.attachedFile}
              </span>
            )}
          </div>
          <RenderMessageContent
            content={message.content}
            onApplyCode={onApplyCode}
            hasActiveFile={hasActiveFile}
          />
        </div>
      </div>
    </div>
  )
}

function ChatPanel({ messages, activeFile, onSend, isAiGenerating, onApplyCode }) {
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAiGenerating])

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const handleVoiceToggle = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Browser kamu tidak mendukung fitur Web Speech API. Silakan gunakan Google Chrome atau Edge.')
      return
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsListening(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'id-ID'
      recognition.continuous = false
      recognition.interimResults = true

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event) => {
        let transcript = ''
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        if (transcript) {
          setInput(transcript)
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
          }
        }
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch {
      setIsListening(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || isAiGenerating) return
    onSend(input, activeFile)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-dark-900">
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-dark-600 bg-dark-800">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-dark-400">Target File:</span>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-dark-700 text-neon-blue">
            {activeFile || 'Semua Folder'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-dark-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            Groq LLaMA 3.3 70B
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-dark-800 border border-dark-600 flex items-center justify-center mb-4 text-neon-blue">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-dark-100 mb-1">Siap Menerima Perintah Suara & Teks</h3>
            <p className="text-xs text-dark-400 max-w-sm mb-4 leading-relaxed">
              Tekan ikon mikrofon untuk berbicara atau ketik instruksi koding. AI akan membantu menganalisis file dan membuat solusi kode.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-md">
              <button
                onClick={() => setInput('Buatkan struktur dasar HTML dan Tailwind CSS modern')}
                className="px-3 py-1.5 text-xs bg-dark-800 hover:bg-dark-700 border border-dark-600 text-dark-300 rounded-lg transition-colors cursor-pointer"
              >
                Buatkan struktur dasar HTML
              </button>
              <button
                onClick={() => setInput('Bagaimana cara membuat PWA dengan service worker?')}
                className="px-3 py-1.5 text-xs bg-dark-800 hover:bg-dark-700 border border-dark-600 text-dark-300 rounded-lg transition-colors cursor-pointer"
              >
                Cara membuat PWA
              </button>
              <button
                onClick={() => setInput('Analisis dan buat fungsi JavaScript untuk memproses data')}
                className="px-3 py-1.5 text-xs bg-dark-800 hover:bg-dark-700 border border-dark-600 text-dark-300 rounded-lg transition-colors cursor-pointer"
              >
                Buat fungsi JavaScript
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-dark-700/50">
            {messages.map((msg, idx) => (
              <ChatMessage
                key={idx}
                message={msg}
                onApplyCode={onApplyCode}
                hasActiveFile={Boolean(activeFile)}
              />
            ))}
            {isAiGenerating && (
              <div className="px-5 py-3 bg-dark-800/20">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-neon-green/20 shrink-0">
                    <Loader2 className="w-3.5 h-3.5 text-neon-green animate-spin" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-dark-400">
                    <span>AI sedang berpikir & menyusun kode...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-dark-600 bg-dark-800">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-2 bg-dark-700 rounded-xl border border-dark-600 focus-within:border-neon-blue/50 transition-colors p-1.5">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? 'Mendengarkan suara kamu... Silakan bicara!' : 'Ketik instruksi atau gunakan tombol suara...'}
              rows={1}
              className="flex-1 bg-transparent text-sm text-dark-100 placeholder-dark-400 px-3 py-2 resize-none outline-none max-h-32"
            />

            <button
              type="button"
              onClick={handleVoiceToggle}
              title={isListening ? 'Hentikan dikte suara' : 'Bicara lewat suara (Voice)'}
              className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all cursor-pointer shrink-0 ${
                isListening
                  ? 'bg-neon-red text-white animate-pulse'
                  : 'bg-dark-600 hover:bg-dark-500 text-dark-200'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-neon-blue" />}
            </button>

            <button
              type="submit"
              disabled={!input.trim() || isAiGenerating}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neon-blue hover:bg-neon-blue/80 disabled:bg-dark-600 disabled:text-dark-500 rounded-lg transition-colors cursor-pointer shrink-0 disabled:cursor-not-allowed"
            >
              {isAiGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Kirim</span>
            </button>
          </div>

          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-dark-400">
            <div className="flex items-center gap-2">
              {activeFile && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-dark-700 rounded text-neon-blue">
                  <FileCode className="w-3 h-3" />
                  {activeFile}
                </span>
              )}
              {isListening && (
                <span className="flex items-center gap-1 text-neon-red font-medium">
                  <span className="w-2 h-2 rounded-full bg-neon-red animate-ping" />
                  Merekam suara...
                </span>
              )}
            </div>
            <span>Ctrl + Enter untuk kirim</span>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatPanel
