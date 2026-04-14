type TabId = 'status' | 'weekly' | 'schedule' | 'timeline'

const TABS: { id: TabId; label: string }[] = [
  { id: 'status', label: '시스템 현황' },
  { id: 'weekly', label: '주차별 진척도' },
  { id: 'schedule', label: '일정 현황' },
  { id: 'timeline', label: '타임라인' },
]

type Props = {
  active: TabId
  onChange: (id: TabId) => void
}

export default function TabNav({ active, onChange }: Props) {
  return (
    <div
      className="flex gap-1 px-4"
      style={{ borderBottom: '1px solid #1a1a35', backgroundColor: '#0e0e22' }}
    >
      {TABS.map(tab => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="px-5 py-3 text-sm font-medium rounded-t transition-colors"
            style={
              isActive
                ? {
                    backgroundColor: '#1a1a35',
                    color: '#e0e0f0',
                    borderBottom: '2px solid #378add',
                  }
                : { color: '#8888a0' }
            }
            onMouseEnter={e => {
              if (!isActive) {
                ;(e.currentTarget as HTMLElement).style.color = '#e0e0f0'
                ;(e.currentTarget as HTMLElement).style.backgroundColor = '#12122a'
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                ;(e.currentTarget as HTMLElement).style.color = '#8888a0'
                ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
              }
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export type { TabId }
