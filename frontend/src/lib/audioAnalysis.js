// Extracts real signal-level features from an audio Blob using the Web Audio
// API. No audio is sent to the server - only these small numeric features -
// which the backend scores deterministically (see backend/routes/scans.js).
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

  const frameSize = Math.max(1, Math.floor(sampleRate * 0.02)); // ~20ms frames
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

  return { durationSec, rms, silenceRatio, zcr, volumeVariance, clippingRatio, sampleRate };
}
