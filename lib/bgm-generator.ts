/** Generates background music using Web Audio API (no API key needed) */

export type BgmStyle = 'ambient' | 'electronic' | 'chill';

export async function generateBGM(
  durationSeconds: number,
  style: BgmStyle = 'ambient'
): Promise<AudioBuffer> {
  const sampleRate = 48000;
  const length = Math.ceil(sampleRate * durationSeconds);
  const ctx = new OfflineAudioContext(2, length, sampleRate);

  const params = {
    ambient: { baseFreq: 65, filterFreq: 280, volume: 0.13, arpVol: 0 },
    electronic: {
      baseFreq: 82,
      filterFreq: 450,
      volume: 0.1,
      arpVol: 0.04,
    },
    chill: { baseFreq: 55, filterFreq: 220, volume: 0.12, arpVol: 0.02 },
  }[style];

  // ── Master output with fade in/out ──
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, 0);
  master.gain.linearRampToValueAtTime(params.volume, 1.5);
  master.gain.setValueAtTime(
    params.volume,
    Math.max(1.5, durationSeconds - 2)
  );
  master.gain.linearRampToValueAtTime(0, durationSeconds);
  master.connect(ctx.destination);

  // ── Low-pass filter ──
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = params.filterFreq;
  filter.Q.value = 0.7;
  filter.connect(master);

  // ── Pad: root sine ──
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = params.baseFreq;
  const g1 = ctx.createGain();
  g1.gain.value = 0.5;
  osc1.connect(g1);
  g1.connect(filter);
  osc1.start(0);
  osc1.stop(durationSeconds);

  // ── Pad: perfect fifth ──
  const osc2 = ctx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.value = params.baseFreq * 1.5;
  const g2 = ctx.createGain();
  g2.gain.value = 0.25;
  osc2.connect(g2);
  g2.connect(filter);
  osc2.start(0);
  osc2.stop(durationSeconds);

  // ── Pad: octave ──
  const osc3 = ctx.createOscillator();
  osc3.type = 'sine';
  osc3.frequency.value = params.baseFreq * 2;
  const g3 = ctx.createGain();
  g3.gain.value = 0.12;
  osc3.connect(g3);
  g3.connect(filter);
  osc3.start(0);
  osc3.stop(durationSeconds);

  // ── LFO for filter modulation ──
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.07;
  const lfoG = ctx.createGain();
  lfoG.gain.value = params.filterFreq * 0.3;
  lfo.connect(lfoG);
  lfoG.connect(filter.frequency);
  lfo.start(0);
  lfo.stop(durationSeconds);

  // ── Noise layer for atmosphere ──
  const noiseLen = sampleRate * 2;
  const noiseBuf = ctx.createBuffer(1, noiseLen, sampleRate);
  const noiseData = noiseBuf.getChannelData(0);
  for (let i = 0; i < noiseLen; i++) {
    noiseData[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuf;
  noise.loop = true;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.value = 180;

  const noiseG = ctx.createGain();
  noiseG.gain.value = 0.025;

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseG);
  noiseG.connect(master);
  noise.start(0);
  noise.stop(durationSeconds);

  // ── Arpeggio (electronic / chill) ──
  if (params.arpVol > 0) {
    const notes = [
      params.baseFreq * 2,
      params.baseFreq * 2.5,
      params.baseFreq * 3,
      params.baseFreq * 4,
    ];
    const noteLen = style === 'electronic' ? 0.25 : 0.5;

    const arpFilter = ctx.createBiquadFilter();
    arpFilter.type = 'lowpass';
    arpFilter.frequency.value = params.filterFreq * 1.5;
    arpFilter.connect(master);

    for (let t = 2; t < durationSeconds - 2; t += noteLen) {
      const idx = Math.floor(t / noteLen) % notes.length;
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = notes[idx];
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(params.arpVol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + noteLen * 0.85);
      o.connect(g);
      g.connect(arpFilter);
      o.start(t);
      o.stop(t + noteLen);
    }
  }

  return ctx.startRendering();
}
