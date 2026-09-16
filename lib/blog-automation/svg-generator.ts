// ─── SVG Chart Generator (비용 0원, 전문적 도표) ────

export interface ChartData {
  type: 'bar' | 'pie' | 'comparison' | 'flow' | 'timeline' | 'summary' | 'mindmap';
  title: string;
  data: any;
}

const COLORS = [
  '#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
];

// ─── Hero Banner ────────────────────────────────

export function generateHeroBanner(title: string, tags: string[]): string {
  const tagStr = tags.slice(0, 3).map((t) => `#${t}`).join('  ');
  const cleanTitle = (title || '').trim();
  const maxChars = cleanTitle.length > 28 ? 22 : 25;
  const fontSize = cleanTitle.length > 28 ? 22 : 26;
  const lineHeight = fontSize + 10;
  const lines = wrapText(cleanTitle, maxChars);
  const startY = Math.max(130, 190 - ((lines.length - 1) * lineHeight) / 2);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" style="width:100%;max-width:800px;border-radius:12px;margin:0 auto 24px;display:block;">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1E293B"/>
      <stop offset="100%" style="stop-color:#334155"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#F59E0B"/>
      <stop offset="100%" style="stop-color:#EF4444"/>
    </linearGradient>
  </defs>
  <rect width="800" height="400" rx="12" fill="url(#bg)"/>
  <rect x="60" y="320" width="120" height="4" rx="2" fill="url(#accent)"/>
  ${generateDecoCircles()}
  <text x="60" y="${startY}" font-family="system-ui,-apple-system,sans-serif" font-size="${fontSize}" font-weight="700" fill="#F8FAFC" style="max-width:680px;">
    ${lines.map((line, i) => `<tspan x="60" dy="${i === 0 ? 0 : lineHeight}">${escSvg(line)}</tspan>`).join('')}
  </text>
  <text x="60" y="345" font-family="system-ui,-apple-system,sans-serif" font-size="14" fill="#94A3B8">${escSvg(tagStr)}</text>
</svg>`;
}

function generateDecoCircles(): string {
  const circles = [];
  for (let i = 0; i < 5; i++) {
    const cx = 600 + Math.random() * 180;
    const cy = 40 + Math.random() * 120;
    const r = 8 + Math.random() * 30;
    circles.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#F59E0B" opacity="${0.05 + Math.random() * 0.1}"/>`);
  }
  return circles.join('\n  ');
}

// ─── Bar Chart ──────────────────────────────────

export function generateBarChart(title: string, data: { label: string; value: number }[]): string {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const barW = Math.min(60, (600 / data.length) - 16);
  const chartH = 200;
  const startX = 100;
  const barGap = (600 / data.length);

  const bars = data.map((d, i) => {
    const h = (d.value / maxVal) * chartH;
    const x = startX + i * barGap + (barGap - barW) / 2;
    const y = 260 - h;
    const color = COLORS[i % COLORS.length];
    return `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="4" fill="${color}" opacity="0.85"/>
    <text x="${x + barW / 2}" y="${y - 8}" font-family="system-ui,sans-serif" font-size="12" fill="#475569" text-anchor="middle" font-weight="600">${formatNum(d.value)}</text>
    <text x="${x + barW / 2}" y="285" font-family="system-ui,sans-serif" font-size="11" fill="#64748B" text-anchor="middle">${escSvg(truncate(d.label, 8))}</text>`;
  }).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 340" style="width:100%;max-width:800px;margin:20px auto;display:block;">
  <rect width="800" height="340" rx="12" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
  <text x="400" y="35" font-family="system-ui,sans-serif" font-size="16" font-weight="700" fill="#1E293B" text-anchor="middle">${escSvg(title)}</text>
  <line x1="80" y1="260" x2="720" y2="260" stroke="#CBD5E1" stroke-width="1"/>
  ${bars}
</svg>`;
}

// ─── Pie Chart ──────────────────────────────────

export function generatePieChart(title: string, data: { label: string; value: number }[]): string {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let cumAngle = -90;
  const cx = 300, cy = 180, r = 120;

  const slices = data.map((d, i) => {
    const angle = (d.value / total) * 360;
    const startAngle = cumAngle;
    cumAngle += angle;
    const endAngle = cumAngle;
    const color = COLORS[i % COLORS.length];

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;

    if (angle >= 359.9) {
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="0.85"/>`;
    }

    return `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z" fill="${color}" opacity="0.85"/>`;
  }).join('\n  ');

  const legend = data.map((d, i) => {
    const pct = Math.round((d.value / total) * 100);
    return `<rect x="520" y="${80 + i * 28}" width="14" height="14" rx="3" fill="${COLORS[i % COLORS.length]}"/>
    <text x="542" y="${92 + i * 28}" font-family="system-ui,sans-serif" font-size="12" fill="#475569">${escSvg(truncate(d.label, 12))} (${pct}%)</text>`;
  }).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 380" style="width:100%;max-width:800px;margin:20px auto;display:block;">
  <rect width="800" height="380" rx="12" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
  <text x="400" y="35" font-family="system-ui,sans-serif" font-size="16" font-weight="700" fill="#1E293B" text-anchor="middle">${escSvg(title)}</text>
  ${slices}
  ${legend}
