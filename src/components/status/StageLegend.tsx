import { useState } from 'react'

const STAGE_CARDS: { level: number; name: string; points: number; bg: string; text: string; items: string[] }[] = [
  { level: 0, name: '미착수', points: 0, bg: '#1a1a2a', text: '#666680', items: ['시작 전'] },
  { level: 1, name: '기획', points: 10, bg: '#1e2a50', text: '#85b7eb', items: ['요건 정의서 존재', 'PM 배정 완료', '일정 확정'] },
  { level: 2, name: '개발', points: 25, bg: '#1a3070', text: '#7070d0', items: ['스테이징 배포 완료', '테스트 통과율 ≥90%', 'MVP 수준 시 15점'] },
  { level: 3, name: '도입', points: 40, bg: '#0a2a40', text: '#5080c0', items: ['프로덕션 배포', '실 데이터 연결', '교육 완료율 ≥80%'] },
  { level: 4, name: '활용', points: 60, bg: '#2a1a00', text: '#f0c870', items: ['자동화율 ≥30%', '사용률 ≥70%', '시간 절감 ≥20%'] },
  { level: 5, name: '최적화', points: 80, bg: '#1a0a2a', text: '#c4b8f8', items: ['자동화율 ≥70%', '오류율 ≤5%', '인간 개입 ≤주 2회'] },
  { level: 6, name: '자동화', points: 100, bg: '#0a2a14', text: '#5dcaa5', items: ['자동화율 ≥95%', '오류율 ≤1%', 'MTTR ≤1시간', 'KPI 목표 달성'] },
]

export default function StageLegend() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        style={{ backgroundColor: '#0e0e22', border: '1px solid #1a1a35', color: '#b0b0c8' }}
      >
        <span style={{ color: '#8888a0' }}>{open ? '▾' : '▸'}</span>
        단계 정의 (L0~L6)
      </button>

      {open && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
          {STAGE_CARDS.map(s => (
            <div
              key={s.level}
              className="shrink-0 rounded-[10px] p-3"
              style={{ width: 160, backgroundColor: s.bg, border: '1px solid #1a1a35' }}
            >
              {/* Header */}
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-xs font-bold" style={{ color: s.text }}>L{s.level}</span>
                <span className="text-xs font-bold" style={{ color: s.text }}>{s.name}</span>
                <span className="text-[10px] ml-auto" style={{ color: s.text + 'aa' }}>{s.points}점</span>
              </div>

              {/* Items */}
              <div className="space-y-1">
                {s.items.map((item, i) => (
                  <div key={i} className="text-[11px] leading-relaxed" style={{ color: '#c0c0d8' }}>
                    · {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
