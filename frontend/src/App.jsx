import { useState, useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ChatPanel from './components/ChatPanel'
import EmptyState from './components/EmptyState'
import ApiKeyModal from './components/ApiKeyModal'

async function readDirectory(dirHandle, depth = 0) {
  const entries = []
  for await (const [name, handle] of dirHandle.entries()) {
    if (name.startsWith('.') || name === 'node_modules' || name === 'dist') continue
    if (handle.kind === 'directory') {
      const children = depth < 3 ? await readDirectory(handle, depth + 1) : []
      entries.push({ name, type: 'folder', handle, children })
    } else {
      let size = ''
      try {
        const file = await handle.getFile()
        const bytes = file.size
        if (bytes < 1024) size = bytes + ' B'
        else if (bytes < 1024 * 1024) size = (bytes / 1024).toFixed(1) + ' KB'
        else size = (bytes / (1024 * 1024)).toFixed(1) + ' MB'
      } catch {
        size = ''
      }
      entries.push({ name, type: 'file', handle, size })
    }
  }
  entries.sort((a, b) => {
    if (a.type === 'folder' && b.type !== 'folder') return -1
    if (a.type !== 'folder' && b.type === 'folder') return 1
    return a.name.localeCompare(b.name)
  })
  return entries
}

function App() {
  const [activeFile, setActiveFile] = useState(null)
  const [activeFileHandle, setActiveFileHandle] = useState(null)
  const [activeFileContent, setActiveFileContent] = useState('')
  const [workspace, setWorkspace] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAiGenerating, setIsAiGenerating] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('groq_api_key') || '')
  const [installPrompt, setInstallPrompt] = useState(null)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallApp = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  const handleSaveApiKey = (newKey) => {
    setApiKey(newKey)
    localStorage.setItem('groq_api_key', newKey)
  }

  const handleOpenFolder = async () => {
    if (!window.showDirectoryPicker) {
      alert('Browser ini tidak mendukung pembukaan folder lokal via File System Access API. Membuka mode Scratchpad.')
      handleStartScratchpad()
      return
    }

    try {
      const dirHandle = await window.showDirectoryPicker()
      setIsLoading(true)
      const files = await readDirectory(dirHandle)
      setWorkspace({
        name: dirHandle.name,
        path: dirHandle.name,
        handle: dirHandle,
        files
      })
      setActiveFile(null)
      setActiveFileHandle(null)
      setActiveFileContent('')
      setMessages([])
      setIsLoading(false)
    } catch {
      setIsLoading(false)
    }
  }

  const handleStartScratchpad = () => {
    setWorkspace({
      name: 'Scratchpad Workspace',
      path: 'Virtual Browser Session',
      handle: null,
      files: [
        { name: 'index.html', type: 'file', size: '1.2 KB' },
        { name: 'app.js', type: 'file', size: '840 B' },
        { name: 'style.css', type: 'file', size: '520 B' }
      ]
    })
    setActiveFile('index.html')
    setActiveFileHandle(null)
    setActiveFileContent('<div class="app">\n  <h1>Voice Code Agent</h1>\n</div>')
    setMessages([])
  }

  const handleFileSelect = async (fileName, fileHandle) => {
    setActiveFile(fileName)
    setActiveFileHandle(fileHandle || null)

    if (fileHandle) {
      try {
        const file = await fileHandle.getFile()
        const text = await file.text()
        setActiveFileContent(text)
      } catch {
        setActiveFileContent('')
      }
    } else {
      setActiveFileContent('')
    }
  }

  const handleApplyCode = async (code) => {
    if (!activeFileHandle) {
      navigator.clipboard.writeText(code)
      alert('Kode telah disalin ke clipboard karena tidak ada akses file langsung.')
      return false
    }

    try {
      const writable = await activeFileHandle.createWritable()
      await writable.write(code)
      await writable.close()
      setActiveFileContent(code)
      return true
    } catch {
      navigator.clipboard.writeText(code)
      alert('Izin tulis ditolak oleh browser. Kode telah disalin ke clipboard.')
      return false
    }
  }

  const handleSendMessage = async (text, file) => {
    if (!text.trim() || isAiGenerating) return

    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    const userMsg = {
      role: 'user',
      timestamp: now,
      content: text,
      attachedFile: file
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setIsAiGenerating(true)

    try {
      let aiText = ''

      const apiRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          activeFile: file || activeFile || '',
          fileContent: activeFileContent || '',
          customApiKey: apiKey
        })
      }).catch(() => null)

      if (apiRes && apiRes.ok) {
        const data = await apiRes.json()
        aiText = data.reply || ''
      }

      if (!aiText && apiKey) {
        const directRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: `Kamu adalah AI Voice & Code Assistant.
Bantu user memahami kode, membuat kode baru, atau merefaktor kode.
Gunakan format markdown yang jelas jika menyertakan kode.
${activeFile ? `File aktif: ${activeFile}` : ''}
${activeFileContent ? `Isi file:\n${activeFileContent}` : ''}`
              },
              ...updatedMessages.slice(-10).map(m => ({ role: m.role, content: m.content }))
            ],
            temperature: 0.2
          })
        })

        if (directRes.ok) {
          const directData = await directRes.json()
          aiText = directData?.choices?.[0]?.message?.content || ''
        }
      }

      if (!aiText) {
        aiText = 'Tidak dapat menghubungi layanan AI. Pastikan GROQ_API_KEY telah diatur di Environment Variables Vercel atau simpan API key di tombol [API Key] pojok kanan atas.'
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          content: aiText,
          attachedFile: file
        }
      ])
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          content: `Terjadi kesalahan saat memanggil AI: ${err.message}`,
          attachedFile: file
        }
      ])
    } finally {
      setIsAiGenerating(false)
    }
  }

  const totalFiles = workspace
    ? workspace.files.reduce((acc, item) => {
        if (item.type === 'file') return acc + 1
        return acc + (item.children ? item.children.length : 0) + 1
      }, 0)
    : 0

  return (
    <div className="flex flex-col h-screen bg-dark-900 text-dark-200">
      <Header
        onNewProject={handleOpenFolder}
        onOpenSettings={() => setIsSettingsOpen(true)}
        installPrompt={installPrompt}
        onInstallApp={handleInstallApp}
      />

      {workspace ? (
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            workspace={workspace}
            activeFile={activeFile}
            onFileSelect={handleFileSelect}
          />
          <ChatPanel
            messages={messages}
            activeFile={activeFile}
            onSend={handleSendMessage}
            isAiGenerating={isAiGenerating}
            onApplyCode={handleApplyCode}
          />
        </div>
      ) : (
        <EmptyState
          onNewProject={handleOpenFolder}
          onStartScratchpad={handleStartScratchpad}
          isLoading={isLoading}
        />
      )}

      <footer className="flex items-center justify-between px-4 py-1.5 bg-dark-800 border-t border-dark-600 text-xs text-dark-400">
        {workspace ? (
          <>
            <span>{workspace.name} · {totalFiles} files</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-neon-green" />
              Connected
            </span>
          </>
        ) : (
          <>
            <span>No project opened</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-dark-500" />
              Idle
            </span>
          </>
        )}
      </footer>

      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentKey={apiKey}
        onSave={handleSaveApiKey}
      />
    </div>
  )
}

export default App