</svg>`;
}

// ─── Comparison Table ───────────────────────────

export function generateComparisonChart(title: string, data: { label: string; values: any[] }[], headers: string[]): string {
  if (!Array.isArray(data) || data.length === 0) return '';
  const sampleValues = Array.isArray(data[0]?.values) ? data[0].values : [];
  const colCount = Math.max(sampleValues.length, 1);
  const colW = Math.max(80, Math.floor(580 / colCount));
  const rowH = 40;
  const startY = 70;

  const valHeaders = headers && headers.length > sampleValues.length
    ? headers.slice(headers.length - sampleValues.length)
    : (headers || []);

  const headerCells = valHeaders.map((h, i) =>
    `<text x="${180 + i * colW + colW / 2}" y="${startY}" font-family="system-ui,sans-serif" font-size="12" font-weight="700" fill="#475569" text-anchor="middle">${escSvg(truncate(String(h), 10))}</text>`
  ).join('\n  ');

  const rows = data.map((row, ri) => {
    const y = startY + 20 + ri * rowH;
    const bg = ri % 2 === 0 ? '#F8FAFC' : '#FFFFFF';
    const vals = Array.isArray(row.values) ? row.values : [];
    const cells = vals.map((v, ci) =>
      `<text x="${180 + ci * colW + colW / 2}" y="${y + 26}" font-family="system-ui,sans-serif" font-size="13" fill="#334155" text-anchor="middle">${escSvg(String(v))}</text>`
    ).join('\n    ');
    return `<rect x="20" y="${y + 6}" width="760" height="${rowH}" rx="6" fill="${bg}"/>
    <text x="30" y="${y + 26}" font-family="system-ui,sans-serif" font-size="13" font-weight="600" fill="#1E293B">${escSvg(truncate(row.label || '', 14))}</text>
    ${cells}`;
  }).join('\n  ');

  const totalH = startY + 30 + data.length * rowH + 20;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 ${totalH}" style="width:100%;max-width:800px;margin:20px auto;display:block;">
  <rect width="800" height="${totalH}" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
  <text x="400" y="35" font-family="system-ui,sans-serif" font-size="16" font-weight="700" fill="#1E293B" text-anchor="middle">${escSvg(title)}</text>
  <line x1="20" y1="${startY + 10}" x2="780" y2="${startY + 10}" stroke="#E2E8F0" stroke-width="1"/>
  ${headerCells}
  ${rows}
</svg>`;
}

// ─── Flow Diagram ───────────────────────────────

