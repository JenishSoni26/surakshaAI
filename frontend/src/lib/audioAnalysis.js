// Extracts real signal-level AND spectral features from an audio Blob using
// the Web Audio API.  No audio is sent to the server — only these numeric
// features — which the backend scores deterministically.
//
// Features extracted:
//   Temporal  – durationSec, rms, silenceRatio, zcr, volumeVariance, clippingRatio
//   Spectral  – spectralCentroid, spectralFlatness, spectralRolloff
//   Pitch     – pitchMean, pitchStd, pitchConfidence  (autocorrelation-based F0)
//   MFCC-like – mfcc (array of 13 mean coefficients)
//   Formants  – formantSpread  (proxy from spectral peak spacing)

export async function extractAudioFeatures(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContextClass();

  let audioBuffer;
  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } finally {
    audioCtx.close();
  }

  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const durationSec = audioBuffer.duration;

  // ── Temporal features (original) ──────────────────────────────────────
  const frameSize = Math.max(1, Math.floor(sampleRate * 0.02)); // ~20ms
  const frameCount = Math.floor(channelData.length / frameSize);
  const silenceThreshold = 0.01;
  const clipThreshold = 0.98;

  let sumRms = 0;
  let silentFrames = 0;
  let zeroCrossings = 0;
  let clippedSamples = 0;
  const frameRmsValues = [];

  for (let f = 0; f < frameCount; f++) {
    const start = f * frameSize;
    const end = start + frameSize;
    let sumSq = 0;
    for (let i = start; i < end - 1; i++) {
      const sample = channelData[i];
      sumSq += sample * sample;
      if (Math.abs(sample) >= clipThreshold) clippedSamples++;
      if ((channelData[i] >= 0) !== (channelData[i + 1] >= 0)) zeroCrossings++;
    }
    const frameRms = Math.sqrt(sumSq / frameSize);
    frameRmsValues.push(frameRms);
    sumRms += frameRms;
    if (frameRms < silenceThreshold) silentFrames++;
  }

  const rms = frameCount > 0 ? sumRms / frameCount : 0;
  const silenceRatio = frameCount > 0 ? silentFrames / frameCount : 0;
  const zcr = channelData.length > 0 ? zeroCrossings / channelData.length : 0;
  const clippingRatio = channelData.length > 0 ? clippedSamples / channelData.length : 0;
  const volumeVariance = frameRmsValues.length > 0
    ? frameRmsValues.reduce((sum, v) => sum + (v - rms) ** 2, 0) / frameRmsValues.length
    : 0;

  // ── Spectral features (FFT-based, computed per frame then averaged) ───
  const fftSize = 1024;
  const halfFFT = fftSize / 2;
  const specFrameCount = Math.floor(channelData.length / fftSize);

  let sumCentroid = 0;
  let sumFlatness = 0;
  let sumRolloff = 0;
  // MFCC accumulators (13 coefficients)
  const mfccSums = new Array(13).fill(0);
  const melFilterCount = 26;

  // Pre-compute mel filterbank edges
  const melFilters = buildMelFilterbank(melFilterCount, fftSize, sampleRate);

  for (let f = 0; f < specFrameCount; f++) {
    const offset = f * fftSize;
    // Windowed frame (Hann window)
    const frame = new Float32Array(fftSize);
    for (let i = 0; i < fftSize; i++) {
      const w = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));
      frame[i] = (channelData[offset + i] || 0) * w;
    }

    // FFT magnitude spectrum
    const spectrum = fftMagnitude(frame);

    // Spectral centroid
    let weightedSum = 0, magSum = 0;
    for (let k = 0; k < halfFFT; k++) {
      const freq = (k * sampleRate) / fftSize;
      weightedSum += freq * spectrum[k];
      magSum += spectrum[k];
    }
    sumCentroid += magSum > 0 ? weightedSum / magSum : 0;

    // Spectral flatness (geometric mean / arithmetic mean of power spectrum)
    let logSum = 0, powerSum = 0;
    for (let k = 0; k < halfFFT; k++) {
      const p = spectrum[k] * spectrum[k] + 1e-12;
      logSum += Math.log(p);
      powerSum += p;
    }
    const geoMean = Math.exp(logSum / halfFFT);
    const ariMean = powerSum / halfFFT;
    sumFlatness += ariMean > 0 ? geoMean / ariMean : 0;

    // Spectral rolloff (frequency below which 85% of energy is concentrated)
    const totalEnergy = powerSum;
    let cumulativeEnergy = 0;
    let rolloffFreq = sampleRate / 2;
    for (let k = 0; k < halfFFT; k++) {
      cumulativeEnergy += spectrum[k] * spectrum[k] + 1e-12;
      if (cumulativeEnergy >= 0.85 * totalEnergy) {
        rolloffFreq = (k * sampleRate) / fftSize;
        break;
      }
    }
    sumRolloff += rolloffFreq;

    // Mel-frequency cepstral coefficients (MFCC)
    const melEnergies = applyMelFilterbank(spectrum, melFilters, halfFFT);
    const logMelEnergies = melEnergies.map(e => Math.log(e + 1e-12));
    const mfccs = dct(logMelEnergies, 13);
    for (let c = 0; c < 13; c++) mfccSums[c] += mfccs[c];
  }

  const validFrames = Math.max(specFrameCount, 1);
  const spectralCentroid = sumCentroid / validFrames;
  const spectralFlatness = sumFlatness / validFrames;
  const spectralRolloff = sumRolloff / validFrames;
  const mfcc = mfccSums.map(s => s / validFrames);

  // ── Pitch tracking (autocorrelation-based F0 estimation) ──────────────
  const pitchResults = estimatePitch(channelData, sampleRate);

  // ── Formant spread (spectral peak spacing proxy) ──────────────────────
  const formantSpread = estimateFormantSpread(channelData, sampleRate, fftSize);

  return {
    durationSec,
    rms,
    silenceRatio,
    zcr,
    volumeVariance,
    clippingRatio,
    sampleRate,
    // New spectral features
    spectralCentroid,
    spectralFlatness,
    spectralRolloff,
    mfcc,
    pitchMean: pitchResults.mean,
    pitchStd: pitchResults.std,
    pitchConfidence: pitchResults.confidence,
    formantSpread,
  };
}


