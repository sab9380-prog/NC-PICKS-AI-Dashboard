type FilterValue = 'all' | 'normal' | 'delay' | 'hold'

type Props = {
  value: FilterValue
  onChange: (v: FilterValue) => void
  counts: { all: number; normal: number; delay: number; hold: number }
}

const FILTERS: { id: FilterValue; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'normal', label: '정상' },
  { id: 'delay', label: '지연' },
  { id: 'hold', label: '보류' },
]

export default function StatusFilter({ value, onChange, counts }: Props) {
  return (
    <div className="flex gap-1">
      {FILTERS.map(f => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            value === f.id
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          {f.label}
          <span
            className={`ml-1.5 text-xs ${
              value === f.id ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            {counts[f.id]}
          </span>
        </button>
      ))}
    </div>
  )
}

export type { FilterValue }
