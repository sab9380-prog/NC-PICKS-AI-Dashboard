import { STAGES } from '../../data/stages'

const STAGE_DOT_COLORS: string[] = [
  '#444460', // L0 미착수
  '#85b7eb', // L1 기획
  '#7070d0', // L2 개발
  '#5080c0', // L3 도입
  '#f0c870', // L4 활용
  '#c4b8f8', // L5 최적화
  '#5dcaa5', // L6 자동화
]

export default function StageLegend() {
  return (
    <div className="flex flex-wrap gap-2">
      {STAGES.map((stage, i) => (
        <div
          key={stage.level}
          className="flex items-center gap-1.5 rounded-full px-3 py-1"
          style={{ backgroundColor: '#0e0e22', border: '1px solid #1a1a35' }}
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: STAGE_DOT_COLORS[i] ?? '#444460' }}
          />
          <span className="text-xs font-semibold" style={{ color: '#e0e0f0' }}>
            L{stage.level}
          </span>
          <span className="text-xs" style={{ color: '#555570' }}>
            {stage.name}
          </span>
          <span className="text-xs" style={{ color: '#333350' }}>
            {stage.points}pt
          </span>
        </div>
      ))}
    </div>
  )
}