export function generateFlowChart(title: string, steps: string[]): string {
  const boxW = 160, boxH = 50, gapY = 20;
  const cx = 400;
  const startY = 60;

  const boxes = steps.map((step, i) => {
    const y = startY + i * (boxH + gapY);
    const color = COLORS[i % COLORS.length];
    const arrow = i < steps.length - 1
      ? `<line x1="${cx}" y1="${y + boxH}" x2="${cx}" y2="${y + boxH + gapY}" stroke="#CBD5E1" stroke-width="2" marker-end="url(#arrowhead)"/>`
      : '';
    return `<rect x="${cx - boxW / 2}" y="${y}" width="${boxW}" height="${boxH}" rx="10" fill="${color}" opacity="0.15" stroke="${color}" stroke-width="2"/>
    <text x="${cx}" y="${y + boxH / 2 + 5}" font-family="system-ui,sans-serif" font-size="13" font-weight="600" fill="#1E293B" text-anchor="middle">${escSvg(truncate(step, 14))}</text>
    ${arrow}`;
  }).join('\n  ');

  const totalH = startY + steps.length * (boxH + gapY) + 20;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 ${totalH}" style="width:100%;max-width:800px;margin:20px auto;display:block;">
  <defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#CBD5E1"/></marker></defs>
  <rect width="800" height="${totalH}" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
  <text x="400" y="35" font-family="system-ui,sans-serif" font-size="16" font-weight="700" fill="#1E293B" text-anchor="middle">${escSvg(title)}</text>
  ${boxes}
</svg>`;
}

// ─── Timeline ───────────────────────────────────

export function generateTimeline(title: string, events: { label: string; desc: string }[]): string {
  const startY = 70;
  const gap = 80;
  const cx = 100;

  const items = events.map((ev, i) => {
    const y = startY + i * gap;
    const color = COLORS[i % COLORS.length];
    const line = i < events.length - 1
      ? `<line x1="${cx}" y1="${y + 16}" x2="${cx}" y2="${y + gap}" stroke="#E2E8F0" stroke-width="2"/>`
      : '';
    return `${line}
    <circle cx="${cx}" cy="${y}" r="8" fill="${color}"/>
    <text x="${cx + 30}" y="${y + 4}" font-family="system-ui,sans-serif" font-size="14" font-weight="700" fill="#1E293B">${escSvg(truncate(ev.label, 20))}</text>
    <text x="${cx + 30}" y="${y + 24}" font-family="system-ui,sans-serif" font-size="12" fill="#64748B">${escSvg(truncate(ev.desc, 40))}</text>`;
  }).join('\n  ');

  const totalH = startY + events.length * gap + 10;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 ${totalH}" style="width:100%;max-width:800px;margin:20px auto;display:block;">
  <rect width="800" height="${totalH}" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
  <text x="400" y="35" font-family="system-ui,sans-serif" font-size="16" font-weight="700" fill="#1E293B" text-anchor="middle">${escSvg(title)}</text>
  ${items}
</svg>`;
}

// ─── Summary Card (핵심 포인트 요약) ─────────────

