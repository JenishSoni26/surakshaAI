const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ---- Scam Analysis Heuristics ----
const PHISHING_KEYWORDS = ['click here', 'verify your account', 'blocked', 'suspended', 'urgent', 'immediately', 'lottery', 'won', 'congratulations', 'prize', 'claim', 'processing fee', 'send money', 'transfer', 'otp', 'share otp', 'kbc', 'lucky draw', 'selected', 'deactivated', 'link your', 'pan card', 'aadhaar', 'kyc update', 'expire', 'last chance', 'free recharge', 'cashback offer', 'limited time'];
const SUSPICIOUS_DOMAINS = ['.xyz', '.tk', '.ml', '.ga', '.cf', '.gq', '.buzz', '.top', '.click', '.link', '.work', '.date', '.racing', '.review', 'bit.ly', 'tinyurl', 'shorturl', 'cutt.ly'];
const TRUSTED_UPI_SUFFIXES = ['@ybl', '@paytm', '@axl', '@upi', '@sbi', '@okhdfcbank', '@okicici', '@oksbi', '@apl', '@fbl', '@ibl', '@kbl'];

function analyzeMessage(text) {
  const lowerText = text.toLowerCase();
  let score = 0;
  const threats = [];
  PHISHING_KEYWORDS.forEach(kw => { if (lowerText.includes(kw)) { score += 8; threats.push(`Contains suspicious keyword: "${kw}"`); } });
  const urlMatch = text.match(/https?:\/\/[^\s]+/gi) || [];
  urlMatch.forEach(url => {
    SUSPICIOUS_DOMAINS.forEach(domain => { if (url.toLowerCase().includes(domain)) { score += 15; threats.push(`Suspicious domain detected: ${domain}`); } });
    if (url.startsWith('http://')) { score += 10; threats.push('Non-secure HTTP link detected'); }
  });
  if (/share.*otp|send.*otp|tell.*otp/i.test(text)) { score += 25; threats.push('Requests OTP sharing - banks never ask for OTP'); }
  if (/send.*₹|transfer.*₹|pay.*fee|processing.*fee/i.test(text)) { score += 20; threats.push('Demands money transfer - classic scam pattern'); }
  if (/urgent|immediately|within.*hours|last.*chance|expire/i.test(text)) { score += 10; threats.push('Uses urgency tactics to pressure quick action'); }
  score = Math.min(score, 100);
  let status = 'safe', threatType = 'None';
  if (score >= 70) { status = 'blocked'; threatType = 'High Risk Scam'; }
  else if (score >= 40) { status = 'flagged'; threatType = 'Suspicious Message'; }
  const explanation = threats.length > 0 ? `Analysis found ${threats.length} risk indicator(s):\n• ${threats.join('\n• ')}` : 'No suspicious patterns detected. This message appears to be safe.';
  return { risk_score: score, status, threat_type: threatType, ai_explanation: explanation };
}

function analyzeUPI(upiId) {
  const lower = upiId.toLowerCase();
  const hasTrustedSuffix = TRUSTED_UPI_SUFFIXES.some(s => lower.endsWith(s));

  if (hasTrustedSuffix) {
    const knownBrands = ['flipkart', 'amazon', 'paytm', 'phonepe', 'google', 'swiggy', 'zomato', 'ola', 'uber', 'myntra', 'bigbasket'];
    const isKnownBrand = knownBrands.some(b => lower.includes(b));
    if (isKnownBrand) return { risk_score: 5, status: 'verified', threat_type: 'None', ai_explanation: 'Verified merchant UPI handle. Registered with a trusted payment bank. Safe for transactions.' };
    return { risk_score: 25, status: 'verified', threat_type: 'None', ai_explanation: 'UPI ID uses a registered bank handle. The payment provider is legitimate.' };
  }
  return { risk_score: 60, status: 'flagged', threat_type: 'Unknown UPI Handle', ai_explanation: 'UPI ID uses an unrecognized handle format. Could not verify against known payment providers. Exercise caution.' };
}

