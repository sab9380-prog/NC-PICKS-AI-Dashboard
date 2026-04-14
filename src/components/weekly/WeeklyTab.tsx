import { useState } from 'react'
import type { ScoreSnapshot, SystemState, Member } from '../../types'
import { useWeeklyData, weekToKorean, weekDateRange } from '../../hooks/useWeeklyData'
import { getStageFromScore } from '../../lib/score'
import { STAGES } from '../../data/stages'
import { ZONES } from '../../data/zones'
import SystemDetailModal from './SystemDetailModal'

// âââ Style constants âââ
const C = {
  bg: '#080812',
  card: '#0e0e22',
  border: '#1a1a35',
  text: '#e0e0f0',
  muted: '#8a8aa5',
  dim: '#4a4a65',
  white: '#ffffff',
  blue: '#378add',
  green: '#4ade80',
  red: '#f87171',
  yellow: '#facc15',
} as const

function getHeatBg(score: number): string {
  if (score === 0) return 'transparent'
  if (score <= 5) return 'rgba(55,138,221,0.07)'
  if (score <= 10) return 'rgba(55,138,221,0.12)'
  if (score <= 15) return 'rgba(55,138,221,0.18)'
  if (score <= 20) return 'rgba(55,138,221,0.24)'
  if (score <= 30) return 'rgba(55,138,221,0.32)'
  if (score <= 40) return 'rgba(55,138,221,0.40)'
  if (score <= 50) return 'rgba(55,138,221,0.48)'
  if (score <= 60) return 'rgba(55,138,221,0.56)'
  if (score <= 70) return 'rgba(55,138,221,0.64)'
  if (score <= 80) return 'rgba(55,138,221,0.72)'
  if (score <= 90) return 'rgba(55,138,221,0.80)'
  return 'rgba(55,138,221,0.88)'
}

function getStageLabel(score: number): string {
  const level = getStageFromScore(score)
  return `L${level} ${STAGES[level].name}`
}

function getStageName(score: number): string {
  const level = getStageFromScore(score)
  return STAGES[level].name
}

function DeltaSpan({ delta, style }: { delta: number | null; style?: React.CSSProperties }) {
  if (delta === null || delta === 0) return <span style={{ color: C.dim, ...style }}>â</span>
  if (delta > 0) return <span style={{ color: C.green, fontWeight: 700, ...style }}>+{delta}</span>
  return <span style={{ color: C.red, fontWeight: 700, ...style }}>{delta}</span>
}

// âââ Main Component âââ
type Props = {
  snapshots: ScoreSnapshot[]
  states: Record<string, SystemState>
  members: Record<string, Member>
}

