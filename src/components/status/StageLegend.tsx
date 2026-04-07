import { STAGES } from '../../data/stages'

export default function StageLegend() {
  return (
    <div className="flex flex-wrap gap-2">
      {STAGES.map(stage => (
        <div
          key={stage.level}
          className="flex items-center gap-1.5 bg-slate-800 rounded-full px-3 py-1"
        >
          <span className="text-xs font-semibold text-slate-300">
            L{stage.level}
          </span>
          <span className="text-xs text-slate-400">{stage.name}</span>
          <span className="text-xs text-slate-500">{stage.points}pt</span>
        </div>
      ))}
    </div>
  )
}
