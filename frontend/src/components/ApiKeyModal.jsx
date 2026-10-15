import { useState } from 'react'
import { X, Key, Check, ShieldCheck } from 'lucide-react'

function ApiKeyModal({ isOpen, onClose, currentKey, onSave }) {
  const [keyInput, setKeyInput] = useState(currentKey || '')
  const [isSaved, setIsSaved] = useState(false)

  if (!isOpen) return null

  const handleSave = (e) => {
    e.preventDefault()
    onSave(keyInput.trim())
    setIsSaved(true)
    setTimeout(() => {
      setIsSaved(false)
      onClose()
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-dark-800 border border-dark-600 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-600">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-neon-yellow" />
            <h2 className="text-sm font-semibold text-dark-100">Pengaturan Groq API Key</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-dark-700 text-dark-400 hover:text-dark-200 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <p className="text-xs text-dark-300 leading-relaxed">
            Kunci ini disimpan secara lokal di browser kamu (localStorage) atau bisa juga menggunakan Environment Variable <code className="text-neon-blue">GROQ_API_KEY</code> di Vercel.
          </p>

          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1.5">
              Groq API Key (gsk_...)
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 text-sm bg-dark-900 border border-dark-600 focus:border-neon-blue rounded-lg text-dark-100 outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-dark-400">
            <ShieldCheck className="w-3.5 h-3.5 text-neon-green shrink-0" />
            <span>Kunci hanya digunakan untuk permintaan chat & kode ke Groq Cloud.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-dark-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-dark-300 hover:bg-dark-700 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-neon-blue hover:bg-neon-blue/80 rounded-lg transition-colors cursor-pointer"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Tersimpan!
                </>
              ) : (
                'Simpan Kunci'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ApiKeyModal
