type TabId = 'status' | 'schedule' | 'timeline'

const TABS: { id: TabId; label: string }[] = [
  { id: 'status', label: '시스템 현황' },
  { id: 'schedule', label: '일정 현황' },
  { id: 'timeline', label: '타임라인' },
]

type Props = {
  active: TabId
  onChange: (id: TabId) => void
}

export default function TabNav({ active, onChange }: Props) {
  return (
    <div className="flex gap-1 px-4 bg-slate-900 border-b border-slate-800">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-5 py-3 text-sm font-medium rounded-t transition-colors ${
            active === tab.id
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export type { TabId }
