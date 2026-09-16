import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateHeroBanner, generateChart, generateMindMap, generateFlowChart, generateSummaryCard, generateBarChart, type ChartData } from './svg-generator';
import { getSkillById, buildSkillPrompt, type BlogSkillId, type MarketingOptions } from './blog-skills';

function getGenAIClient() {
  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    '';
  return new GoogleGenerativeAI(apiKey);
}

export interface GeneratedContent {
  title: string;
  subtitle: string;
  content: string;
  htmlContent: string;
  excerpt: string;
  tags: string[];
  faqs: { question: string; answer: string }[];
  sources: { title: string; url: string }[];
}

export async function generateBlogContent(params: {
  topic: string;
  ragFileUris?: { uri: string; mimeType: string }[];
  skillId?: BlogSkillId;
  customFields?: Record<string, string>;
  imageDescriptions?: string[];
  imageUrls?: string[];
  marketing?: MarketingOptions;
}): Promise<GeneratedContent> {
  const { topic, ragFileUris, skillId, customFields, imageDescriptions, imageUrls, marketing } = params;

  // 스킬 기반 프롬프트 생성 (연구 데이터 + 사진 분석 결과 + 마케팅 컨트롤 자동 포함)
  const skill = skillId ? getSkillById(skillId) : getSkillById('general');
  const skillPrompt = buildSkillPrompt(skill, topic, customFields, imageDescriptions, marketing);

  const prompt = `${skillPrompt}

## ★ AEO (AI 검색 최적화) 필수 규칙

### 제목 최적화
- title: SEO용 키워드 제목 (40~60자)
- subtitle: AEO용 질문형 부제 — 사용자가 AI에게 물어볼 때 쓰는 실제 질문 형태
  예: "○○ 어떻게 하나요?", "○○ 추천해주세요", "○○ 비용 얼마인가요?"

### 첫 문단 즉답 (answerCapsule)
- content 맨 첫 문단(2~3줄)은 반드시 **긍정형 정의/답변**으로 시작.
  ✅ "○○은 ~~하는 효과적인 방법입니다."
  ❌ "○○은 생각보다 어렵지 않습니다." (부정형 프레이밍 금지)
- AI가 이 첫 문단을 스니펫으로 추출함. 핵심 답변을 여기에 넣으세요.

### 메타 디스크립션
- excerpt는 첫 문단(즉답)과 일관된 메시지. 150자 이내.
- 핵심 답변 + 행동 유도 포함.

### FAQ 강화
- faqs 배열에 **4~6개** Q&A 포함.
- 본문에서 직접 다루지 않는 주변 질문도 포함 (실패 사례, 비교, 비용, 초보 가이드 등).
- 각 답변은 3~5문장으로 충분히 서술.

### E-E-A-T (전문성·경험·신뢰도)
- 본문 도입부에 전문성/경험 근거를 자연스럽게 포함.
  예: "실제 매장 운영 데이터를 분석한 결과", "수백 건의 사례를 검토한 경험에 따르면"
- 주장에는 가능한 근거(출처, 통계, 전문가 의견)를 병기.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 순수 JSON만 출력하세요.

{
  "title": "SEO에 최적화된 한국어 제목 (40~60자, 숫자+키워드 포함)",
  "subtitle": "AEO용 질문형 부제 (사용자가 AI에게 물어보는 형태)",
  "content": "마크다운 본문 (1500~2500자, 첫 문단은 긍정형 즉답)",
  "excerpt": "본문 요약 (2~3문장, 150자 이내, 첫 문단과 일관된 메시지)",
  "tags": ["태그1", "태그2", "태그3", "태그4", "태그5"],
  "faqs": [{"question": "질문", "answer": "3~5문장 답변"}],
  "charts": [
    {"type": "bar", "title": "차트 제목 예시", "data": [{"label": "A", "value": 100}, {"label": "B", "value": 200}]}
  ]
}

**중요: charts 배열은 반드시 2~3개, faqs는 4~6개 포함해야 합니다.**

charts의 type별 data 형식:
1. bar: [{"label": "항목", "value": 숫자}, ...] (3~7개)
2. pie: [{"label": "항목", "value": 숫자}, ...] (3~6개)
3. comparison: {"headers": ["기준A", "기준B"], "rows": [{"label": "항목", "values": [10, 20]}, ...]}
4. flow: ["단계1", "단계2", "단계3"] (3~6개 문자열 배열)
5. timeline: [{"label": "2024년", "desc": "주요 사건"}, ...]
6. summary: [{"icon": "1", "heading": "핵심 포인트", "desc": "설명 텍스트"}, ...] (2~6개, 글의 핵심 내용 구조화)
7. mindmap: {"center": "중심 주제", "branches": [{"label": "가지", "children": ["하위1", "하위2"]}, ...]} (글의 구조를 마인드맵으로)

작성 규칙:
1. title은 핵심 키워드를 포함한 SEO 최적화 제목
2. content는 ## 소제목으로 섹션 구분, 구체적 수치/사례 포함
3. content 첫 문단은 긍정형 즉답 (AI 스니펫 추출 대상)
4. [★ 절대 금지]: content 본문 안에는 절대로 \`\`\`json 코드 블록이나 JSON 객체를 직접 출력하지 마세요! 차트/데이터는 오직 최상위 "charts" 배열에만 작성해야 합니다. content에는 독자가 읽는 순수 한국어 마크다운 문장과 [IMAGE_N] 사진 위치만 작성하세요.
5. **핵심 문장은 **굵게** 처리** (형광펜 강조 효과)
6. tags는 검색 키워드 5개
7. 최신 웹 검색 결과 반영
8. charts는 최상위 "charts" 배열에 반드시 2~3개 포함! 숫자 데이터는 bar/pie, 글 구조는 summary/mindmap/flow 활용
${imageUrls?.length ? `9. [★ 사진의 피사체 분석 기반 유기적 스토리텔링 (최우선 준수)]:
- 총 ${imageUrls.length}장의 사진과 시각적 분석 정보가 제공됩니다:
${(imageDescriptions || []).map((d, i) => `  * [IMAGE_${i + 1}]: ${d}`).join('\n')}
- **[사진 분석 내용의 본문 서사 융합 (필수)]**:
  각 사진의 묘사된 시각적 디테일(인물의 표정, 안경, 복장, 느껴지는 인상/신뢰감, 미팅 장소 분위기, 테이블 위 서류나 양식지, 현장의 생생한 순간 등)을 **글의 본문 스토리와 대화 속에 자연스럽게 직접 묘사하고 언급**하세요.
  (예: "사진 속 따뜻한 미소와 스마트한 뿔테 안경 너머로 진정성이 느껴지는 대표님과의 첫인사...", "테이블 위에 펼쳐진 양식지를 함께 보며 사업의 철학을 나누던 순간...")
- 사진을 단순 장식용으로 본문 중간에 툭 던져두지 말고, **해당 사진 앞뒤 문맥에서 사진 속 인물이나 상황을 직접 호명하고 스토리로 연결**하십시오.
- 각 사진([IMAGE_1]~[IMAGE_${imageUrls.length}])을 가장 완벽하게 부합하는 문맥 위치에 유기적으로 배치하십시오.` : ''}
${ragFileUris?.length ? `${imageUrls?.length ? '10' : '9'}. 업로드된 문서 내용을 적극 활용하세요` : ''}`;

  // Build parts: fileData(RAG docs) + text prompt
  const parts: any[] = [];

  if (ragFileUris?.length) {
    for (const fileRef of ragFileUris) {
      parts.push({
        fileData: {
          fileUri: fileRef.uri,
          mimeType: fileRef.mimeType,
        },
      });
    }
  }

  parts.push({ text: prompt });

  const genAI = getGenAIClient();
  const configuredModel = process.env.GOOGLE_API_MODEL || 'gemini-2.5-flash';
  const candidateModels = [
    configuredModel,
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-3-flash-preview',
  ].filter((v, i, a) => a.indexOf(v) === i);

  let response: any = null;
  let text = '';
  let lastError: any = null;

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      });

      // 1. Google Search 포함 시도
      try {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts }],
          tools: [{ googleSearch: {} } as any],
        });
        response = result.response;
        text = response.text();
        if (text) break;
      } catch (groundingError: any) {
        console.warn(`[ContentGenerator] Search grounding failed with ${modelName}, retrying without search tool:`, groundingError.message);
        // 2. 검색 그라운딩 실패 시 지체 없이 순수 모델 호출로 즉각 폴백
        const directResult = await model.generateContent({
          contents: [{ role: 'user', parts }],
        });
        response = directResult.response;
        text = response.text();
        if (text) break;
      }
    } catch (err: any) {
      console.warn(`[ContentGenerator] Model ${modelName} attempt failed:`, err.message);
      lastError = err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  if (!text || !response) {
    throw lastError || new Error('블로그 글 생성 중 AI 연결이 지연되었습니다. 다시 시도해 주세요.');
  }

  // Parse JSON response safely with trailing comma and loose quote resilience
  let post = safeParseJson(text);
  if (!post) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      post = safeParseJson(jsonMatch[0]);
    }
  }
  if (!post) {
    throw new Error('AI 응답에서 유효한 JSON을 파싱하지 못했습니다.');
  }

  // Extract sources from grounding metadata
  const sources: { title: string; url: string }[] = [];
  try {
    const candidates = (response as any).candidates;
    const groundingMeta = candidates?.[0]?.groundingMetadata;
    const chunks = groundingMeta?.groundingChunks || [];
    for (const chunk of chunks) {
      if (chunk.web?.uri && chunk.web?.title) {
        if (!sources.some((s) => s.url === chunk.web.uri)) {
          sources.push({ title: chunk.web.title, url: chunk.web.uri });
        }
      }
    }
  } catch {
    // Sources extraction failed silently
  }

  // 1. 프레임워크 태그 완전 정제 ([Interest], [Attention], [Desire], [Action] 등)
  const cleanFrameworkTags = (text: string) =>
    (text || '').replace(/\[(?:Interest|Attention|Desire|Action|Problem|Agitate|Solution|Before|After|Bridge|Feature|Advantage|Benefit)\]\s*/gi, '');

  post.title = cleanFrameworkTags(post.title || '');
  if (post.subtitle) post.subtitle = cleanFrameworkTags(post.subtitle);
  post.content = cleanFrameworkTags(post.content || '');
  if (post.excerpt) post.excerpt = cleanFrameworkTags(post.excerpt);
  if (post.faqs) {
    post.faqs = post.faqs.map((f: any) => ({
      question: cleanFrameworkTags(f.question || ''),
      answer: cleanFrameworkTags(f.answer || ''),
    }));
  }

  // 2. 본문 내에 삽입된 inline JSON 차트 블록 추출 및 SVG 변환 처리
  const { cleanContent, inlineSvgPlaceholders, extractedCharts } = extractInlineChartsFromContent(post.content);
  post.content = cleanContent;

  // Generate SVG charts from Gemini response + extracted charts
  const rawCharts: ChartData[] = [...(post.charts || []), ...extractedCharts];
  // Deduplicate charts by title
  const seenChartTitles = new Set<string>();
  const charts: ChartData[] = [];
  for (const c of rawCharts) {
    if (c && c.type && !seenChartTitles.has(c.title || '')) {
      seenChartTitles.add(c.title || '');
      charts.push(c);
    }
  }

  const svgCharts: string[] = [];
  console.log('[blog-auto] Gemini charts count:', charts.length, 'types:', charts.map((c: any) => c?.type));

  for (const chart of charts) {
    try {
      const svg = generateChart(chart);
      if (svg) svgCharts.push(svg);
    } catch (e) {
      console.error('[blog-auto] Chart generation failed:', chart.type, e);
    }
  }

  const isOneToOne = skillId === 'one_to_one';

  // Generate fallback charts if needed (skip for authentic 121 personal meetings)
  if (!isOneToOne && svgCharts.length === 0 && inlineSvgPlaceholders.length === 0) {
    console.log('[blog-auto] No charts from Gemini, generating fallback charts from content');
    const fallbacks = generateFallbackCharts(post.title, post.content, post.tags || []);
    svgCharts.push(...fallbacks);
  }
  console.log('[blog-auto] Final SVG charts count:', svgCharts.length + inlineSvgPlaceholders.length);

  // Generate hero banner (omit for 121 meetings to maintain natural blog post look)
  const heroBanner = isOneToOne ? '' : generateHeroBanner(post.title, post.tags || []);

  // Markdown → HTML 변환
  let htmlContent = (heroBanner ? heroBanner + '\n' : '') + markdownToHtml(post.content);

  // 인라인 차트 플레이스홀더 치환
  for (const item of inlineSvgPlaceholders) {
    htmlContent = htmlContent.replace(item.placeholder, item.svg);
  }

  // [CHART_N] 플레이스홀더 모두 제거
  htmlContent = htmlContent.replace(/<p>[^<]*\[CHART_\d+\][^<]*<\/p>/g, '');
  htmlContent = htmlContent.replace(/\[CHART_\d+\]/g, '');

  // 섹션 사이에 자동 배치해야 할 차트가 있고, 인라인 차트가 부족한 경우 삽입
  if (!isOneToOne && svgCharts.length > 0 && inlineSvgPlaceholders.length === 0) {
    htmlContent = insertChartsAfterSections(htmlContent, svgCharts);
  }

  // 사용자 업로드/생성 이미지: [IMAGE_N] 플레이스홀더 치환 및 본문 필수 삽입
  if (imageUrls && imageUrls.length > 0) {
    const getCaption = (idx: number) => {
      const desc = imageDescriptions?.[idx]?.trim();
      if (desc && desc !== `사진 ${idx + 1}` && desc !== `사진_${idx + 1}`) {
        return desc.replace(/^\[?사진\s*\d+\]?\s*:?\s*/i, '');
      }
      return `${topic} 관련 현장 생생한 모습`;
    };

    const imgTag = (url: string, idx: number) => {
      const captionText = getCaption(idx);
      return `\n<div style="text-align:center;margin:28px 0;"><img src="${url}" alt="${captionText}" style="max-width:100%;height:auto;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.08);display:inline-block;" loading="lazy" onerror="if(!this.src.includes('images.unsplash.com')){this.src='https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80';}" /><p style="font-size:13px;color:#64748b;margin-top:8px;font-style:italic;line-height:1.5;">📷 <strong>[사진 ${idx + 1}]</strong> ${captionText}</p></div>\n`;
    };

    // 1차: 플레이스홀더 치환 ([IMAGE_1], [IMAGE_2], ...)
    const usedIndices = new Set<number>();
    for (let idx = 0; idx < imageUrls.length; idx++) {
      const pattern = new RegExp(`\\[IMAGE_${idx + 1}\\]`, 'g');
      if (pattern.test(htmlContent)) {
        htmlContent = htmlContent.replace(
          new RegExp(`<p>[^<]*\\[IMAGE_${idx + 1}\\][^<]*</p>`, 'g'),
          imgTag(imageUrls[idx], idx)
        );
        htmlContent = htmlContent.replace(pattern, imgTag(imageUrls[idx], idx));
        usedIndices.add(idx);
      }

      if (pattern.test(post.content)) {
        post.content = post.content.replace(pattern, imgTag(imageUrls[idx], idx));
      }
    }

    // 2차: 플레이스홀더가 누락되었거나 남은 이미지가 있으면 <h2> 섹션 뒤 또는 문단 사이에 강제 삽입
    const unusedIndices = imageUrls.map((_, i) => i).filter((i) => !usedIndices.has(i));
    if (unusedIndices.length > 0) {
      console.log(`[blog-auto] Inserting ${unusedIndices.length} unused images into content sections...`);
      const paragraphs = htmlContent.split('</p>');
      
      if (paragraphs.length >= 3) {
        const step = Math.max(1, Math.floor(paragraphs.length / (unusedIndices.length + 1)));
        let insertOffset = 0;
        
        unusedIndices.forEach((imgIdx, i) => {
          const targetPos = Math.min((i + 1) * step + insertOffset, paragraphs.length - 1);
          paragraphs[targetPos] = paragraphs[targetPos] + imgTag(imageUrls[imgIdx], imgIdx);
          
          post.content += imgTag(imageUrls[imgIdx], imgIdx);
        });
        htmlContent = paragraphs.join('</p>');
      } else {
        unusedIndices.forEach((imgIdx) => {
          htmlContent += imgTag(imageUrls[imgIdx], imgIdx);
          post.content += imgTag(imageUrls[imgIdx], imgIdx);
        });
      }
    }
  }

  // 3. 미사용 잔여 플레이스홀더 및 코드 잔재 완전 정리
  post.content = post.content
    .replace(/<!--\s*INLINE_CHART_\d+\s*-->/g, '')
    .replace(/\[IMAGE_\d+\]/g, '')
    .replace(/\[CHART_\d+\]/g, '')
    .replace(/```[a-zA-Z0-9_-]*\s*\{[\s\S]*?\}\s*```/gi, '')
    .trim();

  htmlContent = htmlContent
    .replace(/<!--\s*INLINE_CHART_\d+\s*-->/g, '')
    .replace(/<p>[^<]*\[IMAGE_\d+\][^<]*<\/p>/g, '')
    .replace(/\[IMAGE_\d+\]/g, '')
    .replace(/<p>[^<]*\[CHART_\d+\][^<]*<\/p>/g, '')
    .replace(/\[CHART_\d+\]/g, '')
    .replace(/<p>\s*<\/p>/g, '')
    .trim();

  return {
    title: post.title,
    subtitle: post.subtitle || '',
    content: post.content,
    htmlContent,
    excerpt: post.excerpt,
    tags: post.tags || [],
    faqs: post.faqs || [],
    sources,
  };
}

