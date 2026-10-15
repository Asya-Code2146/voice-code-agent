import { useState } from 'react'
import { X, Monitor, FolderOpen, FileText, Download, HardDrive, ChevronRight, FolderPlus } from 'lucide-react'

const sidebarLocations = [
  { id: 'quick', label: 'Quick access', items: [
    { id: 'desktop', label: 'Desktop', icon: <Monitor className="w-4 h-4" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
    { id: 'downloads', label: 'Downloads', icon: <Download className="w-4 h-4" /> },
  ]},
  { id: 'thispc', label: 'This PC', items: [
    { id: 'c', label: 'Local Disk (C:)', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'd', label: 'Local Disk (D:)', icon: <HardDrive className="w-4 h-4" /> },
  ]},
]

const mockFolders = [
  { name: 'cloud-savvy-web', date: '12/09/2026' },
  { name: 'my-portfolio-site', date: '04/10/2026' },
  { name: 'spotify-playlist', date: '27/08/2026' },
  { name: 'latihan-javascript', date: '15/07/2026' },
  { name: 'tugas-kuliah', date: '02/06/2026' },
]

function FolderModal({ isOpen, onClose, onSelect }) {
  const [selectedLocation, setSelectedLocation] = useState('c')
  const [selectedFolder, setSelectedFolder] = useState('my-portfolio-site')
  const [folderInput, setFolderInput] = useState('my-portfolio-site')
  const [breadcrumb] = useState(['This PC', 'Local Disk (C:)', 'Users', 'Asya', 'Projects'])

  const handleFolderClick = (folderName) => {
    setSelectedFolder(folderName)
    setFolderInput(folderName)
  }

  const handleOpen = () => {
    const fullPath = `C:\\Users\\Asya\\Projects\\${folderInput}`
    onSelect(folderInput, fullPath)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Select project folder</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-50 border-b border-gray-200">
          <ChevronRight className="w-3 h-3 text-gray-400 rotate-180" />
          {breadcrumb.map((segment, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <ChevronRight className="w-3 h-3 text-gray-400" />}
              <span className="text-xs text-gray-600 hover:text-gray-900 cursor-pointer">{segment}</span>
            </div>
          ))}
        </div>

        <div className="flex" style={{ height: '280px' }}>
          <div className="w-40 border-r border-gray-200 py-2 overflow-y-auto bg-gray-50/50">
            {sidebarLocations.map((group) => (
              <div key={group.id} className="mb-2">
                <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedLocation(item.id)}
                    className={`flex items-center gap-2 w-full px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                      selectedLocation === item.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className={selectedLocation === item.id ? 'text-blue-500' : 'text-gray-400'}>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-[1fr_auto] gap-x-4 px-4 py-1.5 border-b border-gray-200 sticky top-0 bg-white">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Name</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Date modified</span>
            </div>
            {mockFolders.map((folder) => (
              <button
                key={folder.name}
                onClick={() => handleFolderClick(folder.name)}
                onDoubleClick={handleOpen}
                className={`grid grid-cols-[1fr_auto] gap-x-4 w-full px-4 py-2 text-left text-sm transition-colors cursor-pointer ${
                  selectedFolder === folder.name
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FolderOpen className={`w-4 h-4 shrink-0 ${
                    selectedFolder === folder.name ? 'text-blue-500' : 'text-yellow-500'
                  }`} />
                  <span className="truncate">{folder.name}</span>
                </div>
                <span className="text-xs text-gray-400">{folder.date}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 mb-3">
            <label className="text-xs text-gray-500 shrink-0">Folder:</label>
            <input
              type="text"
              value={folderInput}
              onChange={(e) => setFolderInput(e.target.value)}
              className="flex-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 text-gray-900"
            />
          </div>
          <div className="flex items-center justify-between">
            <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
              <FolderPlus className="w-3.5 h-3.5" />
              New folder
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleOpen}
                className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors cursor-pointer"
              >
                Open
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FolderModal