export function generateSummaryCard(title: string, points: { icon: string; heading: string; desc: string }[]): string {
  const cardW = 360, cardH = 100, gap = 16;
  const cols = 2;
  const startY = 60;

  const cards = points.map((p, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 20 + col * (cardW + gap);
    const y = startY + row * (cardH + gap);
    const color = COLORS[i % COLORS.length];
    const icon = p.icon || String(i + 1);

    return `<rect x="${x}" y="${y}" width="${cardW}" height="${cardH}" rx="10" fill="#FFFFFF" stroke="${color}" stroke-width="2" opacity="0.9"/>
    <circle cx="${x + 30}" cy="${y + 35}" r="16" fill="${color}" opacity="0.15"/>
    <text x="${x + 30}" y="${y + 40}" font-family="system-ui,sans-serif" font-size="14" fill="${color}" text-anchor="middle" font-weight="700">${escSvg(icon)}</text>
    <text x="${x + 58}" y="${y + 35}" font-family="system-ui,sans-serif" font-size="14" font-weight="700" fill="#1E293B">${escSvg(truncate(p.heading, 18))}</text>
    <text x="${x + 58}" y="${y + 58}" font-family="system-ui,sans-serif" font-size="11" fill="#64748B">${escSvg(truncate(p.desc, 30))}</text>`;
  }).join('\n  ');

  const rows = Math.ceil(points.length / cols);
  const totalH = startY + rows * (cardH + gap) + 10;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 ${totalH}" style="width:100%;max-width:800px;margin:20px auto;display:block;">
  <rect width="800" height="${totalH}" rx="12" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
  <text x="400" y="35" font-family="system-ui,sans-serif" font-size="16" font-weight="700" fill="#1E293B" text-anchor="middle">${escSvg(title)}</text>
  ${cards}
</svg>`;
}

// ─── Mind Map (키워드 연결 맵) ───────────────────

export function generateMindMap(title: string, center: string, branches: { label: string; children?: string[] }[]): string {
  const cx = 400, cy = 220;
  const branchR = 160;

  const angleStep = (2 * Math.PI) / branches.length;
  const branchElements = branches.map((branch, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const bx = cx + branchR * Math.cos(angle);
    const by = cy + branchR * Math.sin(angle);
    const color = COLORS[i % COLORS.length];

    let childElements = '';
    if (branch.children?.length) {
      const childR = 70;
      const childAngleStep = (Math.PI * 0.6) / Math.max(branch.children.length - 1, 1);
      const baseAngle = angle - (Math.PI * 0.3);
      childElements = branch.children.slice(0, 3).map((child, ci) => {
        const cAngle = baseAngle + childAngleStep * ci;
        const childX = bx + childR * Math.cos(cAngle);
        const childY = by + childR * Math.sin(cAngle);
        return `<line x1="${bx}" y1="${by}" x2="${childX}" y2="${childY}" stroke="${color}" stroke-width="1" opacity="0.3"/>
      <rect x="${childX - 40}" y="${childY - 12}" width="80" height="24" rx="12" fill="${color}" opacity="0.1"/>
      <text x="${childX}" y="${childY + 4}" font-family="system-ui,sans-serif" font-size="10" fill="#475569" text-anchor="middle">${escSvg(truncate(child, 8))}</text>`;
      }).join('\n    ');
    }

    return `<line x1="${cx}" y1="${cy}" x2="${bx}" y2="${by}" stroke="${color}" stroke-width="2" opacity="0.3"/>
    <circle cx="${bx}" cy="${by}" r="32" fill="${color}" opacity="0.12" stroke="${color}" stroke-width="2"/>
    <text x="${bx}" y="${by + 5}" font-family="system-ui,sans-serif" font-size="12" font-weight="600" fill="#1E293B" text-anchor="middle">${escSvg(truncate(branch.label, 8))}</text>
    ${childElements}`;
  }).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 440" style="width:100%;max-width:800px;margin:20px auto;display:block;">
  <rect width="800" height="440" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
  <text x="400" y="30" font-family="system-ui,sans-serif" font-size="16" font-weight="700" fill="#1E293B" text-anchor="middle">${escSvg(title)}</text>
  ${branchElements}
  <circle cx="${cx}" cy="${cy}" r="44" fill="#1E293B"/>
  <text x="${cx}" y="${cy + 5}" font-family="system-ui,sans-serif" font-size="14" font-weight="700" fill="#F8FAFC" text-anchor="middle">${escSvg(truncate(center, 8))}</text>
</svg>`;
}

// ─── Data Normalization Helpers (AI 출력 변형에 100% 안전 대응) ───

export function normalizeChartType(rawType: string): ChartData['type'] {
  const t = (rawType || '').toLowerCase().trim().replace(/[-_]/g, '');
  if (['bar', 'barchart', 'column', 'columnchart', 'stats', 'histogram'].includes(t)) return 'bar';
  if (['pie', 'piechart', 'donut', 'donutchart', 'circle', 'doughnut'].includes(t)) return 'pie';
  if (['comparison', 'compare', 'table', 'versus', 'vs', 'matrix'].includes(t)) return 'comparison';
  if (['flow', 'flowchart', 'process', 'steps', 'step', 'pipeline', 'funnel'].includes(t)) return 'flow';
  if (['timeline', 'history', 'roadmap', 'schedule', 'milestones'].includes(t)) return 'timeline';
  if (['summary', 'summarycard', 'card', 'cards', 'points', 'keypoints', 'highlights'].includes(t)) return 'summary';
  if (['mindmap', 'concept', 'tree', 'network', 'structure', 'map'].includes(t)) return 'mindmap';
  return 'bar';
}