/** 오류에 유연하게 대응하는 안전한 JSON 파서 (후행 쉼표, 작은따옴표, 마크다운 펜스 자동 복구) */
function safeParseJson(str: string): any {
  if (!str) return null;
  const trimmed = str.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    try {
      const withoutFences = trimmed.replace(/^```[a-zA-Z0-9_-]*\s*/i, '').replace(/\s*```$/i, '').trim();
      return JSON.parse(withoutFences);
    } catch {
      try {
        const cleanTrailing = trimmed.replace(/,\s*([}\]])/g, '$1');
        return JSON.parse(cleanTrailing);
      } catch {
        try {
          const cleanQuotes = trimmed
            .replace(/'/g, '"')
            .replace(/,\s*([}\]])/g, '$1');
          return JSON.parse(cleanQuotes);
        } catch {
          return null;
        }
      }
    }
  }
}

/** 비교 분석용 HTML 테이블 생성 (네이버/티스토리/웹 100% 호환 인라인 스타일) */
function generateComparisonTableHtml(item: any): string {
  const headers: string[] = Array.isArray(item.data?.headers) ? item.data.headers : [];
  const rows: any[] = Array.isArray(item.data?.rows) ? item.data.rows : (Array.isArray(item.data) ? item.data : []);

  let tableHtml = `\n<div style="margin:28px auto;max-width:100%;overflow-x:auto;border-radius:12px;border:1px solid #cbd5e1;box-shadow:0 4px 14px rgba(0,0,0,0.05);background:#ffffff;">\n`;
  if (item.title) {
    tableHtml += `  <div style="background:#f8fafc;padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:800;font-size:14.5px;color:#0f172a;text-align:center;">📊 ${item.title}</div>\n`;
  }
  tableHtml += `  <table style="width:100%;border-collapse:collapse;font-size:13.5px;text-align:center;font-family:system-ui,-apple-system,sans-serif;">\n`;
  if (headers.length > 0) {
    tableHtml += `    <thead>\n      <tr style="background:#f1f5f9;color:#1e293b;border-bottom:2px solid #cbd5e1;">\n`;
    headers.forEach((h: string, hi: number) => {
      const align = hi === 0 ? 'left' : 'center';
      tableHtml += `        <th style="padding:10px 14px;font-weight:700;border:1px solid #e2e8f0;text-align:${align};">${h}</th>\n`;
    });
    tableHtml += `      </tr>\n    </thead>\n`;
  }
  tableHtml += `    <tbody>\n`;
  rows.forEach((row: any, ri: number) => {
    const rowBg = ri % 2 === 0 ? '#ffffff' : '#f8fafc';
    tableHtml += `      <tr style="background:${rowBg};border-bottom:1px solid #e2e8f0;">\n`;
    tableHtml += `        <td style="padding:10px 14px;font-weight:700;border:1px solid #e2e8f0;color:#0f172a;text-align:left;">${row.label || ''}</td>\n`;
    const vals: any[] = Array.isArray(row.values) ? row.values : [];
    vals.forEach((v: any) => {
      tableHtml += `        <td style="padding:10px 14px;border:1px solid #e2e8f0;color:#334155;font-weight:600;">${v}</td>\n`;
    });
    tableHtml += `      </tr>\n`;
  });
  tableHtml += `    </tbody>\n  </table>\n</div>\n`;
  return tableHtml;
}