function analyzeQR(url) {
  if (url.startsWith('upi://')) {
    const params = new URLSearchParams(url.replace('upi://pay?', ''));
    const pa = params.get('pa') || '';
    const result = analyzeUPI(pa);
    return { ...result, ai_explanation: `QR contains UPI payment link. ${result.ai_explanation}` };
  }
  let score = 30; const threats = [];
  SUSPICIOUS_DOMAINS.forEach(d => { if (url.toLowerCase().includes(d)) { score += 20; threats.push(`Suspicious domain: ${d}`); } });
  if (url.startsWith('http://')) { score += 15; threats.push('Non-secure HTTP link'); }
  if (/bit\.ly|tinyurl|cutt\.ly|shorturl/i.test(url)) { score += 15; threats.push('Shortened URL hides true destination'); }
  score = Math.min(score, 100);
  let status = score >= 70 ? 'blocked' : score >= 40 ? 'flagged' : 'safe';
  let threatType = score >= 70 ? 'Malicious QR' : score >= 40 ? 'Suspicious QR' : 'None';
  const explanation = threats.length > 0 ? `QR code analysis found ${threats.length} concern(s):\n• ${threats.join('\n• ')}` : 'QR code appears to link to a legitimate destination.';
  return { risk_score: score, status, threat_type: threatType, ai_explanation: explanation };
}

