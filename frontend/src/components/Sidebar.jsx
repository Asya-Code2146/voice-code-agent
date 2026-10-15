import { useState } from 'react'
import { Folder, FolderOpen, FileText, FileCode, FileJson, ChevronRight, ChevronDown } from 'lucide-react'

const fileIcons = {
  html: <FileCode className="w-4 h-4 text-neon-red" />,
  css: <FileCode className="w-4 h-4 text-neon-blue" />,
  js: <FileCode className="w-4 h-4 text-neon-yellow" />,
  jsx: <FileCode className="w-4 h-4 text-neon-blue" />,
  ts: <FileCode className="w-4 h-4 text-neon-blue" />,
  tsx: <FileCode className="w-4 h-4 text-neon-blue" />,
  json: <FileJson className="w-4 h-4 text-neon-yellow" />,
  md: <FileText className="w-4 h-4 text-dark-300" />,
}

function getFileIcon(filename) {
  const ext = filename.split('.').pop()
  return fileIcons[ext] || <FileText className="w-4 h-4 text-dark-400" />
}

function FileTreeItem({ item, depth, activeFile, onFileSelect }) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (item.type === 'folder') {
    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 w-full px-2 py-1 hover:bg-dark-700 rounded text-sm text-dark-300 transition-colors cursor-pointer"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {isExpanded
            ? <ChevronDown className="w-3.5 h-3.5 text-dark-500 shrink-0" />
            : <ChevronRight className="w-3.5 h-3.5 text-dark-500 shrink-0" />
          }
          {isExpanded
            ? <FolderOpen className="w-4 h-4 text-neon-blue shrink-0" />
            : <Folder className="w-4 h-4 text-neon-blue shrink-0" />
          }
          <span className="truncate">{item.name}</span>
        </button>
        {isExpanded && item.children && (
          <div>
            {item.children.map((child, idx) => (
              <FileTreeItem
                key={idx}
                item={child}
                depth={depth + 1}
                activeFile={activeFile}
                onFileSelect={onFileSelect}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  const isActive = item.name === activeFile

  return (
    <button
      onClick={() => onFileSelect(item.name, item.handle)}
      className={`flex items-center justify-between gap-1.5 w-full px-2 py-1 rounded text-sm transition-colors cursor-pointer ${
        isActive
          ? 'bg-neon-blue/20 text-neon-blue'
          : 'text-dark-300 hover:bg-dark-700'
      }`}
      style={{ paddingLeft: `${depth * 12 + 24}px` }}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        {getFileIcon(item.name)}
        <span className="truncate">{item.name}</span>
      </div>
      {item.size && (
        <span className="text-xs text-dark-500 shrink-0">{item.size}</span>
      )}
    </button>
  )
}

function Sidebar({ workspace, activeFile, onFileSelect }) {
  return (
    <aside className="w-64 shrink-0 bg-dark-800 border-r border-dark-600 flex flex-col overflow-hidden">
      <div className="px-3 py-3 border-b border-dark-600">
        <p className="text-[10px] uppercase tracking-widest text-dark-500 mb-1">Open Folder</p>
        <p className="text-sm font-semibold text-dark-100 truncate">{workspace.name}</p>
        <p className="text-xs text-dark-500 truncate">{workspace.path}</p>
      </div>
      <div className="flex-1 overflow-y-auto py-2 px-1">
        {workspace.files && workspace.files.length > 0 ? (
          workspace.files.map((item, idx) => (
            <FileTreeItem
              key={idx}
              item={item}
              depth={0}
              activeFile={activeFile}
              onFileSelect={onFileSelect}
            />
          ))
        ) : (
          <div className="p-3 text-xs text-dark-400 text-center">
            Folder kosong atau mode scratchpad
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