/** 비교 분석용 마크다운 테이블 생성 */
function generateComparisonMarkdownTable(item: any): string {
  const headers: string[] = Array.isArray(item.data?.headers) ? item.data.headers : [];
  const rows: any[] = Array.isArray(item.data?.rows) ? item.data.rows : (Array.isArray(item.data) ? item.data : []);

  let md = `\n\n> 📊 **${item.title || '비교 분석'}**\n\n`;
  if (headers.length > 0) {
    md += `| ${headers.join(' | ')} |\n`;
    md += `| ${headers.map((_, i) => (i === 0 ? ':---' : ':---:')).join(' | ')} |\n`;
  }
  rows.forEach((row: any) => {
    const rowVals = Array.isArray(row.values) ? row.values.join(' | ') : '';
    md += `| ${row.label || ''} | ${rowVals} |\n`;
  });
  return md;
}

/** 본문 내에 삽입된 inline JSON 차트 블록을 찾아 SVG 차트로 변환하고 본문 텍스트를 정제 */
function extractInlineChartsFromContent(content: string): {
  cleanContent: string;
  inlineSvgPlaceholders: { placeholder: string; svg: string }[];
  extractedCharts: ChartData[];
} {
  const inlineSvgPlaceholders: { placeholder: string; svg: string }[] = [];
  const extractedCharts: ChartData[] = [];

  let cleanContent = content || '';

  const processChartItem = (item: any): { mdSummary: string } | null => {
    if (!item || !item.type) return null;
    const type = String(item.type).toLowerCase().replace(/[-_]/g, '');
    const validTypes = ['bar', 'pie', 'comparison', 'compare', 'flow', 'timeline', 'summary', 'mindmap', 'table', 'donut', 'tree'];
    if (!validTypes.includes(type)) return null;

    extractedCharts.push(item);
    const placeholder = `<!-- INLINE_CHART_${inlineSvgPlaceholders.length + 1} -->`;

    if (type === 'comparison' || type === 'compare' || type === 'table') {
      const tableHtml = generateComparisonTableHtml(item);
      inlineSvgPlaceholders.push({ placeholder, svg: tableHtml });
      return { mdSummary: generateComparisonMarkdownTable(item) + `\n\n${placeholder}\n\n` };
    }

    const svg = generateChart(item);
    if (svg) {
      inlineSvgPlaceholders.push({ placeholder, svg: `\n<div style="text-align:center;margin:28px 0;">${svg}</div>\n` });
    }

    if (type.includes('bar') || type.includes('pie') || type.includes('donut')) {
      const dataItems = Array.isArray(item.data) ? item.data.map((d: any) => `- ${d.label || d.name || '항목'}: **${d.value ?? d.val ?? ''}**`).join('\n') : '';
      return { mdSummary: `\n\n> 📊 **${item.title || '수치 요약'}**\n${dataItems}\n\n${placeholder}\n\n` };
    } else if (type.includes('summary')) {
      const points = Array.isArray(item.data) ? item.data.map((d: any) => `- **${d.heading || d.title || d.icon || '핵심'}**: ${d.desc || d.content || ''}`).join('\n') : '';
      return { mdSummary: `\n\n> 📌 **${item.title || '핵심 요약'}**\n${points}\n\n${placeholder}\n\n` };
    } else if (type.includes('flow')) {
      const steps = Array.isArray(item.data) ? item.data.map((s: any, idx: number) => `${idx + 1}. ${typeof s === 'object' ? (s.step || s.title || '') : s}`).join(' → ') : '';
      return { mdSummary: `\n\n> 🔄 **${item.title || '진행 순서'}**: ${steps}\n\n${placeholder}\n\n` };
    }

    return { mdSummary: `\n\n${placeholder}\n\n` };
  };

  // 1. 모든 언어 태그(```, ```chart, ```json, ```js 등)가 붙은 코드 블록 내의 JSON 차트 탐지
  const codeBlockRegex = /```[a-zA-Z0-9_-]*\s*([\s\S]*?)\s*```/gi;
  cleanContent = cleanContent.replace(codeBlockRegex, (fullMatch, codeContent) => {
    const trimmed = codeContent.trim();
    const jsonMatch = trimmed.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      const parsed = safeParseJson(jsonMatch[0]);
      if (parsed) {
        const chartList = Array.isArray(parsed) ? parsed : [parsed];
        let hasChart = false;
        let mdSummary = '';

        for (const item of chartList) {
          const res = processChartItem(item);
          if (res) {
            hasChart = true;
            mdSummary += res.mdSummary;
          }
        }

        if (hasChart) {
          return mdSummary.trim();
        }
      }
    }
    return fullMatch;
  });

  // 2. 대괄호/괄호 형태의 차트 정의 ([CHART: {...}], ((CHART: {...})))
  const bracketChartRegex = /(?:\[|\(\(|\<\!--)\s*CHART\s*:\s*(\{[\s\S]*?\})\s*(?:\]|\)\)|\-\-\>)/gi;
  cleanContent = cleanContent.replace(bracketChartRegex, (fullMatch, jsonStr) => {
    const parsed = safeParseJson(jsonStr);
    if (parsed) {
      const res = processChartItem(parsed);
      if (res) return res.mdSummary;
    }
    return '';
  });

  // 3. 코드 블록 없이 단독으로 들어간 { "type": "bar", ... } JSON 문자열 탐지
  const rawJsonChartRegex = /\{\s*"type"\s*:\s*"(?:bar|pie|comparison|compare|flow|timeline|summary|mindmap|table)"[\s\S]*?\}(?:\s*\})?/gi;
  cleanContent = cleanContent.replace(rawJsonChartRegex, (rawJsonMatch) => {
    const jsonMatch = rawJsonMatch.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return '';
    const parsed = safeParseJson(jsonMatch[0]);
    if (parsed) {
      const res = processChartItem(parsed);
      if (res) return res.mdSummary;
    }
    return '';
  });

  return { cleanContent, inlineSvgPlaceholders, extractedCharts };
}

