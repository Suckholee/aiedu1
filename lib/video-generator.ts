/** Enhanced Browser-based video generator — Advertising Shorts quality */

export interface VideoScene {
  text: string;
  narration: string;
  duration: number;
  style: 'intro' | 'content' | 'highlight' | 'outro';
  emoji?: string;
  imagePrompt?: string;
}

export interface VideoConfig {
  width: number;
  height: number;
  fps: number;
  title: string;
  scenes: VideoScene[];
  watermark?: string;
  audioData?: (string | null)[];
  bgm?: AudioBuffer;
  backgroundImages?: (HTMLImageElement | null)[];
  theme?: 'neon' | 'vibrant' | 'elegant';
}

// ─── Theme System ────────────────────────────────────────────

interface ThemeColors {
  bg: string[];
  accent: string;
  accent2: string;
  text: string;
  glow: string;
  particle: string;
}

type SceneStyle = 'intro' | 'content' | 'highlight' | 'outro';

const THEMES: Record<string, Record<SceneStyle, ThemeColors>> = {
  neon: {
    intro: {
      bg: ['#0a0015', '#1a0040', '#0d001a'],
      accent: '#ff4ecb',
      accent2: '#7b2ff7',
      text: '#ffffff',
      glow: '#ff4ecb',
      particle: '#ff4ecb',
    },
    content: {
      bg: ['#000a1a', '#001030', '#000820'],
      accent: '#00d4ff',
      accent2: '#0066ff',
      text: '#f0f6ff',
      glow: '#00d4ff',
      particle: '#00d4ff',
    },
    highlight: {
      bg: ['#1a0a00', '#2a0f00', '#180800'],
      accent: '#ffd000',
      accent2: '#ff6b00',
      text: '#ffffff',
      glow: '#ffd000',
      particle: '#ffd000',
    },
    outro: {
      bg: ['#0a0015', '#1a0040', '#0d001a'],
      accent: '#ff4ecb',
      accent2: '#7b2ff7',
      text: '#ffffff',
      glow: '#ff4ecb',
      particle: '#ff4ecb',
    },
  },
  vibrant: {
    intro: {
      bg: ['#1a0a2e', '#2d1b69', '#1a0a2e'],
      accent: '#f97316',
      accent2: '#ef4444',
      text: '#ffffff',
      glow: '#f97316',
      particle: '#f97316',
    },
    content: {
      bg: ['#0c1524', '#162038', '#0c1524'],
      accent: '#22d3ee',
      accent2: '#3b82f6',
      text: '#f0f9ff',
      glow: '#22d3ee',
      particle: '#22d3ee',
    },
    highlight: {
      bg: ['#1c1917', '#292524', '#1c1917'],
      accent: '#fbbf24',
      accent2: '#f59e0b',
      text: '#ffffff',
      glow: '#fbbf24',
      particle: '#fbbf24',
    },
    outro: {
      bg: ['#1a0a2e', '#2d1b69', '#1a0a2e'],
      accent: '#f97316',
      accent2: '#ef4444',
      text: '#ffffff',
      glow: '#f97316',
      particle: '#f97316',
    },
  },
  elegant: {
    intro: {
      bg: ['#0f172a', '#1e293b', '#0f172a'],
      accent: '#d4a574',
      accent2: '#b8860b',
      text: '#f8fafc',
      glow: '#d4a574',
      particle: '#d4a574',
    },
    content: {
      bg: ['#0f172a', '#1e293b', '#0f172a'],
      accent: '#94a3b8',
      accent2: '#64748b',
      text: '#e2e8f0',
      glow: '#94a3b8',
      particle: '#94a3b8',
    },
    highlight: {
      bg: ['#1c1917', '#27241d', '#1c1917'],
      accent: '#d4a574',
      accent2: '#b8860b',
      text: '#ffffff',
      glow: '#d4a574',
      particle: '#d4a574',
    },
    outro: {
      bg: ['#0f172a', '#1e293b', '#0f172a'],
      accent: '#d4a574',
      accent2: '#b8860b',
      text: '#f8fafc',
      glow: '#d4a574',
      particle: '#d4a574',
    },
  },
};

// ─── Particle System ─────────────────────────────────────────

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  maxOpacity: number;
  phase: number;
}

function createParticles(
  count: number,
  width: number,
  height: number
): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.8,
    vy: -Math.random() * 0.6 - 0.2,
    size: Math.random() * 6 + 2,
    opacity: 0,
    maxOpacity: Math.random() * 0.35 + 0.1,
    phase: Math.random() * Math.PI * 2,
  }));
}