export default function WeeklyTab({ snapshots, states, members }: Props) {
  const memberNameMap = Object.fromEntries(
    Object.entries(members).map(([id, m]) => [id, { name: m.name }])
  )
  const data = useWeeklyData(snapshots, states, memberNameMap)

  const [selectedWeekIdx, setSelectedWeekIdx] = useState<number>(data.weeks.length - 1)
  const [detailSystemId, setDetailSystemId] = useState<string | null>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showGoodModal, setShowGoodModal] = useState(false)
  const [showWarnModal, setShowWarnModal] = useState(false)

  const currentWeek = data.weeks[selectedWeekIdx] ?? data.currentWeek
  const prevWeek = selectedWeekIdx > 0 ? data.weeks[selectedWeekIdx - 1] : null
  const koreanLabel = weekToKorean(currentWeek)
  const dateRange = weekDateRange(currentWeek)

  // Navigate weeks
  const canPrev = selectedWeekIdx > 0
  const canNext = selectedWeekIdx < data.weeks.length - 1
  const goPrev = () => canPrev && setSelectedWeekIdx(i => i - 1)
  const goNext = () => canNext && setSelectedWeekIdx(i => i + 1)

  // Determine which 3 weeks to show in table columns
  const tableWeeks: string[] = []
  if (selectedWeekIdx > 0) tableWeeks.push(data.weeks[selectedWeekIdx - 1])
  tableWeeks.push(currentWeek)
  if (selectedWeekIdx < data.weeks.length - 1) tableWeeks.push(data.weeks[selectedWeekIdx + 1])
  // If we only have current week, add a placeholder for next
  if (tableWeeks.length === 1) tableWeeks.push('future')

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1500, margin: '0 auto' }}>
      {/* Week Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button onClick={goPrev} disabled={!canPrev} style={navBtnStyle(canPrev)}>â</button>
        <span style={{ fontSize: 26, fontWeight: 900, color: C.white }}>{koreanLabel}</span>
        <span style={{ fontSize: 16, color: C.muted, marginLeft: 8 }}>{dateRange}</span>
        <button onClick={goNext} disabled={!canNext} style={navBtnStyle(canNext)}>â¶</button>
      </div>

      {/* Summary Row */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 32 }}>
        {/* Total Average Score */}
        <div style={cardStyle} onClick={() => setShowHistoryModal(true)}>
          <div style={labelStyle}>ì ì²´ íê·  ì ì</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 34, fontWeight: 900, color: C.white, lineHeight: 1 }}>
              {data.totalAvg}
            </span>
            <DeltaSpan delta={data.totalAvgDelta} style={{ fontSize: 20, fontWeight: 900 }} />
          </div>
          <div style={{ fontSize: 14, color: C.muted, marginTop: 12, lineHeight: '1.8' }}>
            <div>1. ì¼ë¶ ì§ìë§ AI ì§ë ëê° (ì  ì§ì AI ìì¤í ëë ë§¡ê¸° ì í¨)</div>
            <div>2. ì´ë¸íê³¼ R&R í©ì: ìì¤í ê³ ëí ë° ìì¤í ê° ì°ë, ë³´ìì± ê°í</div>
          </div>
          <div style={{ fontSize: 13, color: C.blue, marginTop: 8 }}>ì£¼ì°¨ë³ íì¤í ë¦¬ ë³´ê¸° â</div>
        </div>

        {/* Stage Changes */}
        <div style={{ ...cardStyle, cursor: 'default' }}>
          <div style={labelStyle}>ë¨ê³ ë³í</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 34, fontWeight: 900, color: C.white, lineHeight: 1 }}>
              {data.stageChanges.length}
            </span>
            <span style={{ fontSize: 16, color: C.muted }}>/ {Object.keys(states).length}ê°</span>
          </div>
          <div style={{ fontSize: 15, color: C.muted, marginTop: 10, lineHeight: '1.7' }}>
            {data.stageChanges.slice(0, 4).map(sc => (
              <div key={sc.systemId}>{sc.name}: {sc.toStage}</div>
            ))}
          </div>
        </div>

        {/* Score Movement */}
        <div style={{ ...cardStyle, cursor: 'default' }}>
          <div style={labelStyle}>ì ì ë³ë</div>
          <div style={{ display: 'flex', gap: 28, alignItems: 'baseline', marginTop: 4 }}>
            <div>
              <span style={{ fontSize: 34, fontWeight: 900, color: C.green }}>{data.scoreUp}</span>{' '}
              <span style={{ fontSize: 16, color: C.muted }}>ìì¹</span>
            </div>
            <div>
              <span style={{ fontSize: 34, fontWeight: 900, color: C.dim }}>{data.scoreFlat}</span>{' '}
              <span style={{ fontSize: 16, color: C.muted }}>ì ì§</span>
            </div>
            <div>
              <span style={{ fontSize: 34, fontWeight: 900, color: C.red }}>{data.scoreDown}</span>{' '}
              <span style={{ fontSize: 16, color: C.muted }}>íë½</span>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 32 }}>
        {/* Top Gainers */}
        <div style={highlightCardStyle}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: C.green, marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            ì´ë² ì£¼ ì ì§í ìì¤í
            {data.topGainers.length > 3 && (
              <span style={{ fontSize: 13, fontWeight: 500, color: C.blue, cursor: 'pointer' }} onClick={() => setShowGoodModal(true)}>ì ì²´ ë³´ê¸° â</span>
            )}
          </h3>
          {data.topGainers.slice(0, 3).map(g => (
            <div key={g.systemId} style={highlightItemStyle}>
              <div
                style={{ fontSize: 16, fontWeight: 700, color: C.white, cursor: 'pointer' }}
                onClick={() => setDetailSystemId(g.systemId)}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = C.blue }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = C.white }}
              >
                {g.name}{' '}
                <span style={{ color: C.green, fontSize: 17, fontWeight: 800 }}>
                  +{g.delta}ì {g.fromStage !== g.toStage ? `, ${g.fromStage}â${g.toStage}` : ''}
                </span>
              </div>
              <div style={{ fontSize: 15, color: C.muted, marginTop: 4, lineHeight: '1.5' }}>{g.desc}</div>
            </div>
          ))}
          {data.topGainers.length === 0 && (
            <div style={{ fontSize: 15, color: C.dim }}>ì´ë² ì£¼ ì ì ìì¹ ìì¤í ìì</div>
          )}
        </div>

        {/* Needs Attention */}
        <div style={highlightCardStyle}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: C.red, marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            ì§ë ì ê²ì´ íìí ìì¤í
            {data.needsAttention.length > 3 && (
              <span style={{ fontSize: 13, fontWeight: 500, color: C.blue, cursor: 'pointer' }} onClick={() => setShowWarnModal(true)}>ì ì²´ ë³´ê¸° â</span>
            )}
          </h3>
          {data.needsAttention.slice(0, 3).map(n => (
            <div key={n.systemId} style={highlightItemStyle}>
              <div
                style={{ fontSize: 16, fontWeight: 700, color: C.white, cursor: 'pointer' }}
                onClick={() => setDetailSystemId(n.systemId)}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = C.blue }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = C.white }}
              >
                {n.name} <span style={{ color: C.dim }}>{n.score}ì  ì ì§</span>
              </div>
              <div style={{ fontSize: 15, color: C.muted, marginTop: 4, lineHeight: '1.5' }}>{n.desc}</div>
            </div>
          ))}
          {data.needsAttention.length === 0 && (
            <div style={{ fontSize: 15, color: C.dim }}>ëª¨ë  ìì¤íì´ ì ì ì§í ì¤</div>
          )}
        </div>
      </div>

      {/* Zone Score Cards */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
        {ZONES.map(zone => {
          const za = data.zoneAvgs[zone.id]
          return (
            <div key={zone.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px', flex: 1 }}>
              <div style={{ fontSize: 16, color: C.muted, fontWeight: 600, marginBottom: 8 }}>{zone.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontSize: 34, fontWeight: 900, color: C.white, lineHeight: 1 }}>{za?.avg ?? 0}</span>
                <DeltaSpan delta={za?.delta ?? null} style={{ fontSize: 20, fontWeight: 900, marginLeft: 10 }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend with stage index */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, marginBottom: 16, fontSize: 12, color: C.dim }}>
        {STAGES.map((stage, i) => {
          const nextPts = i < STAGES.length - 1 ? STAGES[i + 1].points : 100
          const widthRatio = (nextPts - stage.points)
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: widthRatio }}>
              <span style={{ fontSize: 11, color: C.muted, marginBottom: 3, whiteSpace: 'nowrap' }}>L{stage.level} {stage.name}</span>
              <div style={{ width: '100%', height: 14, borderRadius: 3, background: `rgba(55,138,221,${0.07 + i * 0.14})` }} />
              <span style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{stage.points}ì </span>
            </div>
          )
        })}
      </div>

      {/* Heatmap Table */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'auto', maxHeight: '70vh' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, minWidth: 280 }}>ìì¤í</th>
              <th style={{ ...thStyle, minWidth: 110 }}>í´ê²°ì¢¬</th>
              <th style={{ ...thStyle, minWidth: 120, textAlign: 'center' }}>íì¬ ì ì</th>
              <th style={{ ...thStyle, minWidth: 180, textAlign: 'center' }}>ë¨ê³(ë ë²¨)</th>
              {tableWeeks.map(w => (
                <th key={w} style={{ ...thStyle, textAlign: 'center', minWidth: 140, ...(w === currentWeek ? { background: 'rgba(55,138,221,0.06)' } : {}) }}>
                  {w === 'future' ? 'â' : weekToKorean(w)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.zones.map(zone => {
              const za = data.zoneAvgs[zone.zoneId]
              return (
                <ZoneSection
                  key={zone.zoneId}
                  zone={zone}
                  zoneAvg={za}
                  tableWeeks={tableWeeks}
                  currentWeek={currentWeek}
                  prevWeek={prevWeek}
                  onSystemClick={setDetailSystemId}
                />
              )
            })}
          </tbody>
        </table>
      </div>

      {/* âââ Modals âââ */}
      {showHistoryModal && (
        <ModalOverlay onClose={() => setShowHistoryModal(false)}>
          <div style={{ fontSize: 26, fontWeight: 900, color: C.white, marginBottom: 8 }}>ì ì²´ íê·  ì ì íì¤í ë¦¬</div>
          <div style={{ fontSize: 17, color: C.muted, marginBottom: 28 }}>ì£¼ì°¨ë³ ì ì²´ íê·  ì ì ë³í</div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {[...data.weeks].reverse().map((w, i, arr) => {
              const scores = data.zones.flatMap(z => z.systems.map(s => s.weekScores[w] ?? 0))
              const avg = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0
              const nextW = arr[i + 1]
              const prevScores = nextW ? data.zones.flatMap(z => z.systems.map(s => s.weekScores[nextW] ?? 0)) : null
              const prevAvg = prevScores ? Math.round((prevScores.reduce((a, b) => a + b, 0) / prevScores.length) * 10) / 10 : null
              const delta = prevAvg !== null ? Math.round((avg - prevAvg) * 10) / 10 : null
              return (
                <li key={w} style={{ display: 'flex', gap: 20, padding: '20px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: C.blue, minWidth: 100 }}>{weekToKorean(w)}</div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: C.white }}>
                      {avg}ì  <DeltaSpan delta={delta} style={{ fontSize: 17 }} />
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </ModalOverlay>
      )}

      {showGoodModal && (
        <ModalOverlay onClose={() => setShowGoodModal(false)}>
          <div style={{ fontSize: 26, fontWeight: 900, color: C.green, marginBottom: 28 }}>ì´ë² ì£¼ ì ì§í ìì¤í â ì ì²´</div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {data.topGainers.map(g => (
              <li key={g.systemId} style={{ display: 'flex', gap: 20, padding: '20px 0', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: C.blue, minWidth: 80 }}>+{g.delta}ì </div>
                <div>
                  <div style={{ fontSize: 17, color: C.text }}>
                    <strong>{g.name}</strong> â {g.fromStage !== g.toStage ? `${g.fromStage}â${g.toStage}` : `${g.toStage} ì ì§`}
                  </div>
                  <div style={{ fontSize: 14, color: C.dim, marginTop: 6 }}>{g.desc}</div>
                </div>
              </li>
            ))}
          </ul>
        </ModalOverlay>
      )}

      {showWarnModal && (
        <ModalOverlay onClose={() => setShowWarnModal(false)}>
          <div style={{ fontSize: 26, fontWeight: 900, color: C.red, marginBottom: 28 }}>ì§ë ì ê²ì´ íìí ìì¤í â ì ì²´</div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {data.needsAttention.map(n => (
              <li key={n.systemId} style={{ display: 'flex', gap: 20, padding: '20px 0', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: C.red, minWidth: 80 }}>{n.score}ì </div>
                <div>
                  <div style={{ fontSize: 17, color: C.text }}><strong>{n.name}</strong></div>
                  <div style={{ fontSize: 14, color: C.dim, marginTop: 6 }}>{n.desc}</div>
                </div>
              </li>
            ))}
          </ul>
        </ModalOverlay>
      )}

      {detailSystemId && (
        <SystemDetailModal
          systemId={detailSystemId}
          snapshots={snapshots}
          states={states}
          members={members}
          onClose={() => setDetailSystemId(null)}
        />
      )}
    </div>
  )
}

// âââ Zone Section âââ
function ZoneSection({
  zone,
  zoneAvg,
  tableWeeks,
  currentWeek,
  prevWeek,
  onSystemClick,
}: {
  zone: ReturnType<typeof useWeeklyData>['zones'][0]
  zoneAvg: { avg: number; delta: number | null }
  tableWeeks: string[]
  currentWeek: string
  prevWeek: string | null
  onSystemClick: (id: string) => void
}) {
  return (
    <>
      {/* Zone header row */}
      <tr>
        <td
          colSpan={4 + tableWeeks.length}
          style={{
            background: '#08081a',
            padding: '14px 20px',
            fontSize: 17,
            fontWeight: 800,
            color: C.white,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          {zone.zoneName}{' '}
          <span style={{ fontSize: 15, fontWeight: 600, color: C.muted, marginLeft: 12 }}>
            íê·  {zoneAvg.avg} <DeltaSpan delta={zoneAvg.delta} style={{ fontSize: 14 }} />
          </span>
        </td>
      </tr>

      {/* System rows */}
      {zone.systems.map(sys => {
        const prevScore = prevWeek ? (sys.weekScores[prevWeek] ?? null) : null
        const curScore = sys.weekScores[currentWeek] ?? sys.currentScore
        const delta = prevScore !== null ? curScore - prevScore : null
        const prevStageLevel = prevScore !== null ? getStageFromScore(prevScore) : null
        const curStageLevel = getStageFromScore(curScore)
        const stageChanged = prevStageLevel !== null && prevStageLevel !== curStageLevel

        return (
          <tr
            key={sys.systemId}
            onClick={() => onSystemClick(sys.systemId)}
            style={{
              cursor: 'pointer',
              borderBottom: `1px solid ${C.border}`,
              ...(stageChanged ? { background: 'rgba(74,222,128,0.04)' } : {}),
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = stageChanged ? 'rgba(74,222,128,0.07)' : '#0a0a1a' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = stageChanged ? 'rgba(74,222,128,0.04)' : 'transparent' }}
          >
            <td style={tdStyle}><div style={{ fontSize: 18, fontWeight: 700, color: C.white }}>{sys.name}</div></td>
            <td style={tdStyle}><span style={{ fontSize: 17, color: C.muted }}>{sys.owner}</span></td>
            <td style={{ ...tdStyle, textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8 }}>
                <span style={{ fontSize: 34, fontWeight: 900, color: C.white, lineHeight: 1 }}>{curScore}</span>
                <DeltaSpan delta={delta} style={{ fontSize: 20, fontWeight: 900 }} />
              </div>
            </td>
            <td style={{ ...tdStyle, textAlign: 'center' }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: C.white }}>{getStageLabel(curScore)}</span>
            </td>
            {tableWeeks.map(w => {
              if (w === 'future') {
                return (
                  <td key={w} style={{ ...tdStyle, textAlign: 'center', padding: '14px 12px' }}>
                    <div style={{ fontSize: 22, color: '#1e1e30' }}>â</div>
                  </td>
                )
              }
              const score = sys.weekScores[w]
              if (score === null || score === undefined) {
                return (
                  <td key={w} style={{ ...tdStyle, textAlign: 'center', padding: '14px 12px' }}>
                    <div style={{ fontSize: 22, color: '#1e1e30' }}>â</div>
                  </td>
                )
              }
              // Calculate delta for this week cell
              const wIdx = tableWeeks.indexOf(w)
              const prevW = wIdx > 0 ? tableWeeks[wIdx - 1] : null
              const prevS = prevW && prevW !== 'future' ? (sys.weekScores[prevW] ?? null) : null
              const cellDelta = prevS !== null ? score - prevS : null
              const prevCellStage = prevS !== null ? getStageFromScore(prevS) : null
              const cellStage = getStageFromScore(score)
              const cellStageChanged = prevCellStage !== null && prevCellStage !== cellStage

              return (
                <td
                  key={w}
                  style={{
                    ...tdStyle,
                    textAlign: 'center',
                    padding: '14px 12px',
                    ...(w === currentWeek ? { background: 'rgba(55,138,221,0.03)' } : {}),
                  }}
                >
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    borderRadius: 10,
                    padding: '14px 10px',
                    margin: '-8px -4px',
                    background: score === 0 ? 'transparent' : getHeatBg(score),
                  }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{
                        fontSize: 26,
                        fontWeight: 900,
                        color: score === 0 ? '#2a2a40' : C.white,
                        lineHeight: 1,
                      }}>
                        {score}
                      </span>
                      {cellDelta !== null && cellDelta !== 0 && (
                        <DeltaSpan delta={cellDelta} style={{ fontSize: 16, fontWeight: 900 }} />
                      )}
                    </div>
                    {cellStageChanged && (
                      <span style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: C.green,
                        background: 'rgba(74,222,128,0.15)',
                        padding: '3px 8px',
                        borderRadius: 6,
                        marginTop: 2,
                      }}>
                        {getStageName(prevS!)}{' â '}{getStageName(score)}
                      </span>
                    )}
                  </div>
                </td>
              )
            })}
          </tr>
        )
      })}
    </>
  )
}

// âââ Modal Overlay âââ
function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.75)',
        zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div style={{
        background: C.card,
        border: `1px solid #252540`,
        borderRadius: 18,
        width: '92%', maxWidth: 760, maxHeight: '82vh',
        overflowY: 'auto',
        padding: 32,
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <button
            onClick={onClose}
            style={{
              background: '#151528', border: '1px solid #252540',
              color: C.muted, width: 40, height: 40, borderRadius: 8, cursor: 'pointer', fontSize: 20,
            }}
          >â</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// âââ Styles âââ
const cardStyle: React.CSSProperties = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: '20px 24px',
  flex: 1,
  cursor: 'pointer',
}

const highlightCardStyle: React.CSSProperties = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 14,
  padding: '22px 26px',
  flex: 1,
}

const highlightItemStyle: React.CSSProperties = {
  padding: '10px 0',
  borderBottom: `1px solid #151530`,
}

const labelStyle: React.CSSProperties = {
  fontSize: 16,
  color: C.muted,
  fontWeight: 600,
  marginBottom: 8,
}

const thStyle: React.CSSProperties = {
  background: '#0e0e22',
  color: C.muted,
  fontWeight: 700,
  textAlign: 'left',
  padding: '18px 20px',
  fontSize: 17,
  borderBottom: `2px solid ${C.border}`,
  whiteSpace: 'nowrap',
  position: 'sticky',
  top: 0,
  zIndex: 20,
}

const tdStyle: React.CSSProperties = {
  padding: '16px 20px',
  borderBottom: `1px solid ${C.border}`,
}

function navBtnStyle(enabled: boolean): React.CSSProperties {
  return {
    background: '#151528',
    border: '1px solid #252540',
    color: enabled ? '#b0b0cc' : '#2a2a40',
    width: 40, height: 40, borderRadius: 8,
    cursor: enabled ? 'pointer' : 'default',
    fontSize: 18,
  }
}