// ── Helper: simple DFT-based magnitude (no external FFT library needed) ──
function fftMagnitude(frame) {
  const N = frame.length;
  const half = N / 2;
  const mag = new Float32Array(half);
  // Use a radix-2 Cooley-Tukey FFT for performance
  const { re, im } = cooleyTukeyFFT(frame);
  for (let k = 0; k < half; k++) {
    mag[k] = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
  }
  return mag;
}

// Radix-2 in-place FFT
function cooleyTukeyFFT(signal) {
  const N = signal.length;
  const re = new Float32Array(N);
  const im = new Float32Array(N);

  // Bit-reversal permutation
  for (let i = 0; i < N; i++) {
    re[bitReverse(i, Math.log2(N))] = signal[i];
  }

  for (let size = 2; size <= N; size *= 2) {
    const halfSize = size / 2;
    const angle = -2 * Math.PI / size;
    for (let i = 0; i < N; i += size) {
      for (let j = 0; j < halfSize; j++) {
        const cos = Math.cos(angle * j);
        const sin = Math.sin(angle * j);
        const tRe = cos * re[i + j + halfSize] - sin * im[i + j + halfSize];
        const tIm = sin * re[i + j + halfSize] + cos * im[i + j + halfSize];
        re[i + j + halfSize] = re[i + j] - tRe;
        im[i + j + halfSize] = im[i + j] - tIm;
        re[i + j] += tRe;
        im[i + j] += tIm;
      }
    }
  }
  return { re, im };
}

function bitReverse(x, bits) {
  let result = 0;
  for (let i = 0; i < bits; i++) {
    result = (result << 1) | (x & 1);
    x >>= 1;
  }
  return result;
}


// ── Mel filterbank ──────────────────────────────────────────────────────
function hzToMel(hz) { return 2595 * Math.log10(1 + hz / 700); }
function melToHz(mel) { return 700 * (Math.pow(10, mel / 2595) - 1); }

function buildMelFilterbank(numFilters, fftSize, sampleRate) {
  const halfFFT = fftSize / 2;
  const melMin = hzToMel(0);
  const melMax = hzToMel(sampleRate / 2);
  const melPoints = [];
  for (let i = 0; i <= numFilters + 1; i++) {
    melPoints.push(melToHz(melMin + (i / (numFilters + 1)) * (melMax - melMin)));
  }
  const bins = melPoints.map(f => Math.floor((fftSize + 1) * f / sampleRate));

  const filters = [];
  for (let m = 1; m <= numFilters; m++) {
    const filter = { start: bins[m - 1], center: bins[m], end: bins[m + 1] };
    filters.push(filter);
  }
  return filters;
}

function applyMelFilterbank(spectrum, filters, halfFFT) {
  return filters.map(f => {
    let energy = 0;
    for (let k = f.start; k < f.center && k < halfFFT; k++) {
      const weight = (k - f.start) / Math.max(f.center - f.start, 1);
      energy += spectrum[k] * weight;
    }
    for (let k = f.center; k < f.end && k < halfFFT; k++) {
      const weight = (f.end - k) / Math.max(f.end - f.center, 1);
      energy += spectrum[k] * weight;
    }
    return energy;
  });
}