function updateParticles(
  particles: Particle[],
  width: number,
  height: number,
  progress: number
) {
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.opacity =
      p.maxOpacity * (0.5 + 0.5 * Math.sin(progress * Math.PI * 4 + p.phase));
    if (p.y < -20) {
      p.y = height + 20;
      p.x = Math.random() * width;
    }
    if (p.x < -20) p.x = width + 20;
    if (p.x > width + 20) p.x = -20;
  }
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  color: string
) {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = p.size * 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ─── Utility ─────────────────────────────────────────────────

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const chars = [...text];
  const lines: string[] = [];
  let line = '';
  for (const char of chars) {
    const testLine = line + char;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = char;
    } else {
      line = testLine;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// ─── Background Image with Ken Burns ─────────────────────────

const KEN_BURNS_PRESETS = [
  { sScale: 1.0, eScale: 1.2, sPanX: 0, ePanX: -0.03, sPanY: 0, ePanY: -0.02 },
  { sScale: 1.2, eScale: 1.0, sPanX: -0.03, ePanX: 0.03, sPanY: 0, ePanY: 0 },
  { sScale: 1.1, eScale: 1.18, sPanX: 0.03, ePanX: -0.03, sPanY: -0.02, ePanY: 0.02 },
  { sScale: 1.18, eScale: 1.05, sPanX: 0, ePanX: 0, sPanY: 0.03, ePanY: -0.03 },
];

function drawBackgroundImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  progress: number,
  width: number,
  height: number,
  sceneIndex: number
) {
  const kb = KEN_BURNS_PRESETS[sceneIndex % KEN_BURNS_PRESETS.length];
  const t = easeInOutCubic(progress);
  const scale = kb.sScale + (kb.eScale - kb.sScale) * t;
  const panX = (kb.sPanX + (kb.ePanX - kb.sPanX) * t) * width;
  const panY = (kb.sPanY + (kb.ePanY - kb.sPanY) * t) * height;

  ctx.save();
  ctx.translate(width / 2 + panX, height / 2 + panY);
  ctx.scale(scale, scale);
  ctx.translate(-width / 2, -height / 2);

  // Draw image with object-fit: cover
  const imgAspect = img.naturalWidth / img.naturalHeight;
  const canvasAspect = width / height;
  let dw: number, dh: number, dx: number, dy: number;
  if (imgAspect > canvasAspect) {
    dh = height;
    dw = height * imgAspect;
    dx = (width - dw) / 2;
    dy = 0;
  } else {
    dw = width;
    dh = width / imgAspect;
    dx = 0;
    dy = (height - dh) / 2;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();

  // Gradient overlay for text readability
  const overlay = ctx.createLinearGradient(0, 0, 0, height);
  overlay.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
  overlay.addColorStop(0.35, 'rgba(0, 0, 0, 0.35)');
  overlay.addColorStop(0.65, 'rgba(0, 0, 0, 0.45)');
  overlay.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, width, height);
}

// ─── Background Effects ──────────────────────────────────────

function drawAnimatedBackground(
  ctx: CanvasRenderingContext2D,
  colors: ThemeColors,
  progress: number,
  width: number,
  height: number
) {
  // Layer 1: Animated radial gradient
  const angle = progress * Math.PI * 0.3;
  const cx = width * (0.5 + 0.3 * Math.cos(angle));
  const cy = height * (0.3 + 0.2 * Math.sin(angle));

  const grad = ctx.createRadialGradient(cx, cy, 0, width / 2, height / 2, width);
  grad.addColorStop(0, colors.bg[1]);
  grad.addColorStop(0.5, colors.bg[0]);
  grad.addColorStop(1, colors.bg[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Layer 2: Accent light spot 1
  ctx.save();
  ctx.globalAlpha = 0.07;
  const s1x = width * (0.7 + 0.2 * Math.sin(progress * Math.PI * 2));
  const s1y = height * (0.3 + 0.1 * Math.cos(progress * Math.PI * 1.5));
  const sg1 = ctx.createRadialGradient(s1x, s1y, 0, s1x, s1y, width * 0.4);
  sg1.addColorStop(0, colors.accent);
  sg1.addColorStop(1, 'transparent');
  ctx.fillStyle = sg1;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // Layer 3: Accent light spot 2
  ctx.save();
  ctx.globalAlpha = 0.05;
  const s2x = width * (0.3 + 0.15 * Math.cos(progress * Math.PI * 1.8));
  const s2y = height * (0.7 + 0.1 * Math.sin(progress * Math.PI * 2.2));
  const sg2 = ctx.createRadialGradient(s2x, s2y, 0, s2x, s2y, width * 0.35);
  sg2.addColorStop(0, colors.accent2);
  sg2.addColorStop(1, 'transparent');
  ctx.fillStyle = sg2;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawGeometricShapes(
  ctx: CanvasRenderingContext2D,
  colors: ThemeColors,
  progress: number,
  width: number,
  height: number
) {
  ctx.save();

  // Floating ring shapes
  for (let i = 0; i < 5; i++) {
    const phase = (i / 5) * Math.PI * 2;
    const x =
      width * (0.2 + 0.6 * ((Math.sin(progress * Math.PI + phase) + 1) / 2));
    const y =
      height *
      (0.15 + 0.7 * ((Math.cos(progress * Math.PI * 0.8 + phase) + 1) / 2));
    const size =
      width * (0.02 + 0.015 * Math.sin(progress * Math.PI * 2 + phase));

    ctx.globalAlpha = 0.04 + 0.03 * Math.sin(progress * Math.PI * 3 + phase);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Decorative bezier lines
  ctx.globalAlpha = 0.025;
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1;

  for (let i = 0; i < 3; i++) {
    const y =
      height * (0.2 + 0.2 * i) +
      height * 0.02 * Math.sin(progress * Math.PI * 2 + i);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(
      width * 0.3,
      y + height * 0.05 * Math.sin(progress * Math.PI + i),
      width * 0.7,
      y - height * 0.05 * Math.sin(progress * Math.PI + i + 1),
      width,
      y
    );
    ctx.stroke();
  }

  ctx.restore();
}

// ─── Text Effects ────────────────────────────────────────────

function drawTextWithEffects(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    fontSize: number;
    color: string;
    accentColor: string;
    glowColor: string;
    glow?: boolean;
    outline?: boolean;
  }
) {
  const { fontSize, color, accentColor, glowColor, glow, outline } = options;

  ctx.save();
  ctx.font = `bold ${fontSize}px "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Glow pass
  if (glow) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = fontSize * 0.35;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
  }

  // Drop shadow
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = fontSize * 0.12;
  ctx.shadowOffsetY = fontSize * 0.04;

  // Outline
  if (outline) {
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = fontSize * 0.055;
    ctx.lineJoin = 'round';
    ctx.strokeText(text, x, y);
  }

  // Fill
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);

  ctx.restore();
}

// ─── Main Scene Renderer ─────────────────────────────────────

function drawScene(
  ctx: CanvasRenderingContext2D,
  scene: VideoScene,
  progress: number,
  config: VideoConfig,
  sceneIndex: number,
  totalScenes: number,
  particles: Particle[]
) {
  const { width, height } = config;
  const themeName = config.theme || 'neon';
  const colors =
    THEMES[themeName]?.[scene.style] || THEMES.neon[scene.style];

  // ── Background layers ──
  const bgImage = config.backgroundImages?.[sceneIndex];
  if (bgImage) {
    drawBackgroundImage(ctx, bgImage, progress, width, height, sceneIndex);
    // Subtle geometric shapes on top of image
    drawGeometricShapes(ctx, colors, progress, width, height);
  } else {
    drawAnimatedBackground(ctx, colors, progress, width, height);
    drawGeometricShapes(ctx, colors, progress, width, height);
  }

  // ── Particles ──
  updateParticles(particles, width, height, progress);
  drawParticles(ctx, particles, colors.particle);

  // ── Fade in/out ──
  let alpha = 1;
  const fadeIn = 0.12;
  const fadeOut = 0.12;
  if (progress < fadeIn) {
    alpha = easeInOutCubic(progress / fadeIn);
  } else if (progress > 1 - fadeOut) {
    alpha = easeInOutCubic((1 - progress) / fadeOut);
  }

  ctx.save();
  ctx.globalAlpha = alpha;

  // ── Scene indicator (top-left) ──
  if (scene.style !== 'intro' && scene.style !== 'outro') {
    const indY = height * 0.05;
    ctx.fillStyle = colors.accent;
    ctx.globalAlpha = alpha * 0.4;
    ctx.font = `bold ${Math.round(width * 0.022)}px "Pretendard", "Apple SD Gothic Neo", sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(
      `${sceneIndex + 1} / ${totalScenes}`,
      width * 0.06,
      indY
    );

    // Accent line under indicator
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.globalAlpha = alpha * 0.25;
    ctx.beginPath();
    ctx.moveTo(width * 0.06, indY + width * 0.015);
    ctx.lineTo(width * 0.06 + width * 0.06, indY + width * 0.015);
    ctx.stroke();
    ctx.globalAlpha = alpha;
  }

  // ── Highlight badge ──
  if (scene.style === 'highlight') {
    const badgeText = '\u2726 KEY POINT';
    const badgeFontSize = Math.round(width * 0.024);
    ctx.font = `bold ${badgeFontSize}px "Pretendard", "Apple SD Gothic Neo", sans-serif`;
    const bw = ctx.measureText(badgeText).width + width * 0.05;
    const bh = badgeFontSize * 2;
    const bx = width / 2 - bw / 2;
    const by = height * 0.22;

    ctx.save();
    ctx.shadowColor = colors.accent;
    ctx.shadowBlur = 20;
    const bg = ctx.createLinearGradient(bx, by, bx + bw, by);
    bg.addColorStop(0, colors.accent);
    bg.addColorStop(1, colors.accent2);
    ctx.fillStyle = bg;
    drawRoundedRect(ctx, bx, by, bw, bh, bh / 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${badgeFontSize}px "Pretendard", "Apple SD Gothic Neo", sans-serif`;
    ctx.fillText(badgeText, width / 2, by + bh / 2);
  }

  // ── Emoji visual element ──
  const emoji = scene.emoji;
  let emojiOffset = 0;
  if (emoji) {
    const emojiFontSize = Math.round(width * 0.12);
    const emojiY = scene.style === 'intro' ? height * 0.28 : height * 0.3;

    const emojiScale =
      scene.style === 'intro'
        ? easeOutBack(Math.min(progress * 3, 1))
        : 0.9 + 0.1 * Math.sin(progress * Math.PI * 2);

    ctx.save();
    ctx.translate(width / 2, emojiY);
    ctx.scale(emojiScale, emojiScale);
    ctx.font = `${emojiFontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 0, 0);
    ctx.restore();

    emojiOffset = emojiFontSize * 0.9;
  }

  // ── Main text ──
  const baseFontSize =
    scene.style === 'intro'
      ? Math.round(width * 0.07)
      : scene.style === 'highlight'
        ? Math.round(width * 0.058)
        : Math.round(width * 0.05);

  const textEntrance = Math.min(progress * 4, 1);
  const textScale = easeOutBack(textEntrance);
  const textAlpha = easeInOutCubic(textEntrance);

  const fontSize = Math.round(baseFontSize * (0.92 + 0.08 * textScale));

  ctx.font = `bold ${fontSize}px "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const maxTextWidth = width * 0.82;
  const lines = wrapText(ctx, scene.text, maxTextWidth);
  const lineHeight = fontSize * 1.4;

  const baseTextY = emoji
    ? height * 0.35 + emojiOffset * 0.3
    : scene.style === 'intro'
      ? height * 0.42
      : scene.style === 'highlight'
        ? height * 0.48
        : height * 0.44;

  const startY = baseTextY - ((lines.length - 1) * lineHeight) / 2;

  const slideOffset =
    scene.style === 'intro'
      ? (1 - easeInOutCubic(Math.min(progress * 3, 1))) * height * 0.04
      : 0;

  ctx.globalAlpha = alpha * textAlpha;

  lines.forEach((line, i) => {
    drawTextWithEffects(ctx, line, width / 2, startY + i * lineHeight + slideOffset, {
      fontSize,
      color: colors.text,
      accentColor: colors.accent,
      glowColor: colors.glow,
      glow: scene.style === 'highlight' || scene.style === 'intro',
      outline: true,
    });
  });

  ctx.globalAlpha = alpha;

  // ── Narration subtitle ──
  if (scene.narration && scene.style !== 'intro') {
    const subFontSize = Math.round(width * 0.028);
    ctx.font = `${subFontSize}px "Pretendard", "Apple SD Gothic Neo", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const subLines = wrapText(ctx, scene.narration, width * 0.85);
    const subLineHeight = subFontSize * 1.5;
    const visibleLines = subLines.slice(0, 3);
    const subStartY = height * 0.78;

    // Semi-transparent background for readability
    if (visibleLines.length > 0) {
      ctx.save();
      ctx.globalAlpha = alpha * 0.15;
      ctx.fillStyle = '#000000';
      const bgH = visibleLines.length * subLineHeight + subFontSize;
      drawRoundedRect(
        ctx,
        width * 0.05,
        subStartY - subFontSize * 0.8,
        width * 0.9,
        bgH,
        width * 0.015
      );
      ctx.fill();
      ctx.restore();
    }

    ctx.globalAlpha = alpha * 0.55;
    ctx.fillStyle = colors.text;
    visibleLines.forEach((line, i) => {
      ctx.fillText(line, width / 2, subStartY + i * subLineHeight);
    });
    ctx.globalAlpha = alpha;
  }

  // ── Intro decorations ──
  if (scene.style === 'intro') {
    const lineProgress = easeInOutCubic(Math.min(progress * 2.5, 1));
    const accentLineW = width * 0.2 * lineProgress;
    const lineY =
      startY + lines.length * lineHeight + width * 0.02 + slideOffset;

    const lg = ctx.createLinearGradient(
      width / 2 - accentLineW,
      lineY,
      width / 2 + accentLineW,
      lineY
    );
    lg.addColorStop(0, 'transparent');
    lg.addColorStop(0.2, colors.accent);
    lg.addColorStop(0.8, colors.accent2);
    lg.addColorStop(1, 'transparent');

    ctx.strokeStyle = lg;
    ctx.lineWidth = 3;
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(width / 2 - accentLineW, lineY);
    ctx.lineTo(width / 2 + accentLineW, lineY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Intro narration below accent line
    if (scene.narration) {
      const introSubFS = Math.round(width * 0.028);
      ctx.font = `${introSubFS}px "Pretendard", "Apple SD Gothic Neo", sans-serif`;
      ctx.fillStyle = colors.text;
      ctx.globalAlpha =
        alpha * 0.5 * easeInOutCubic(Math.min(progress * 2, 1));
      ctx.textAlign = 'center';
      const introSub = wrapText(ctx, scene.narration, width * 0.7);
      introSub.slice(0, 2).forEach((line, i) => {
        ctx.fillText(
          line,
          width / 2,
          lineY + width * 0.04 + i * introSubFS * 1.5
        );
      });
      ctx.globalAlpha = alpha;
    }
  }

  // ── Outro CTA button ──
  if (scene.style === 'outro') {
    const ctaY = height * 0.65;
    const ctaFS = Math.round(width * 0.03);
    const ctaText = '\uAD6C\uB3C5\uACFC \uC88B\uC544\uC694 \uBD80\uD0C1\uB4DC\uB9BD\uB2C8\uB2E4!';

    ctx.font = `bold ${ctaFS}px "Pretendard", "Apple SD Gothic Neo", sans-serif`;
    const ctaW = ctx.measureText(ctaText).width + width * 0.08;
    const ctaH = ctaFS * 2.5;

    const pulse = 0.95 + 0.05 * Math.sin(progress * Math.PI * 6);

    ctx.save();
    ctx.translate(width / 2, ctaY);
    ctx.scale(pulse, pulse);

    ctx.shadowColor = colors.accent;
    ctx.shadowBlur = 20;

    const cg = ctx.createLinearGradient(-ctaW / 2, 0, ctaW / 2, 0);
    cg.addColorStop(0, colors.accent);
    cg.addColorStop(1, colors.accent2);
    ctx.fillStyle = cg;
    drawRoundedRect(ctx, -ctaW / 2, -ctaH / 2, ctaW, ctaH, ctaH / 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ctaText, 0, 0);

    ctx.restore();
  }

  // ── Watermark ──
  if (config.watermark) {
    ctx.font = `${Math.round(width * 0.02)}px "Pretendard", "Apple SD Gothic Neo", sans-serif`;
    ctx.fillStyle = colors.text;
    ctx.globalAlpha = alpha * 0.2;
    ctx.textAlign = 'right';
    ctx.fillText(config.watermark, width * 0.94, height * 0.95);
  }

  // ── Progress bar ──
  const totalDuration = config.scenes.reduce((s, sc) => s + sc.duration, 0);
  let elapsed = 0;
  for (let i = 0; i < sceneIndex; i++) elapsed += config.scenes[i].duration;
  elapsed += scene.duration * progress;
  const overallProgress = elapsed / totalDuration;

  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, height - 4, width, 4);

  const pg = ctx.createLinearGradient(0, 0, width * overallProgress, 0);
  pg.addColorStop(0, colors.accent);
  pg.addColorStop(1, colors.accent2);
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = pg;
  ctx.fillRect(0, height - 4, width * overallProgress, 4);

  // Glow at progress tip
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.shadowColor = colors.accent;
  ctx.shadowBlur = 8;
  ctx.fillStyle = colors.accent;
  ctx.fillRect(width * overallProgress - 2, height - 4, 4, 4);
  ctx.restore();

  ctx.restore();
}

// ─── Audio Helper ────────────────────────────────────────────

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ─── Main Generator ──────────────────────────────────────────

export async function generateVideo(
  config: VideoConfig,
  onProgress: (percent: number) => void
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = config.width;
  canvas.height = config.height;
  const ctx = canvas.getContext('2d')!;

  const videoStream = canvas.captureStream(config.fps);

  // --- Audio setup ---
  let audioCtx: AudioContext | null = null;
  let audioDest: MediaStreamAudioDestinationNode | null = null;
  const decodedAudio: (AudioBuffer | null)[] = [];
  const hasTTS = config.audioData?.some((a) => a !== null) ?? false;
  const hasBGM = !!config.bgm;
  const hasAnyAudio = hasTTS || hasBGM;

  if (hasAnyAudio) {
    audioCtx = new AudioContext({ sampleRate: 48000 });
    // Fix: ensure AudioContext is not suspended (browser autoplay policy)
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
    audioDest = audioCtx.createMediaStreamDestination();

    // Decode TTS audio
    if (hasTTS && config.audioData) {
      for (const b64 of config.audioData) {
        if (!b64) {
          decodedAudio.push(null);
          continue;
        }
        try {
          const buf = base64ToArrayBuffer(b64);
          const decoded = await audioCtx.decodeAudioData(buf);
          decodedAudio.push(decoded);
        } catch {
          decodedAudio.push(null);
        }
      }
    }

    // Start BGM playback (continuous across all scenes)
    if (hasBGM && config.bgm) {
      const bgmSource = audioCtx.createBufferSource();
      bgmSource.buffer = config.bgm;
      const bgmGain = audioCtx.createGain();
      bgmGain.gain.value = hasTTS ? 0.25 : 0.8;
      bgmSource.connect(bgmGain);
      bgmGain.connect(audioDest);
      bgmSource.start();
    }
  }

  // --- Combine video + audio streams ---
  const tracks: MediaStreamTrack[] = [...videoStream.getVideoTracks()];
  if (audioDest) {
    tracks.push(...audioDest.stream.getAudioTracks());
  }
  const combinedStream = new MediaStream(tracks);

  const mimeType = hasAnyAudio
    ? MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : 'video/webm'
    : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: 5_000_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.start(100);

  const totalDuration = config.scenes.reduce((s, sc) => s + sc.duration, 0);
  const frameDuration = 1000 / config.fps;

  let elapsedTotal = 0;

  // Pre-create particles for each scene
  const sceneParticles: Particle[][] = config.scenes.map(() =>
    createParticles(25, config.width, config.height)
  );

  for (let i = 0; i < config.scenes.length; i++) {
    const scene = config.scenes[i];
    const totalFrames = scene.duration * config.fps;

    // Start TTS audio
    let audioSource: AudioBufferSourceNode | null = null;
    if (audioCtx && audioDest && decodedAudio[i]) {
      audioSource = audioCtx.createBufferSource();
      audioSource.buffer = decodedAudio[i]!;

      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
      const fadeStart = Math.max(0, scene.duration - 0.3);
      gainNode.gain.setValueAtTime(1, audioCtx.currentTime + fadeStart);
      gainNode.gain.linearRampToValueAtTime(
        0,
        audioCtx.currentTime + scene.duration
      );

      audioSource.connect(gainNode);
      gainNode.connect(audioDest);
      audioSource.start();
    }

    // Render frames
    for (let frame = 0; frame < totalFrames; frame++) {
      const frameStart = performance.now();
      const sceneProgress = frame / totalFrames;

      drawScene(
        ctx,
        scene,
        sceneProgress,
        config,
        i,
        config.scenes.length,
        sceneParticles[i]
      );

      elapsedTotal += 1 / config.fps;
      onProgress(Math.min((elapsedTotal / totalDuration) * 100, 99));

      const elapsed = performance.now() - frameStart;
      const waitTime = Math.max(0, frameDuration - elapsed);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    if (audioSource) {
      try {
        audioSource.stop();
      } catch {
        // Already stopped
      }
    }
  }

  await new Promise((r) => setTimeout(r, 300));
  recorder.stop();

  if (audioCtx) {
    await audioCtx.close();
  }

  return new Promise((resolve) => {
    recorder.onstop = () => {
      onProgress(100);
      resolve(new Blob(chunks, { type: mimeType }));
    };
  });
}