function generateFallbackCharts(title: string, content: string, tags: string[]): string[] {
  const charts: string[] = [];

  // 1. 마인드맵: 제목 + 섹션 제목들로 구성
  const headings = content.match(/^## .+$/gm)?.map(h => h.replace(/^## /, '')) || [];
  if (headings.length >= 2) {
    const branches = headings.slice(0, 6).map(h => ({
      label: h,
      children: [] as string[],
    }));
    charts.push(generateMindMap(title, title.slice(0, 8), branches));
  }

  // 2. 플로우 차트: 섹션 순서를 프로세스로
  if (headings.length >= 3) {
    charts.push(generateFlowChart(`${title} - 핵심 흐름`, headings.slice(0, 6)));
  }

  // 3. 서머리 카드: 태그 기반 핵심 포인트
  if (tags.length >= 3) {
    const points = tags.slice(0, 6).map((tag, i) => ({
      icon: String(i + 1),
      heading: tag,
      desc: `${title} 관련 핵심 키워드`,
    }));
    charts.push(generateSummaryCard(`${title} - 핵심 키워드`, points));
  }

  // 최소 2개 보장
  if (charts.length < 2 && headings.length >= 2) {
    const barData = headings.slice(0, 5).map((h, i) => ({
      label: h.slice(0, 8),
      value: Math.floor(Math.random() * 60) + 40,
    }));
    charts.push(generateBarChart(`${title} - 섹션별 중요도`, barData));
  }

  return charts.slice(0, 3);
}

function insertChartsAfterSections(html: string, charts: string[]): string {
  // <h2> 태그 위치를 찾아서 섹션 사이에 차트 삽입
  const h2Positions: number[] = [];
  const h2Regex = /<h2[\s>]/gi;
  let match;
  while ((match = h2Regex.exec(html)) !== null) {
    h2Positions.push(match.index);
  }

  if (h2Positions.length < 2) {
    // h2가 1개 이하면 본문 끝에 모든 차트 추가
    return html + '\n' + charts.join('\n');
  }

  // 차트를 섹션 사이에 균등 배치
  const insertPoints: number[] = [];
  const step = Math.max(1, Math.floor(h2Positions.length / (charts.length + 1)));
  for (let i = 0; i < charts.length; i++) {
    const idx = Math.min((i + 1) * step, h2Positions.length - 1);
    insertPoints.push(h2Positions[idx]);
  }

  // 뒤에서부터 삽입 (인덱스 변경 방지)
  let result = html;
  for (let i = insertPoints.length - 1; i >= 0; i--) {
    result = result.slice(0, insertPoints[i]) + charts[i] + '\n' + result.slice(insertPoints[i]);
  }

  return result;
}

export function markdownToHtml(markdown: string): string {
  // 0. 프레임워크 괄호 태그 ([Interest], [Attention], [Desire], [Action] 등) 본문/소제목에서 완전 제거
  let cleanMd = markdown.replace(/\[(?:Interest|Attention|Desire|Action|Problem|Agitate|Solution|Before|After|Bridge|Feature|Advantage|Benefit)\]\s*/gi, '');

  // 1. 마크다운 테이블을 프리미엄 네이버/티스토리 호환 HTML 테이블로 변환
  const lines = cleanMd.split('\n');
  const processed: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const curr = lines[i].trim();
    const next = i + 1 < lines.length ? lines[i + 1].trim() : '';

    if (
      curr.startsWith('|') &&
      curr.endsWith('|') &&
      next.startsWith('|') &&
      next.endsWith('|') &&
      /^\|[\s:|-]+\|$/.test(next)
    ) {
      const headerCells = curr.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      const alignLine = next.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      const aligns = alignLine.map(cell => {
        if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
        if (cell.endsWith(':')) return 'right';
        if (cell.startsWith(':')) return 'left';
        return 'center';
      });

      let tableHtml = `\n<div style="margin:24px auto;max-width:100%;overflow-x:auto;border-radius:12px;border:1px solid #cbd5e1;box-shadow:0 4px 14px rgba(0,0,0,0.04);background:#ffffff;">\n<table style="width:100%;border-collapse:collapse;font-size:13.5px;text-align:center;font-family:system-ui,-apple-system,sans-serif;">\n<thead>\n<tr style="background:#f8fafc;border-bottom:2px solid #cbd5e1;color:#1e293b;">`;
      headerCells.forEach((cell, ci) => {
        tableHtml += `\n  <th style="padding:12px 14px;font-weight:700;border:1px solid #e2e8f0;background:#f1f5f9;text-align:${aligns[ci] || 'center'};">${cell}</th>`;
      });
      tableHtml += '\n</tr>\n</thead>\n<tbody>';

      i += 2; // 헤더 + 구분선 스킵
      let rowCount = 0;
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        const rowCells = lines[i].split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        if (rowCells.length > 0) {
          const rowBg = rowCount % 2 === 0 ? '#ffffff' : '#f8fafc';
          tableHtml += `\n<tr style="background:${rowBg};border-bottom:1px solid #e2e8f0;">`;
          rowCells.forEach((cell, ci) => {
            let styledCell = cell;
            // ▲ 빨간색 상승 강조, ▼ 파란색 하락 강조
            if (cell.includes('▲') || cell.startsWith('+')) {
              styledCell = `<strong style="color:#e11d48;">${cell}</strong>`;
            } else if (cell.includes('▼') || (cell.startsWith('-') && !cell.startsWith('---'))) {
              styledCell = `<strong style="color:#2563eb;">${cell}</strong>`;
            }
            const textAlign = ci === 0 ? 'left' : aligns[ci] || 'center';
            tableHtml += `\n  <td style="padding:10px 14px;border:1px solid #e2e8f0;color:#334155;text-align:${textAlign};">${styledCell}</td>`;
          });
          tableHtml += '\n</tr>';
          rowCount++;
        }
        i++;
      }
      tableHtml += '\n</tbody>\n</table>\n</div>\n';
      processed.push(tableHtml);
    } else {
      processed.push(lines[i]);
      i++;
    }
  }

  let html = processed.join('\n');

  // 1.2. 마크다운 코드 블록 (```) 처리
  html = html.replace(/```[a-zA-Z0-9_-]*\n?([\s\S]*?)```/g, (match, code) => {
    // 혹시 남은 JSON 차트가 있는지 확인
    const trimmed = code.trim();
    const jsonMatch = trimmed.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed && parsed.type && ['bar', 'pie', 'comparison', 'flow', 'timeline', 'summary', 'mindmap'].includes(parsed.type)) {
          if (parsed.type === 'comparison') {
            return generateComparisonTableHtml(parsed);
          }
          const svg = generateChart(parsed);
          if (svg) return `<div style="text-align:center;margin:28px 0;">${svg}</div>`;
        }
      } catch {}
    }
    return `<pre style="background:#1e293b;color:#f8fafc;padding:16px;border-radius:10px;overflow-x:auto;font-size:13px;font-family:monospace;margin:20px 0;"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
  });

  // 1.5. 네이버 스타일 말풍선 인용구 (> [말풍선] ...)
  html = html.replace(
    /^>\s*\[(?:말풍선|speech|인용)\]\s*(.+)$/gim,
    `<div style="margin:28px auto 20px auto;max-width:480px;text-align:center;">
  <div style="border:2px solid #cbd5e1;border-radius:12px;padding:16px 22px;background:#ffffff;box-shadow:0 4px 14px rgba(0,0,0,0.04);position:relative;display:inline-block;width:100%;">
    <p style="margin:0;font-size:15px;font-weight:700;color:#e11d48;line-height:1.6;letter-spacing:-0.3px;">$1</p>
  </div>
  <div style="width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-top:10px solid #cbd5e1;margin:-1px auto 16px auto;"></div>
