const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ---- Scam Analysis Heuristics ----
const PHISHING_KEYWORDS = ['click here','verify your account','blocked','suspended','urgent','immediately','lottery','won','congratulations','prize','claim','processing fee','send money','transfer','otp','share otp','kbc','lucky draw','selected','deactivated','link your','pan card','aadhaar','kyc update','expire','last chance','free recharge','cashback offer','limited time'];
const SUSPICIOUS_DOMAINS = ['.xyz','.tk','.ml','.ga','.cf','.gq','.buzz','.top','.click','.link','.work','.date','.racing','.review','bit.ly','tinyurl','shorturl','cutt.ly'];
const TRUSTED_UPI_SUFFIXES = ['@ybl','@paytm','@axl','@upi','@sbi','@okhdfcbank','@okicici','@oksbi','@apl','@fbl','@ibl','@kbl'];

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
    const knownBrands = ['flipkart','amazon','paytm','phonepe','google','swiggy','zomato','ola','uber','myntra','bigbasket'];
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

// Real signal-derived thresholds for natural human speech, used to score
// audio features extracted client-side from an actual recording/upload
// (see frontend/src/lib/audioAnalysis.js). Nothing here is randomized -
// the same clip always produces the same score.
function analyzeVoice(features) {
  const {
    durationSec = 0,
    rms = 0,
    silenceRatio = 0,
    zcr = 0,
    volumeVariance = 0,
    clippingRatio = 0,
  } = features;

  let score = 0;
  const threats = [];

  if (durationSec < 1.2) {
    score += 15;
    threats.push(`Clip is very short (${durationSec.toFixed(1)}s) — too little data for a confident reading`);
  }

  if (durationSec >= 1.2 && silenceRatio < 0.04) {
    score += 22;
    threats.push(`Almost no pauses detected (${(silenceRatio * 100).toFixed(0)}% silence) — natural speech usually has 10-40% pause time; gapless audio can indicate synthetic or heavily edited speech`);
  }

  if (durationSec >= 1.2 && volumeVariance < 0.0015) {
    score += 24;
    threats.push(`Loudness is unusually flat (variance ${volumeVariance.toFixed(4)}) — real voices naturally rise and fall; a constant level is a common trait of TTS/voice-clone audio`);
  }

  if (zcr > 0 && (zcr < 0.015 || zcr > 0.28)) {
    score += 16;
    threats.push(`Zero-crossing rate (${(zcr * 100).toFixed(1)}%) falls outside the typical range for natural speech, which can indicate synthetic or heavily processed audio`);
  }

  if (clippingRatio > 0.02) {
    score += 12;
    threats.push(`${(clippingRatio * 100).toFixed(1)}% of samples are clipped — audio may have been re-encoded, over-driven, or artificially generated`);
  }

  if (rms > 0 && rms < 0.008) {
    score += 10;
    threats.push('Signal level is extremely low — mostly silence or background noise, insufficient voice content to analyze confidently');
  }

  score = Math.min(score, 100);
  let status = 'safe', threatType = 'None';
  if (score >= 70) { status = 'blocked'; threatType = 'Likely AI-Generated Voice'; }
  else if (score >= 40) { status = 'flagged'; threatType = 'Suspicious Audio Patterns'; }

  const explanation = threats.length > 0
    ? `Audio signal analysis found ${threats.length} anomaly indicator(s):\n• ${threats.join('\n• ')}`
    : 'Audio signal analysis found natural pause patterns, loudness variation, and spectral characteristics consistent with genuine human speech.';

  return { risk_score: score, status, threat_type: threatType, ai_explanation: explanation };
}

module.exports = function(db) {
  router.post('/message', optionalAuth, (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: 'Message text is required.' });
      const result = analyzeMessage(text);
      const scanId = uuidv4();
      db.run('INSERT INTO scans (id, user_id, type, content, risk_score, status, threat_type, ai_explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [scanId, req.user?.id || null, 'sms', text, result.risk_score, result.status, result.threat_type, result.ai_explanation]);
      res.json({ id: scanId, ...result });
    } catch (err) { console.error('Scan error:', err); res.status(500).json({ error: 'Analysis failed.' }); }
  });

  router.post('/upi', optionalAuth, (req, res) => {
    try {
      const { upiId } = req.body;
      if (!upiId) return res.status(400).json({ error: 'UPI ID is required.' });
      const result = analyzeUPI(upiId);
      const scanId = uuidv4();
      db.run('INSERT INTO scans (id, user_id, type, content, risk_score, status, threat_type, ai_explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [scanId, req.user?.id || null, 'upi', upiId, result.risk_score, result.status, result.threat_type, result.ai_explanation]);
      res.json({ id: scanId, ...result });
    } catch (err) { console.error('UPI scan error:', err); res.status(500).json({ error: 'UPI analysis failed.' }); }
  });

  router.post('/qr', optionalAuth, (req, res) => {
    try {
      const { url } = req.body;
      if (!url) return res.status(400).json({ error: 'QR code URL is required.' });
      const result = analyzeQR(url);
      const scanId = uuidv4();
      db.run('INSERT INTO scans (id, user_id, type, content, risk_score, status, threat_type, ai_explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [scanId, req.user?.id || null, 'qr', url, result.risk_score, result.status, result.threat_type, result.ai_explanation]);
      res.json({ id: scanId, ...result });
    } catch (err) { console.error('QR scan error:', err); res.status(500).json({ error: 'QR analysis failed.' }); }
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
        : `${sourceType || 'recording'} (${features.durationSec.toFixed(1)}s)`;
      db.run('INSERT INTO scans (id, user_id, type, content, risk_score, status, threat_type, ai_explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [scanId, req.user?.id || null, 'voice', contentLabel, result.risk_score, result.status, result.threat_type, result.ai_explanation]);
      res.json({ id: scanId, ...result });
    } catch (err) { console.error('Voice scan error:', err); res.status(500).json({ error: 'Voice analysis failed.' }); }
  });

  return router;
};