// ── DCT (Type-II, first numCoeffs coefficients) ─────────────────────────
function dct(signal, numCoeffs) {
  const N = signal.length;
  const result = new Array(numCoeffs);
  for (let k = 0; k < numCoeffs; k++) {
    let sum = 0;
    for (let n = 0; n < N; n++) {
      sum += signal[n] * Math.cos((Math.PI * k * (2 * n + 1)) / (2 * N));
    }
    result[k] = sum;
  }
  return result;
}


// ── Pitch estimation via autocorrelation ────────────────────────────────
function estimatePitch(channelData, sampleRate) {
  const analysisLen = Math.min(channelData.length, sampleRate * 10); // max 10s
  const windowSize = Math.floor(sampleRate * 0.03); // 30ms windows
  const hopSize = Math.floor(sampleRate * 0.01);    // 10ms hop
  const minLag = Math.floor(sampleRate / 500);      // max F0 = 500 Hz
  const maxLag = Math.floor(sampleRate / 60);       // min F0 = 60 Hz

  const pitches = [];
  for (let start = 0; start + windowSize < analysisLen; start += hopSize) {
    // Skip quiet frames
    let energy = 0;
    for (let i = start; i < start + windowSize; i++) {
      energy += channelData[i] * channelData[i];
    }
    if (Math.sqrt(energy / windowSize) < 0.015) continue;

    // Autocorrelation
    let bestLag = 0, bestCorr = -1;
    let zeroLagCorr = 0;
    for (let i = 0; i < windowSize; i++) {
      zeroLagCorr += channelData[start + i] * channelData[start + i];
    }
    if (zeroLagCorr < 1e-8) continue;

    for (let lag = minLag; lag <= maxLag && start + lag + windowSize <= analysisLen; lag++) {
      let corr = 0;
      for (let i = 0; i < windowSize; i++) {
        corr += channelData[start + i] * channelData[start + i + lag];
      }
      corr /= zeroLagCorr;
      if (corr > bestCorr) {
        bestCorr = corr;
        bestLag = lag;
      }
    }

    if (bestCorr > 0.3 && bestLag > 0) {
      pitches.push(sampleRate / bestLag);
    }
  }

  if (pitches.length === 0) {
    return { mean: 0, std: 0, confidence: 0 };
  }

  const mean = pitches.reduce((a, b) => a + b, 0) / pitches.length;
  const variance = pitches.reduce((sum, p) => sum + (p - mean) ** 2, 0) / pitches.length;
  const std = Math.sqrt(variance);
  const confidence = pitches.length / Math.max(1, Math.floor(analysisLen / (hopSize)));

  return { mean, std, confidence };
}


// ── Formant spread (spectral peak spacing estimate) ─────────────────────
function estimateFormantSpread(channelData, sampleRate, fftSize) {
  const analysisLen = Math.min(channelData.length, fftSize * 20);
  const halfFFT = fftSize / 2;
  const numFrames = Math.floor(analysisLen / fftSize);
  if (numFrames === 0) return 0;

  const avgSpectrum = new Float32Array(halfFFT);
  for (let f = 0; f < numFrames; f++) {
    const offset = f * fftSize;
    const frame = new Float32Array(fftSize);
    for (let i = 0; i < fftSize; i++) {
      const w = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));
      frame[i] = (channelData[offset + i] || 0) * w;
    }
    const spectrum = fftMagnitude(frame);
    for (let k = 0; k < halfFFT; k++) avgSpectrum[k] += spectrum[k];
  }
  for (let k = 0; k < halfFFT; k++) avgSpectrum[k] /= numFrames;

  // Find spectral peaks (local maxima above threshold)
  const threshold = Math.max(...avgSpectrum) * 0.15;
  const peaks = [];
  for (let k = 2; k < halfFFT - 2; k++) {
    if (avgSpectrum[k] > threshold &&
        avgSpectrum[k] > avgSpectrum[k - 1] &&
        avgSpectrum[k] > avgSpectrum[k + 1] &&
        avgSpectrum[k] > avgSpectrum[k - 2] &&
        avgSpectrum[k] > avgSpectrum[k + 2]) {
      peaks.push((k * sampleRate) / fftSize);
    }
  }

  if (peaks.length < 2) return 0;
  // Average spacing between consecutive spectral peaks
  let spacingSum = 0;
  for (let i = 1; i < peaks.length; i++) {
    spacingSum += peaks[i] - peaks[i - 1];
  }
  return spacingSum / (peaks.length - 1);
}
