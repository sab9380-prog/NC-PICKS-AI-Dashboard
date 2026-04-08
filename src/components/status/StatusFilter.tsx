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
      {FILTERS.map(f => {
        const isActive = value === f.id
        return (
          <button
            key={f.id}
            onClick={() => onChange(f.id)}
            className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
            style={
              isActive
                ? { backgroundColor: '#1a1a35', color: '#e0e0f0', border: '1px solid #333360' }
                : { backgroundColor: 'transparent', color: '#8888a0', border: '1px solid transparent' }
            }
          >
            {f.label}
            <span
              className="ml-1.5 text-xs"
              style={{ color: isActive ? '#e0e0f0' : '#666680' }}
            >
              {counts[f.id]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export type { FilterValue }
