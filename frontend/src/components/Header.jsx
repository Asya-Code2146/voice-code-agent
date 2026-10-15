import { Plus, Sparkles, Key, Download } from 'lucide-react'

function Header({ onNewProject, onOpenSettings, installPrompt, onInstallApp }) {
  return (
    <header className="flex items-center justify-between px-4 py-2.5 bg-dark-800 border-b border-dark-600">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neon-blue/20">
          <Sparkles className="w-4.5 h-4.5 text-neon-blue" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold text-dark-100 tracking-wide">AI Voice Code Agent</h1>
          <span className="text-[10px] text-dark-400">PWA Edition · Powered by Groq</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {installPrompt && (
          <button
            onClick={onInstallApp}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-dark-100 bg-dark-700 hover:bg-dark-600 border border-dark-500 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-neon-green" />
            Install PWA
          </button>
        )}

        <button
          onClick={onOpenSettings}
          title="Pengaturan API Key"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-dark-200 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-lg transition-colors cursor-pointer"
        >
          <Key className="w-3.5 h-3.5 text-neon-yellow" />
          API Key
        </button>

        <button
          onClick={onNewProject}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neon-blue hover:bg-neon-blue/80 rounded-lg transition-colors duration-150 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Buka Folder
        </button>
      </div>
    </header>
  )
}

export default Header