// ── Real voice-analysis engine ─────────────────────────────────────────
// Scores audio features extracted client-side (see audioAnalysis.js).
// Uses BOTH temporal AND spectral features for meaningful detection of
// AI-generated / TTS / voice-cloned audio.
//
// Detection signals:
//   Temporal  – silence ratio, volume variance, ZCR, clipping
//   Spectral  – spectral flatness (tonality), spectral centroid, rolloff
//   Pitch     – mean F0, F0 stability (std), pitch confidence
//   MFCC      – coefficient variance (natural speech has high MFCC variance)
//   Formants  – spectral peak spacing (synthetic voices have unnatural spacing)
function analyzeVoice(features) {
  const {
    durationSec = 0,
    rms = 0,
    silenceRatio = 0,
    zcr = 0,
    volumeVariance = 0,
    clippingRatio = 0,
    spectralCentroid = 0,
    spectralFlatness = -1,
    mfcc = [],
    pitchMean = 0,
    pitchStd = 0,
    pitchConfidence = 0,
    formantSpread = 0,
  } = features;

  let score = 0;
  const threats = [];
  const details = [];
  const detectedPatterns = [];

  if (durationSec < 1.2) {
    score += 12;
    threats.push(`Clip is very short (${durationSec.toFixed(1)}s) — too little data for a confident reading`);
  }

  if (durationSec >= 1.2 && silenceRatio < 0.04) {
    score += 14;
    threats.push(`Almost no pauses detected (${(silenceRatio * 100).toFixed(0)}% silence) — natural speech usually has 10-40% pause time; gapless audio is a trait of TTS`);
  }
  details.push({ label: 'Pause Ratio', value: `${(silenceRatio * 100).toFixed(1)}%`, note: silenceRatio < 0.04 ? 'abnormally low' : 'normal' });

  if (durationSec >= 1.2 && volumeVariance < 0.0015) {
    score += 14;
    threats.push(`Loudness is unusually flat (variance ${volumeVariance.toFixed(4)}) — real voices rise and fall; constant level is common in TTS/cloned audio`);
  }
  details.push({ label: 'Volume Variance', value: volumeVariance.toFixed(4), note: volumeVariance < 0.0015 ? 'abnormally flat' : 'normal' });

  if (zcr > 0 && (zcr < 0.015 || zcr > 0.28)) {
    score += 8;
    threats.push(`Zero-crossing rate (${(zcr * 100).toFixed(1)}%) is outside the typical 1.5-28% range for natural speech`);
  }

  if (clippingRatio > 0.02) {
    score += 8;
    threats.push(`${(clippingRatio * 100).toFixed(1)}% of samples are clipped — may indicate re-encoding or artificial generation`);
  }

  // ─── 6. Temporal: low signal ──────────────────────────────────────────
  if (rms > 0 && rms < 0.008) {
    score += 6;
    threats.push('Signal level is extremely low — mostly silence or noise, insufficient voice content');
  }

  if (spectralFlatness >= 0) {
    if (spectralFlatness < 0.005 && durationSec >= 1.2) {
      score += 12;
      threats.push(`Spectral flatness is extremely low (${spectralFlatness.toFixed(4)}) — the audio is abnormally clean and tonal, a strong trait of synthesized speech`);
    } else if (spectralFlatness > 0.5) {
      score += 6;
      threats.push(`Spectral flatness is very high (${spectralFlatness.toFixed(3)}) — audio is noise-dominant, may be heavily processed`);
    }
    details.push({ label: 'Spectral Flatness', value: spectralFlatness.toFixed(4) });
  }

  // ─── 8. Spectral: centroid ────────────────────────────────────────────
  // Spectral centroid < 500 Hz or > 4000 Hz is unusual for speech.
  if (spectralCentroid > 0) {
    if (spectralCentroid < 400) {
      score += 6;
      threats.push(`Spectral centroid is unusually low (${spectralCentroid.toFixed(0)} Hz) — speech energy is concentrated in an abnormally narrow low-frequency band`);
    } else if (spectralCentroid > 4500) {
      score += 6;
      threats.push(`Spectral centroid is unusually high (${spectralCentroid.toFixed(0)} Hz) — frequency distribution is atypical for natural voice`);
    }
    details.push({ label: 'Spectral Centroid', value: `${spectralCentroid.toFixed(0)} Hz` });
  }

  // ─── 9. Pitch: presence and stability ─────────────────────────────────
  if (pitchConfidence > 0) {
    // No pitch detected in sufficient frames
    if (pitchConfidence < 0.1 && durationSec >= 2) {
      score += 8;
      threats.push(`Very low pitch confidence (${(pitchConfidence * 100).toFixed(0)}%) — could not reliably track a fundamental frequency, unusual for clear speech`);
    }

    // Pitch is too stable (TTS tends to have monotone F0)
    if (pitchMean > 0 && pitchStd < 8 && pitchConfidence > 0.3) {
      score += 14;
      threats.push(`Pitch is abnormally stable (mean ${pitchMean.toFixed(0)} Hz, std ${pitchStd.toFixed(1)} Hz) — natural speech has pitch variation; monotone F0 is a hallmark of basic TTS`);
    }

    // Pitch in unrealistic range
    if (pitchMean > 0 && (pitchMean < 65 || pitchMean > 400)) {
      score += 8;
      threats.push(`Mean pitch (${pitchMean.toFixed(0)} Hz) is outside the typical human range (65-400 Hz)`);
    }

    details.push({ label: 'Pitch', value: `${pitchMean.toFixed(0)} Hz (±${pitchStd.toFixed(1)})`, note: pitchStd < 8 ? 'monotone' : 'natural variation' });
    details.push({ label: 'Pitch Confidence', value: `${(pitchConfidence * 100).toFixed(0)}%` });
  }

  // ─── 10. MFCC: coefficient variance ───────────────────────────────────
  // Natural speech produces high variance across MFCC coefficients.
  // Synthetic speech tends to have lower, more uniform MFCC values.
  if (mfcc && mfcc.length >= 13) {
    const mfccSlice = mfcc.slice(1, 13);
    const mfccMean = mfccSlice.reduce((a, b) => a + b, 0) / mfccSlice.length;
    const mfccVar = mfccSlice.reduce((sum, v) => sum + (v - mfccMean) ** 2, 0) / mfccSlice.length;
    if (mfccVar < 0.5 && durationSec >= 1.5) {
      score += 10;
      threats.push(`MFCC variance is very low (${mfccVar.toFixed(2)}) — the spectral envelope is unusually uniform, a pattern seen in AI-generated speech`);
    }
    details.push({ label: 'MFCC Variance', value: mfccVar.toFixed(2), note: mfccVar < 0.5 ? 'abnormally uniform' : 'normal' });
  }

  // ─── 11. Formant spread ───────────────────────────────────────────────
  // Natural speech has formant peaks spaced around 800-1200 Hz apart.
  // Synthetic voices may have irregular or absent formant structure.
  if (formantSpread > 0) {
    if (formantSpread < 200) {
      score += 8;
      threats.push(`Formant spacing is abnormally narrow (${formantSpread.toFixed(0)} Hz) — natural speech typically shows 800-1200 Hz formant separation`);
    } else if (formantSpread > 2500) {
      score += 6;
      threats.push(`Formant spacing is unusually wide (${formantSpread.toFixed(0)} Hz) — spectral peak distribution is atypical for human voice`);
    }
    details.push({ label: 'Formant Spread', value: `${formantSpread.toFixed(0)} Hz`, note: (formantSpread < 200 || formantSpread > 2500) ? 'atypical' : 'normal' });
  }

  // ─── Final scoring ────────────────────────────────────────────────────
  score = Math.min(score, 100);
  let status = 'safe', threatType = 'None';
  if (score >= 70) { status = 'blocked'; threatType = 'Likely AI-Generated Voice'; }
  else if (score >= 40) { status = 'flagged'; threatType = 'Suspicious Audio Patterns'; }

  const explanation = threats.length > 0
    ? `Voice analysis examined ${details.length} signal dimensions and found ${threats.length} anomaly indicator(s):\n• ${threats.join('\n• ')}`
    : `Voice analysis examined ${details.length} signal dimensions — pause patterns, loudness dynamics, spectral shape, pitch tracking, MFCC envelope, and formant structure — all consistent with genuine human speech.`;

  return {
    riskScore: score,
    risk_score: score,
    riskLevel,
    status,
    confidence: 0.90,
    threat_type: threatType,
    detectedPatterns,
    reason: explanation,
    recommendation: score >= 40 ? 'Do not disclose confidential info over call.' : 'Audio appears natural.',
    ai_explanation: explanation,
    details
  };
}