function normalizeBarPieData(raw: any): { label: string; value: number }[] {
  if (Array.isArray(raw)) {
    return raw.map((item, idx) => {
      if (typeof item === 'object' && item !== null) {
        const label = String(item.label || item.name || item.key || item.category || `항목 ${idx + 1}`);
        const valStr = String(item.value ?? item.val ?? item.score ?? item.count ?? 0);
        const parsed = parseFloat(valStr.replace(/[^0-9.-]/g, ''));
        return { label, value: isNaN(parsed) ? 0 : parsed };
      }
      const parsed = parseFloat(String(item).replace(/[^0-9.-]/g, ''));
      return { label: `항목 ${idx + 1}`, value: isNaN(parsed) ? 0 : parsed };
    });
  }
  if (typeof raw === 'object' && raw !== null) {
    return Object.entries(raw).map(([key, val]) => {
      const parsed = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
      return { label: key, value: isNaN(parsed) ? 0 : parsed };
    });
  }
  return [{ label: '기본', value: 100 }];
}

function normalizeComparisonData(raw: any): { rows: { label: string; values: any[] }[]; headers: string[] } {
  if (!raw) return { rows: [], headers: [] };
  const headers: string[] = Array.isArray(raw.headers)
    ? raw.headers.map(String)
    : Array.isArray(raw.columns)
    ? raw.columns.map(String)
    : [];

  let rows: { label: string; values: any[] }[] = [];
  if (Array.isArray(raw.rows)) {
    rows = raw.rows.map((r: any, idx: number) => {
      if (typeof r === 'object' && r !== null) {
        const label = String(r.label || r.name || r.item || r.category || `비교 ${idx + 1}`);
        const values = Array.isArray(r.values) ? r.values : Array.isArray(r.data) ? r.data : [];
        return { label, values };
      }
      return { label: `비교 ${idx + 1}`, values: [String(r)] };
    });
  } else if (Array.isArray(raw)) {
    rows = raw.map((r: any, idx: number) => {
      if (typeof r === 'object' && r !== null) {
        const label = String(r.label || r.name || r.item || `비교 ${idx + 1}`);
        const values = Array.isArray(r.values) ? r.values : Object.values(r).filter((v) => v !== label);
        return { label, values };
      }
      return { label: `비교 ${idx + 1}`, values: [String(r)] };
    });
  }
  return { rows, headers };
}

function normalizeFlowData(raw: any): string[] {
  if (Array.isArray(raw)) {
    return raw.map((item, idx) => {
      if (typeof item === 'object' && item !== null) {
        return String(item.step || item.title || item.name || item.label || item.desc || `단계 ${idx + 1}`);
      }
      return String(item);
    });
  }
  if (typeof raw === 'object' && raw !== null) {
    return Object.values(raw).map(String);
  }
  return ['시작', '진행', '완료'];
}

function normalizeTimelineData(raw: any): { label: string; desc: string }[] {
  if (Array.isArray(raw)) {
    return raw.map((item, idx) => {
      if (typeof item === 'object' && item !== null) {
        const label = String(item.label || item.time || item.year || item.date || item.step || `시점 ${idx + 1}`);
        const desc = String(item.desc || item.description || item.content || item.event || item.text || '');
        return { label, desc };
      }
      return { label: `시점 ${idx + 1}`, desc: String(item) };
    });
  }
  return [{ label: '주요 시점', desc: '세부 내용' }];
}

