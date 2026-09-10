/** localStorage-backed store for YouTube Studio data */

export interface SavedScript {
  id: string;
  topic: string;
  targetAudience: string;
  hookStyle: string;
  format: 'shorts' | 'regular';
  theme: string;
  title: string;
  description: string;
  tags: string[];
  scenes: {
    text: string;
    narration: string;
    duration: number;
    style: string;
    emoji?: string;
    imagePrompt?: string;
  }[];
  createdAt: string;
  videoSize?: number;
  status: 'draft' | 'rendered' | 'uploaded';
}

export interface ScheduledContent {
  id: string;
  scriptId?: string;
  title: string;
  topic: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  status: 'scheduled' | 'generating' | 'rendered' | 'uploaded' | 'failed';
  format: 'shorts' | 'regular';
  targetAudience: string;
  hookStyle: string;
  note?: string;
}

export interface PerformanceData {
  videoId: string;
  title: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  avgWatchDuration: number;
  avgWatchPercentage: number;
  ctr: number;
  subscribersGained: number;
  hookStyle: string;
  targetAudience: string;
}

const KEYS = {
  scripts: 'yt-studio-scripts',
  calendar: 'yt-studio-calendar',
  performance: 'yt-studio-performance',
} as const;

function load<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Scripts (History) ───────────────────────────────────────

export function getScripts(): SavedScript[] {
  return load<SavedScript>(KEYS.scripts).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function saveScript(script: SavedScript) {
  const all = load<SavedScript>(KEYS.scripts);
  const idx = all.findIndex((s) => s.id === script.id);
  if (idx >= 0) all[idx] = script;
  else all.push(script);
  save(KEYS.scripts, all);
}

export function deleteScript(id: string) {
  const all = load<SavedScript>(KEYS.scripts).filter((s) => s.id !== id);
  save(KEYS.scripts, all);
}

// ─── Calendar ─────────────────────────────────────────────────

export function getSchedule(): ScheduledContent[] {
  return load<ScheduledContent>(KEYS.calendar).sort(
    (a, b) => a.scheduledDate.localeCompare(b.scheduledDate)
  );
}

export function saveScheduleItem(item: ScheduledContent) {
  const all = load<ScheduledContent>(KEYS.calendar);
  const idx = all.findIndex((s) => s.id === item.id);
  if (idx >= 0) all[idx] = item;
  else all.push(item);
  save(KEYS.calendar, all);
}

export function deleteScheduleItem(id: string) {
  const all = load<ScheduledContent>(KEYS.calendar).filter((s) => s.id !== id);
  save(KEYS.calendar, all);
}

// ─── Performance (mock until YouTube API connected) ───────────

export function getPerformanceData(): PerformanceData[] {
  return load<PerformanceData>(KEYS.performance);
}

export function savePerformanceData(data: PerformanceData[]) {
  save(KEYS.performance, data);
}

// ─── Helpers ──────────────────────────────────────────────────

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getStats() {
  const scripts = getScripts();
  const schedule = getSchedule();
  const now = new Date().toISOString().slice(0, 10);

  return {
    totalScripts: scripts.length,
    renderedCount: scripts.filter((s) => s.status !== 'draft').length,
    uploadedCount: scripts.filter((s) => s.status === 'uploaded').length,
    scheduledCount: schedule.filter((s) => s.scheduledDate >= now).length,
    hookDistribution: scripts.reduce(
      (acc, s) => {
        acc[s.hookStyle] = (acc[s.hookStyle] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    audienceDistribution: scripts.reduce(
      (acc, s) => {
        if (s.targetAudience) {
          acc[s.targetAudience] = (acc[s.targetAudience] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    ),
    thisWeekCount: scripts.filter((s) => {
      const d = new Date(s.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    }).length,
  };
}