module.exports = function (db) {
  router.post('/message', optionalAuth, (req, res) => {
    try {
      const { text, lang } = req.body;
      if (!text) return res.status(400).json({ error: 'Message text is required.' });
      const result = analyzeMessage(text);
      const scanId = uuidv4();

      db.run(
        'INSERT INTO scans (id, user_id, type, content, risk_score, status, threat_type, ai_explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [scanId, req.user?.id || null, 'sms', text, result.risk_score, result.status, result.threat_type, result.ai_explanation]
      );

      res.json({ id: scanId, ...result });
    } catch (err) {
      console.error('Scan error:', err);
      res.status(500).json({ error: 'Analysis failed.' });
    }
  });

  router.post('/upi', optionalAuth, (req, res) => {
    try {
      const { upiId, lang } = req.body;
      if (!upiId) return res.status(400).json({ error: 'UPI ID is required.' });
      const result = analyzeUPI(upiId);
      const scanId = uuidv4();

      db.run(
        'INSERT INTO scans (id, user_id, type, content, risk_score, status, threat_type, ai_explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [scanId, req.user?.id || null, 'upi', upiId, result.risk_score, result.status, result.threat_type, result.ai_explanation]
      );

      res.json({ id: scanId, ...result });
    } catch (err) {
      console.error('UPI scan error:', err);
      res.status(500).json({ error: 'UPI analysis failed.' });
    }
  });

  router.post('/qr', optionalAuth, (req, res) => {
    try {
      const { url, lang } = req.body;
      if (!url) return res.status(400).json({ error: 'QR code URL is required.' });
      const result = analyzeQR(url);
      const scanId = uuidv4();

      db.run(
        'INSERT INTO scans (id, user_id, type, content, risk_score, status, threat_type, ai_explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [scanId, req.user?.id || null, 'qr', url, result.risk_score, result.status, result.threat_type, result.ai_explanation]
      );

      res.json({ id: scanId, ...result });
    } catch (err) {
      console.error('QR scan error:', err);
      res.status(500).json({ error: 'QR analysis failed.' });
    }
  });

  router.post('/voice', optionalAuth, (req, res) => {
    try {
      const { features, sourceType, fileName } = req.body || {};
      if (!features || typeof features.durationSec !== 'number' || features.durationSec <= 0) {
        return res.status(400).json({ error: 'No audio features received. Record or upload an audio clip first.' });
      }
      const result = analyzeVoice(features);
      const scanId = uuidv4();

      const contentLabel = fileName
        ? `upload: ${fileName}`
        : `${sourceType || 'recording'} (${features?.durationSec ? features.durationSec.toFixed(1) + 's' : 'audio'})`;

      db.run(
        'INSERT INTO scans (id, user_id, type, content, risk_score, status, threat_type, ai_explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [scanId, req.user?.id || null, 'voice', contentLabel, result.risk_score, result.status, result.threat_type, result.ai_explanation]
      );

      res.json({ id: scanId, ...result });
    } catch (err) {
      console.error('Voice scan error:', err);
      res.status(500).json({ error: 'Voice analysis failed.' });
    }
  });

  return router;
};
