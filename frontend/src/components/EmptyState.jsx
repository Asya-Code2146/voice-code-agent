import { FolderOpen, Sparkles, Loader2, Mic, Code2 } from 'lucide-react'

function EmptyState({ onNewProject, onStartScratchpad, isLoading }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-dark-900 p-6">
      <div className="flex flex-col items-center gap-6 text-center max-w-lg">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-dark-800 border border-dark-600 shadow-xl">
          {isLoading ? (
            <Loader2 className="w-10 h-10 text-neon-blue animate-spin" />
          ) : (
            <Sparkles className="w-10 h-10 text-neon-blue" />
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-dark-100 mb-2">AI Voice Code Agent</h2>
          <p className="text-sm text-dark-400 leading-relaxed max-w-md">
            {isLoading
              ? 'Membaca struktur file dan direktori workspace...'
              : 'Asisten koding pintar dengan dukungan perintah suara (Voice-to-Code), analisis struktur project, dan integrasi Groq LLaMA 3.3.'}
          </p>
        </div>

        {!isLoading && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onNewProject}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-neon-blue hover:bg-neon-blue/80 rounded-xl transition-all shadow-lg hover:shadow-neon-blue/20 cursor-pointer"
            >
              <FolderOpen className="w-4.5 h-4.5" />
              Buka Folder Project
            </button>

            <button
              onClick={onStartScratchpad}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-dark-200 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-xl transition-all cursor-pointer"
            >
              <Code2 className="w-4.5 h-4.5 text-neon-green" />
              Mode Scratchpad (Tanpa Folder)
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm mt-2 text-left">
          <div className="p-3 rounded-lg bg-dark-800/60 border border-dark-700">
            <div className="flex items-center gap-2 text-xs font-semibold text-dark-200 mb-1">
              <Mic className="w-3.5 h-3.5 text-neon-red" />
              Perintah Suara
            </div>
            <p className="text-[11px] text-dark-400">
              Dikte kebutuhan koding dalam bahasa Indonesia atau Inggris.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-dark-800/60 border border-dark-700">
            <div className="flex items-center gap-2 text-xs font-semibold text-dark-200 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-neon-yellow" />
              PWA Siap Pakai
            </div>
            <p className="text-[11px] text-dark-400">
              Bisa di-install di Desktop dan Android sebagai aplikasi mandiri.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmptyState
