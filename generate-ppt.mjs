import PptxGenJS from 'pptxgenjs'

const pptx = new PptxGenJS()
pptx.layout = 'LAYOUT_WIDE' // 13.33 x 7.5 inches

const slide = pptx.addSlide()
slide.background = { color: '0F172A' }

// Title
slide.addText('Picks AI 시스템 구축 단계 정의', {
  x: 0.5, y: 0.3, w: 12, h: 0.6,
  fontSize: 24, fontFace: 'Malgun Gothic',
  color: 'FFFFFF', bold: true,
})

// Subtitle
slide.addText('자동화 성숙도 기반 7단계 (0~100점)  |  정량 지표로 판단, 주관 최소화', {
  x: 0.5, y: 0.85, w: 12, h: 0.35,
  fontSize: 12, fontFace: 'Malgun Gothic',
  color: '94A3B8',
})

// Table data
const headerRow = [
  { text: '단계', options: { bold: true, color: 'FFFFFF', fill: { color: '1E293B' }, fontSize: 11, fontFace: 'Malgun Gothic', align: 'center', valign: 'middle' } },
  { text: '단계명', options: { bold: true, color: 'FFFFFF', fill: { color: '1E293B' }, fontSize: 11, fontFace: 'Malgun Gothic', align: 'center', valign: 'middle' } },
  { text: '점수', options: { bold: true, color: 'FFFFFF', fill: { color: '1E293B' }, fontSize: 11, fontFace: 'Malgun Gothic', align: 'center', valign: 'middle' } },
  { text: '비중', options: { bold: true, color: 'FFFFFF', fill: { color: '1E293B' }, fontSize: 11, fontFace: 'Malgun Gothic', align: 'center', valign: 'middle' } },
  { text: '전환 기준 (모두 충족 시 다음 단계)', options: { bold: true, color: 'FFFFFF', fill: { color: '1E293B' }, fontSize: 11, fontFace: 'Malgun Gothic', align: 'left', valign: 'middle' } },
  { text: '검증 방법', options: { bold: true, color: 'FFFFFF', fill: { color: '1E293B' }, fontSize: 11, fontFace: 'Malgun Gothic', align: 'left', valign: 'middle' } },
]

const stages = [
  { level: '0', name: '미착수', points: '0', weight: '-', criteria: '시작 전', verify: '-', fill: '334155', nameColor: '94A3B8' },
  { level: '1', name: '기획', points: '10', weight: '10%', criteria: '• 요건 정의서 존재\n• PM 배정 완료\n• 일정 확정', verify: '문서 존재 여부', fill: '1E3A5F', nameColor: '93C5FD' },
  { level: '2', name: '개발', points: '25', weight: '15%', criteria: '• 스테이징 배포 완료\n• 핵심 기능 테스트 통과율 ≥90%', verify: '스테이징 환경 데모', fill: '1E3A5F', nameColor: '60A5FA' },
  { level: '3', name: '도입', points: '40', weight: '15%', criteria: '• 프로덕션 배포 완료\n• 실 데이터 연결\n• 대상 사용자 교육 완료율 ≥80%', verify: '실 환경 작동 확인', fill: '164E63', nameColor: '67E8F9' },
  { level: '4', name: '활용', points: '60', weight: '20%', criteria: '• 자동화율 ≥30%\n• 주간 활성 사용률 ≥70%\n• 수작업 대비 시간 절감 ≥20%', verify: '사용 로그 + 절감 수치', fill: '14532D', nameColor: '86EFAC' },
  { level: '5', name: '최적화', points: '80', weight: '20%', criteria: '• 자동화율 ≥70%\n• 오류율 ≤5%\n• 인간 개입 빈도 ≤주 2회', verify: '모니터링 지표', fill: '365314', nameColor: 'BEF264' },
  { level: '6', name: '자동화', points: '100', weight: '20%', criteria: '• 자동화율 ≥95%\n• 오류율 ≤1%\n• MTTR ≤1시간\n• KPI 목표 달성', verify: 'KPI 대시보드', fill: '166534', nameColor: '4ADE80' },
]

const makeCell = (text, opts = {}) => ({
  text,
  options: {
    fontSize: 10,
    fontFace: 'Malgun Gothic',
    color: 'E2E8F0',
    valign: 'middle',
    ...opts,
  },
})

const rows = [headerRow]

for (const s of stages) {
  rows.push([
    makeCell(s.level, { align: 'center', fill: { color: s.fill }, bold: true, fontSize: 14, color: s.nameColor }),
    makeCell(s.name, { align: 'center', fill: { color: s.fill }, bold: true, color: s.nameColor, fontSize: 12 }),
    makeCell(s.points + 'pt', { align: 'center', fill: { color: s.fill }, bold: true, color: s.nameColor, fontSize: 12 }),
    makeCell(s.weight, { align: 'center', fill: { color: s.fill }, color: '94A3B8', fontSize: 10 }),
    makeCell(s.criteria, { align: 'left', fill: { color: s.fill }, fontSize: 9, paraSpaceAfter: 2 }),
    makeCell(s.verify, { align: 'left', fill: { color: s.fill }, color: '94A3B8', fontSize: 9 }),
  ])
}

slide.addTable(rows, {
  x: 0.5, y: 1.35, w: 12.3,
  colW: [0.6, 0.9, 0.7, 0.6, 5.5, 4.0],
  rowH: [0.35, 0.45, 0.55, 0.55, 0.65, 0.65, 0.65, 0.75],
  border: { type: 'solid', pt: 0.5, color: '334155' },
  margin: [4, 6, 4, 6],
})

// Bottom insight box
slide.addShape(pptx.ShapeType.roundRect, {
  x: 0.5, y: 6.4, w: 12.3, h: 0.85,
  fill: { color: '1E293B' },
  rectRadius: 0.1,
  line: { color: '334155', width: 0.5 },
})

slide.addText([
  { text: '핵심 철학  ', options: { bold: true, color: 'F59E0B', fontSize: 11, fontFace: 'Malgun Gothic' } },
  { text: '시스템을 만드는 것(0→25pt)은 전체의 25%.  나머지 75%는 도입→활용→최적화→자동화에 배분.\n', options: { color: 'E2E8F0', fontSize: 10, fontFace: 'Malgun Gothic' } },
  { text: '"개발 완료"가 아니라 "실제 자동화 달성"이 점수의 핵심.  속도 1일 단축 = 연간 영업이익 +0.8억 → 전 구간 AI 완성 = +120억', options: { color: '94A3B8', fontSize: 9, fontFace: 'Malgun Gothic' } },
], {
  x: 0.7, y: 6.45, w: 11.9, h: 0.75,
  valign: 'middle',
})

// Footer
slide.addText('Picks OPR 전략기획  |  2026-04', {
  x: 0.5, y: 7.1, w: 12, h: 0.3,
  fontSize: 8, fontFace: 'Malgun Gothic',
  color: '475569',
})

const outPath = 'Picks_AI_시스템_구축_단계_정의.pptx'
await pptx.writeFile({ fileName: outPath })
console.log(`PPT saved: ${outPath}`)