</div>`
  );

  // 일반 Blockquote (매거진 감성)
  html = html.replace(
    /^>\s*(.+)$/gm,
    '<blockquote style="background:#f8fafc;border-left:4px solid #3b82f6;border-radius:0 10px 10px 0;padding:16px 20px;margin:24px 0;color:#1e293b;font-size:15px;line-height:1.75;box-shadow:0 2px 6px rgba(0,0,0,0.02);">$1</blockquote>'
  );

  // 구분선 (---)
  html = html.replace(/^---$/gm, '<hr style="border:0;height:1px;background:linear-gradient(to right, transparent, #cbd5e1, transparent);margin:36px auto;max-width:80%;">');

  // 2. Headers (매거진/블로그 전용 감각적 소제목 디자인)
  html = html.replace(
    /^[①-⑩]\s*(.+)$/gm,
    '<h3 style="font-size:16.5px;font-weight:700;color:#0f172a;margin:26px 0 10px 0;border-left:4px solid #3b82f6;padding-left:10px;line-height:1.4;">$1</h3>'
  );
  html = html.replace(
    /^### (.+)$/gm,
    '<h3 style="font-size:17px;font-weight:700;color:#334155;margin:30px 0 12px 0;border-bottom:2px solid #f1f5f9;padding-bottom:6px;letter-spacing:-0.3px;">$1</h3>'
  );
  html = html.replace(
    /^## (.+)$/gm,
    '<h2 style="font-size:20px;font-weight:800;color:#0f172a;border-left:5px solid #ff5722;padding-left:12px;margin:38px 0 16px 0;letter-spacing:-0.4px;line-height:1.4;">$1</h2>'
  );
  html = html.replace(
    /^# (.+)$/gm,
    '<h1 style="font-size:24px;font-weight:800;color:#0f172a;margin:24px 0 16px 0;letter-spacing:-0.5px;">$1</h1>'
  );

  // 3. Unordered lists
  html = html.replace(/^[-*] (.+)$/gm, '<li style="margin-bottom:6px;line-height:1.75;color:#334155;">$1</li>');
  html = html.replace(/(<li style="margin-bottom:6px;line-height:1.75;color:#334155;">.*<\/li>\n?)+/g, (match) => `<ul style="margin:16px 0 20px 0;padding-left:22px;list-style-type:disc;">${match}</ul>`);

  // 4. Bold / Italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#0f172a;font-weight:700;">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em style="color:#475569;font-style:italic;">$1</em>');

  // 4.5. Images (![alt](url)) -> Must be parsed BEFORE links ([text](url))!
  html = html.replace(
    /!\[(.*?)\]\((.*?)\)/g,
    (match, alt, src) => {
      if (src.startsWith('http') || src.startsWith('data:image/')) {
        return `<div style="text-align:center;margin:28px 0;"><img src="${src}" alt="${alt}" style="max-width:100%;height:auto;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.08);display:inline-block;" /><p style="font-size:13px;color:#64748b;margin-top:8px;font-style:italic;line-height:1.5;">📷 <strong>[사진]</strong> ${alt}</p></div>`;
      }
      return `<div style="text-align:center;margin:20px 0;padding:14px;border:1px dashed #cbd5e1;border-radius:10px;background:#f8fafc;color:#475569;font-size:13px;">📷 [사진 들어갈 자리: ${alt}]</div>`;
    }
  );

  // 5. Links
  html = html.replace(
    /\[(.+?)\]\((.+?)\)/g,
    '<a href="$2" target="_blank" style="color:#2563eb;text-decoration:underline;font-weight:500;">$1</a>'
  );

  // 6. Line breaks → paragraphs
  html = html
    .split('\n\n')
    .filter((p) => p.trim())
    .map((p) => {
      if (
        p.startsWith('<h') ||
        p.startsWith('<ul') ||
        p.startsWith('<ol') ||
        p.startsWith('<table') ||
        p.startsWith('<blockquote') ||
        p.startsWith('<hr') ||
        p.startsWith('<div') ||
        p.startsWith('<pre') ||
        p.startsWith('<!--')
      ) {
        return p;
      }
      return `<p style="font-size:15.5px;line-height:1.85;color:#334155;margin-bottom:18px;word-break:keep-all;">${p.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');

  return html;
}
