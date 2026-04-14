import { useState, type ReactNode } from 'react'
import TabNav, { type TabId } from './TabNav'

type Props = {
  header: ReactNode
  statusTab: ReactNode
  scheduleTab: ReactNode
  timelineTab: ReactNode
  onSettingsClick: () => void
  readOnly?: boolean
}

export default function AppShell({
  header,
  statusTab,
  scheduleTab,
  timelineTab,
  onSettingsClick,
  readOnly: _readOnly = false,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('status')

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#080812', color: '#e0e0f0' }}>
      {/* Sticky header — title + tabs only */}
      <div
        className="sticky top-0 z-30 shadow-lg"
        style={{ backgroundColor: '#0e0e22', borderBottom: '1px solid #1a1a35' }}
      >
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-extrabold tracking-tight" style={{ color: '#ffffff' }}>
              픽스 AI 시스템 대시보드
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <TabNav active={activeTab} onChange={setActiveTab} />
            <button
              onClick={onSettingsClick}
              className="p-1.5 rounded-lg transition-colors ml-2"
              style={{ color: '#8888a0' }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLElement).style.backgroundColor = '#1a1a35'
                ;(e.currentTarget as HTMLElement).style.color = '#e0e0f0'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                ;(e.currentTarget as HTMLElement).style.color = '#8888a0'
              }}
              title="설정"
              aria-label="설정"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable content: summary + tab content */}
      <main className="flex-1 overflow-auto">
        {/* Summary cards — scrolls with content */}
        <div className="px-4 pt-3 pb-2">{header}</div>

        {/* Tab content */}
        {activeTab === 'status' && statusTab}
        {activeTab === 'schedule' && scheduleTab}
        {activeTab === 'timeline' && timelineTab}
      </main>
    </div>
  )
}