function normalizeSummaryData(raw: any): { icon: string; heading: string; desc: string }[] {
  if (Array.isArray(raw)) {
    return raw.map((item, idx) => {
      if (typeof item === 'object' && item !== null) {
        const icon = String(item.icon || String(idx + 1));
        const heading = String(item.heading || item.title || item.point || item.name || `포인트 ${idx + 1}`);
        const desc = String(item.desc || item.description || item.text || item.content || '');
        return { icon, heading, desc };
      }
      return { icon: String(idx + 1), heading: String(item), desc: '' };
    });
  }
  return [{ icon: '1', heading: '핵심 포인트', desc: '세부 요약' }];
}

function normalizeMindmapData(
  raw: any,
  fallbackCenter: string
): { center: string; branches: { label: string; children?: string[] }[] } {
  if (typeof raw === 'object' && raw !== null) {
    const center = String(raw.center || raw.root || raw.title || fallbackCenter.slice(0, 10) || '중심 주제');
    let branches: { label: string; children?: string[] }[] = [];
    if (Array.isArray(raw.branches)) {
      branches = raw.branches.map((b: any, idx: number) => {
        if (typeof b === 'object' && b !== null) {
          const label = String(b.label || b.name || b.title || `가지 ${idx + 1}`);
          const children = Array.isArray(b.children) ? b.children.map(String) : [];
          return { label, children };
        }
        return { label: String(b), children: [] };
      });
    }
    if (branches.length === 0) {
      branches = [{ label: '핵심 1' }, { label: '핵심 2' }, { label: '핵심 3' }];
    }
    return { center, branches };
  }
  return { center: fallbackCenter.slice(0, 10), branches: [{ label: '핵심 1' }, { label: '핵심 2' }] };
}

// ─── Dispatcher ─────────────────────────────────

export function generateChart(chart: ChartData): string {
  if (!chart) return '';
  const type = normalizeChartType(chart.type);
  const title = chart.title || '데이터 요약';

  try {
    switch (type) {
      case 'bar': {
        const normalized = normalizeBarPieData(chart.data);
        return generateBarChart(title, normalized);
      }
      case 'pie': {
        const normalized = normalizeBarPieData(chart.data);
        return generatePieChart(title, normalized);
      }
      case 'comparison': {
        const { rows, headers } = normalizeComparisonData(chart.data);
        return generateComparisonChart(title, rows, headers);
      }
      case 'flow': {
        const steps = normalizeFlowData(chart.data);
        return generateFlowChart(title, steps);
      }
      case 'timeline': {
        const events = normalizeTimelineData(chart.data);
        return generateTimeline(title, events);
      }
      case 'summary': {
        const points = normalizeSummaryData(chart.data);
        return generateSummaryCard(title, points);
      }
      case 'mindmap': {
        const { center, branches } = normalizeMindmapData(chart.data, title);
        return generateMindMap(title, center, branches);
      }
      default:
        return '';
    }
  } catch (err) {
    console.warn('[svg-generator] Chart generation failed gracefully:', err);
    return '';
  }
}

// ─── Helpers ────────────────────────────────────

function escSvg(s: string): string {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function truncate(s: string, max: number): string {
  const str = String(s || '');
  return str.length > max ? str.slice(0, max) + '…' : str;
}

function wrapText(text: string, maxChars: number): string[] {
  const str = String(text || '').trim();
  if (!str) return [];
  const words = str.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      if (word.length > maxChars) {
        for (let i = 0; i < word.length; i += maxChars) {
          lines.push(word.slice(i, i + maxChars));
        }
      } else {
        current = word;
      }
    } else if ((current + ' ' + word).length <= maxChars) {
      current += ' ' + word;
    } else {
      lines.push(current);
      if (word.length > maxChars) {
        for (let i = 0; i < word.length; i += maxChars) {
          if (i + maxChars >= word.length) {
            current = word.slice(i);
          } else {
            lines.push(word.slice(i, i + maxChars));
          }
        }
      } else {
        current = word;
      }
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function formatNum(n: number | string): string {
  const num = typeof n === 'number' ? n : parseFloat(String(n).replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return String(n || '');
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return String(n);
}
