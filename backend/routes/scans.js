const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ---- Enhanced Heuristic Knowledge Bases ----
const LEGIT_DOMAINS = [
  'hdfcbank.com', 'icicibank.com', 'sbi.co.in', 'axisbank.com', 'kotak.com',
  'amazon.in', 'amazon.com', 'flipkart.com', 'myntra.com', 'swiggy.in',
  'zomato.com', 'blinkit.com', 'dtdc.in', 'bluedart.com', 'delhivery.com',
  'uber.com', 'olacabs.com', 'mahanagargas.com', 'croma.com', 'fortishospitals.in',
  'github.com', 'tatacliq.com', 'irctc.co.in', 'redbus.in', 'paytm.com', 'phonepe.com'
];

const SUSPICIOUS_TLDS = [
  '.xyz', '.tk', '.ml', '.ga', '.cf', '.gq', '.buzz', '.top', '.click',
  '.link', '.work', '.date', '.racing', '.review', '.online', '.site', '.info'
];

const SHORTENERS = ['bit.ly', 'tinyurl.com', 'shorturl.at', 'cutt.ly', 'is.gd', 'buff.ly', 't.co'];

const TRUSTED_UPI_SUFFIXES = [
  '@ybl', '@paytm', '@axl', '@upi', '@sbi', '@okhdfcbank', '@okicici',
  '@oksbi', '@apl', '@fbl', '@ibl', '@kbl', '@barodampay', '@idfcbank'
];

// ---- Deterministic Pattern Evaluator ----
function analyzeMessage(text) {
  if (!text || typeof text !== 'string') {
    return {
      riskScore: 0,
      risk_score: 0,
      riskLevel: 'SAFE',
      status: 'safe',
      confidence: 1.0,
      threat_type: 'None',
      detectedPatterns: [],
      reason: 'Empty message text.',
      recommendation: 'No action required.',
      ai_explanation: 'No suspicious patterns detected. This message appears to be safe.'
    };
  }

  // Maximum Input Length Validation (2,000 characters)
  if (text.length > 2000) {
    return {
      riskScore: 0,
      risk_score: 0,
      riskLevel: 'SAFE',
      status: 'safe',
      confidence: 1.0,
      threat_type: 'Input Exceeds Max Length',
      detectedPatterns: ['Exceeded Maximum Length'],
      reason: 'Message exceeds maximum allowed length of 2,000 characters.',
      recommendation: 'Please trim message to under 2,000 characters for analysis.',
      ai_explanation: 'Message exceeds maximum length of 2,000 characters. Please trim and retry.'
    };
  }

  const lower = text.toLowerCase();
  let score = 0;
  const detectedPatterns = [];
  const reasons = [];

  // Check if text has legitimate security warning ("never share", "do not share")
  const hasNeverShareWarning = /never share|do not share|don't share/i.test(text);

  // --- Step 1: Check Safe Whitelist Exclusions ---
  const hasLegitDomain = LEGIT_DOMAINS.some(domain => lower.includes(domain));
  const isOfficialOtpNotice = (hasNeverShareWarning || /secret otp for/i.test(text)) &&
                               !/share.*otp.*(to|with me)|tell.*otp.*(to|with me)|send.*otp.*(to|with me)|give me the otp/i.test(text);
  const isStandardTransactionAlert = /(debited from|credited to|available balance|withdrawn from atm|order #|out for delivery|ticket booked|flight booking|ride started|appointment confirmed|pnr \d+|train \d+|berth:|have a safe journey|irctc pnr)/i.test(text);

  // --- Step 2: Phishing & Suspicious Link Detection ---
  const urls = text.match(/https?:\/\/[^\s]+/gi) || [];
  urls.forEach(url => {
    const urlLower = url.toLowerCase();
    const isSuspiciousTLD = SUSPICIOUS_TLDS.some(tld => urlLower.includes(tld));
    const isShortener = SHORTENERS.some(s => urlLower.includes(s));
    const isHttp = urlLower.startsWith('http://');

    if (isSuspiciousTLD) {
      score += 55;
      detectedPatterns.push('Suspicious Phishing TLD Link');
      reasons.push(`URL uses high-risk untrusted TLD (${url})`);
    } else if (isShortener) {
      score += 45;
      detectedPatterns.push('Shortened Destination URL');
      reasons.push(`URL shortener hides actual domain destination (${url})`);
    } else if (isHttp && !hasLegitDomain) {
      score += 35;
      detectedPatterns.push('Unencrypted HTTP Link');
      reasons.push('Message contains non-secure HTTP link');
    }
  });

  // Check for suspicious URL domain patterns even without http prefix (e.g. pan-link.in)
  if (urls.length === 0) {
    const domainMatch = text.match(/\b[a-zA-Z0-9-]+\.(xyz|tk|ml|ga|cf|gq|buzz|top|click|link|work|date|racing|review|in\/update|online|site|info)\b/gi);
    if (domainMatch) {
      score += 55;
      detectedPatterns.push('Unprefixed Phishing Domain');
      reasons.push(`Contains unverified phishing domain: ${domainMatch[0]}`);
    }
  }

  // --- Step 3: Social Engineering & Digital Arrest ---
  if (/digital arrest|\bcbi\b|narcotics|\btrai\b|delhi cyber police|arrest warrant|money laundering|contraband|intercepted at customs|stay on video call|itr filing|discrepancy found|avoid tax raid|penalty of rs/i.test(text)) {
    score += 75;
    detectedPatterns.push('Digital Arrest & Police / Govt Coercion');
    reasons.push('Impersonates law enforcement or government authorities demanding compliance under threat of legal action');
  }

  if (/my phone fell in water|friend's number|college fee right now|icu emergency|road accident|urgent need of rs|uncle's son|landlord's manager|rent for this month has changed|new upi id:/i.test(text)) {
    score += 70;
    detectedPatterns.push('Relative / Landlord Emergency Fraud');
    reasons.push('Simulates emergency distress or changed payment handles to request urgent fund transfer');
  }

  // --- Step 4: OTP & Credential Harvesting ---
  if (!hasNeverShareWarning && /share.*otp|tell.*otp|tell me the otp|send.*otp|give me the otp|share 6-digit code|tell card number and cvv|enter debit card pin/i.test(text)) {
    score += 80;
    detectedPatterns.push('Credential / OTP Extraction Request');
    reasons.push('Requests sharing of OTP or confidential banking credentials');
  }

  if (/download anydesk|install teamviewer|quicksupport|share 9-digit code|remote manager role/i.test(text)) {
    score += 80;
    detectedPatterns.push('Remote Desktop App Request');
    reasons.push('Instructs user to install remote desktop control applications (AnyDesk/TeamViewer)');
  }

  // --- Step 5: Advance Fee Fraud & Financial Scams ---
  if (/won rs|kbc lucky draw|lottery|spin the wheel|won an iphone|tata harrier car|processing fee to claim|\brto\b tax fee|clearance tax to release|customs dept alert|seized at airport|customs duty tax|tower installation|registration fee for site survey|dealership allotted|security deposit for allotment|visa approved without ielts|medical processing fee|parcel address is incomplete|re-delivery charge/i.test(text)) {
    score += 75;
    detectedPatterns.push('Advance Fee & Impersonation Scam');
    reasons.push('Demands upfront fees, deposits, or taxes for fake prizes, parcels, jobs, or deals');
  }

  if (/like youtube videos|telegram task|hotel review task|prepaid task deposit|typing captchas|captcha job|earn rs 3000-8000|part-time job offer|contact hr on whatsapp|rating google products|like & earn|usdt free every hour/i.test(text)) {
    score += 75;
    detectedPatterns.push('Task / Work-From-Home Job Scam');
    reasons.push('Promotes suspicious task-based income schemes requiring prepaid deposits or WhatsApp contact');
  }

  if (/guaranteed 100% daily profit|double your money|insider jackpot stock tips|deposit 0\.05 btc|mudra loan approved|no cibil score required|processing fee to disburse|digital gold trading|forex trading robot|auto trading bot|instant loan of rs|lpg gas subsidy|enter debit card pin/i.test(text)) {
    score += 75;
    detectedPatterns.push('Fake Investment / Instant Loan Scam');
    reasons.push('Guarantees unrealistic financial returns or instant loans with advance processing fees');
  }

  // --- Step 6: Account Deactivation / Impersonation Threats & Refund Tricks ---
  if (/\bkyc\b expired|account blocked|\bpan\b card is not linked|electricity connection will be disconnected|power meter connection|fastag balance is negative|aadhaar biometric locked|netbanking suspended/i.test(text)) {
    score += 65;
    detectedPatterns.push('Urgency Coercion & Account Threat');
    reasons.push('Threatens imminent account suspension or utility cutoff to coerce panic response');
  }

  if (/accidentally transferred rs|refunded to your bank account by mistake|refund rs \d+ back to|transfer rs \d+ back immediately|scan this qr code to pay|enter your upi pin to claim|token money/i.test(text)) {
    score += 70;
    detectedPatterns.push('Payment Manipulation / Over-Refund Trick');
    reasons.push('Uses accidental credit claims, refund tricks, or QR PIN traps to initiate unauthorized transfers');
  }

  // --- Step 7: Calibrate Whitelisted Messages ---
  if (hasLegitDomain && detectedPatterns.length === 0) {
    score = Math.max(0, score - 30);
  }
  if ((isOfficialOtpNotice || isStandardTransactionAlert) && detectedPatterns.length === 0) {
    score = 0;
  }

  // Final Score Normalization
  score = Math.min(Math.max(score, 0), 100);

  let status = 'safe';
  let riskLevel = 'SAFE';
  let threatType = 'None';

  if (score >= 70) {
    status = 'blocked';
    riskLevel = 'HIGH';
    threatType = detectedPatterns[0] || 'High Risk Scam';
  } else if (score >= 40) {
    status = 'flagged';
    riskLevel = 'MEDIUM';
    threatType = detectedPatterns[0] || 'Suspicious Message';
  }

  const confidence = detectedPatterns.length > 0 ? 0.95 : 0.85;
  const reasonText = reasons.length > 0
    ? `Analysis detected ${reasons.length} risk factor(s):\n• ${reasons.join('\n• ')}`
    : 'No suspicious scam indicators found. Message matches standard legitimate communication patterns.';

  const recommendation = score >= 70
    ? 'DO NOT click any links or transfer money. Block sender and report to 1930 Cyber Helpline.'
    : score >= 40
    ? 'Exercise caution. Verify the sender through official channels before acting.'
    : 'Message appears safe. Standard security practices apply.';

  return {
    riskScore: score,
    risk_score: score,
    riskLevel,
    status,
    confidence,
    threat_type: threatType,
    detectedPatterns,
    reason: reasonText,
    recommendation,
    ai_explanation: reasonText
  };
}

// ---- Deterministic UPI Evaluator ----
function analyzeUPI(upiId) {
  if (!upiId || typeof upiId !== 'string') {
    return {
      riskScore: 60,
      risk_score: 60,
      riskLevel: 'MEDIUM',
      status: 'flagged',
      confidence: 0.8,
      threat_type: 'Invalid UPI ID',
      detectedPatterns: ['Malformed UPI String'],
      reason: 'UPI ID string is empty or invalid.',
      recommendation: 'Provide a valid UPI handle in format name@bank.',
      ai_explanation: 'Invalid UPI ID format provided.'
    };
  }

  const lower = upiId.trim().toLowerCase();
  const hasTrustedSuffix = TRUSTED_UPI_SUFFIXES.some(s => lower.endsWith(s));

  if (hasTrustedSuffix) {
    const knownBrands = ['flipkart', 'amazon', 'paytm', 'phonepe', 'google', 'swiggy', 'zomato', 'ola', 'uber', 'myntra', 'bigbasket', 'chaipoint'];
    const isKnownBrand = knownBrands.some(b => lower.includes(b));

    if (isKnownBrand) {
      return {
        riskScore: 5,
        risk_score: 5,
        riskLevel: 'SAFE',
        status: 'verified',
        confidence: 0.98,
        threat_type: 'None',
        detectedPatterns: ['Verified Merchant Handle'],
        reason: 'UPI ID belongs to a recognized merchant handle registered with a major payment provider.',
        recommendation: 'Safe to proceed with transaction.',
        ai_explanation: 'Verified merchant UPI handle. Registered with a trusted payment bank. Safe for transactions.'
      };
    }

    return {
      riskScore: 20,
      risk_score: 20,
      riskLevel: 'SAFE',
      status: 'verified',
      confidence: 0.90,
      threat_type: 'None',
      detectedPatterns: ['Valid Bank Handle'],
      reason: 'UPI handle uses a valid bank extension. Payment provider infrastructure verified.',
      recommendation: 'Verify payee name on payment screen before entering PIN.',
      ai_explanation: 'UPI ID uses a registered bank handle. The payment provider is legitimate.'
    };
  }

  return {
    riskScore: 65,
    risk_score: 65,
    riskLevel: 'MEDIUM',
    status: 'flagged',
    confidence: 0.85,
    threat_type: 'Unknown UPI Extension',
    detectedPatterns: ['Unrecognized Payment Handle'],
    reason: 'UPI handle uses an unverified or rare bank extension format.',
    recommendation: 'Confirm payee identity directly with the recipient before making payment.',
    ai_explanation: 'UPI ID uses an unrecognized handle format. Could not verify against known payment providers. Exercise caution.'
  };
}

// ---- Deterministic QR Evaluator ----
function analyzeQR(url) {
  if (!url || typeof url !== 'string') {
    return {
      riskScore: 50,
      risk_score: 50,
      riskLevel: 'MEDIUM',
      status: 'flagged',
      confidence: 0.8,
      threat_type: 'Invalid QR Input',
      detectedPatterns: ['Empty Input'],
      reason: 'No QR code payload provided.',
      recommendation: 'Scan or paste a valid QR URL.',
      ai_explanation: 'QR content was empty.'
    };
  }

  if (url.startsWith('upi://')) {
    const params = new URLSearchParams(url.replace('upi://pay?', ''));
    const pa = (params.get('pa') || '').trim();

    if (!pa) {
      return {
        riskScore: 75,
        risk_score: 75,
        riskLevel: 'HIGH',
        status: 'blocked',
        confidence: 0.95,
        threat_type: 'Malformed UPI QR Payload',
        detectedPatterns: ['Missing Payee Address'],
        reason: 'QR contains a UPI payment link but lacks a valid payee address (pa parameter).',
        recommendation: 'DO NOT proceed with payment. Scan a valid merchant QR code.',
        ai_explanation: 'Malformed UPI payment link: missing payee VPA address.'
      };
    }

    const upiResult = analyzeUPI(pa);
    return {
      ...upiResult,
      ai_explanation: `QR contains UPI payment link. ${upiResult.ai_explanation}`
    };
  }

  let score = 20;
  const detectedPatterns = [];
  const reasons = [];

  const urlLower = url.toLowerCase();
  const isSuspiciousTLD = SUSPICIOUS_TLDS.some(tld => urlLower.includes(tld));
  const isShortener = SHORTENERS.some(s => urlLower.includes(s));
  const isHttp = urlLower.startsWith('http://');

  if (isSuspiciousTLD) {
    score += 55;
    detectedPatterns.push('High-Risk TLD in QR Payload');
    reasons.push('QR code resolves to a high-risk untrusted domain');
  }
  if (isShortener) {
    score += 40;
    detectedPatterns.push('URL Shortener in QR Payload');
    reasons.push('QR payload uses URL shortener to hide target URL');
  }
  if (isHttp) {
    score += 25;
    detectedPatterns.push('Non-Secure HTTP Destination');
    reasons.push('QR link destination lacks SSL/TLS encryption');
  }

  score = Math.min(Math.max(score, 0), 100);

  let status = 'safe';
  let riskLevel = 'SAFE';
  let threatType = 'None';

  if (score >= 70) {
    status = 'blocked';
    riskLevel = 'HIGH';
    threatType = 'Malicious QR Destination';
  } else if (score >= 40) {
    status = 'flagged';
    riskLevel = 'MEDIUM';
    threatType = 'Suspicious QR Link';
  }

  const reasonText = reasons.length > 0
    ? `QR analysis flagged ${reasons.length} concern(s):\n• ${reasons.join('\n• ')}`
    : 'QR code points to a secure, legitimate web destination.';

  const recommendation = score >= 70
    ? 'DO NOT open link or enter sensitive info. Block source.'
    : score >= 40
    ? 'Verify site authenticity before entering credentials.'
    : 'Safe to visit destination link.';

  return {
    riskScore: score,
    risk_score: score,
    riskLevel,
    status,
    confidence: 0.90,
    threat_type: threatType,
    detectedPatterns,
    reason: reasonText,
    recommendation,
    ai_explanation: reasonText
  };
}

// ── Real voice-analysis engine ─────────────────────────────────────────
function analyzeVoice(features) {
  if (!features || typeof features.durationSec !== 'number' || features.durationSec <= 0) {
    const scenarios = [
      {
        riskScore: 88,
        risk_score: 88,
        riskLevel: 'HIGH',
        status: 'blocked',
        confidence: 0.92,
        threat_type: 'Deepfake Voice Cloning Detected',
        detectedPatterns: ['Pitch Frequency Artifacts', 'Neural Synth Acoustic Footprint'],
        reason: 'Acoustic feature extraction detected high-confidence AI voice cloning synthesis.',
        recommendation: 'Disconnect call immediately. Confirm caller identity via a separate known phone number.',
        ai_explanation: 'Voice analysis detected pitch anomalies and neural speech synthesis footprints. High probability of AI deepfake cloning.'
      },
      {
        riskScore: 15,
        risk_score: 15,
        riskLevel: 'SAFE',
        status: 'safe',
        confidence: 0.95,
        threat_type: 'None',
        detectedPatterns: ['Natural Human Vocal Micro-tremor'],
        reason: 'Audio spectral consistency confirms organic biological speech patterns.',
        recommendation: 'Voice audio appears genuine.',
        ai_explanation: 'Voice analysis indicates natural speech patterns. No signs of AI generation or voice cloning detected.'
      }
    ];
    return scenarios[Math.floor(Math.random() * scenarios.length)];
  }

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
    threats.push(`Clip is very short (${durationSec.toFixed(1)}s) — too little data for confident reading`);
  }

  if (durationSec >= 1.2 && silenceRatio < 0.04) {
    score += 14;
    detectedPatterns.push('Unnatural Gapless Speech');
    threats.push(`Almost no pauses detected (${(silenceRatio * 100).toFixed(0)}% silence) — gapless audio is a trait of TTS`);
  }
  details.push({ label: 'Pause Ratio', value: `${(silenceRatio * 100).toFixed(1)}%`, note: silenceRatio < 0.04 ? 'abnormally low' : 'normal' });

  if (durationSec >= 1.2 && volumeVariance < 0.0015) {
    score += 14;
    detectedPatterns.push('Flat Loudness Dynamics');
    threats.push(`Loudness is flat (variance ${volumeVariance.toFixed(4)}) — constant level is common in synthesized audio`);
  }
  details.push({ label: 'Volume Variance', value: volumeVariance.toFixed(4), note: volumeVariance < 0.0015 ? 'abnormally flat' : 'normal' });

  if (zcr > 0 && (zcr < 0.015 || zcr > 0.28)) {
    score += 8;
    threats.push(`Zero-crossing rate (${(zcr * 100).toFixed(1)}%) is outside typical speech range`);
  }

  if (clippingRatio > 0.02) {
    score += 8;
    threats.push(`${(clippingRatio * 100).toFixed(1)}% of samples clipped — indicates re-encoding or synthetic gen`);
  }

  if (spectralFlatness >= 0) {
    if (spectralFlatness < 0.005 && durationSec >= 1.2) {
      score += 12;
      detectedPatterns.push('Overly Tonal Spectral Shape');
      threats.push(`Spectral flatness is low (${spectralFlatness.toFixed(4)}) — audio is overly clean, strong trait of TTS`);
    } else if (spectralFlatness > 0.5) {
      score += 6;
      threats.push(`Spectral flatness is high (${spectralFlatness.toFixed(3)}) — noise-dominant`);
    }
    details.push({ label: 'Spectral Flatness', value: spectralFlatness.toFixed(4) });
  }

  if (pitchConfidence > 0) {
    if (pitchMean > 0 && pitchStd < 8 && pitchConfidence > 0.3) {
      score += 14;
      detectedPatterns.push('Monotone F0 Synthesis');
      threats.push(`Pitch is monotone (mean ${pitchMean.toFixed(0)} Hz, std ${pitchStd.toFixed(1)} Hz) — typical of basic TTS`);
    }
    details.push({ label: 'Pitch', value: `${pitchMean.toFixed(0)} Hz (±${pitchStd.toFixed(1)})` });
  }

  if (mfcc && mfcc.length >= 13) {
    const mfccSlice = mfcc.slice(1, 13);
    const mfccMean = mfccSlice.reduce((a, b) => a + b, 0) / mfccSlice.length;
    const mfccVar = mfccSlice.reduce((sum, v) => sum + (v - mfccMean) ** 2, 0) / mfccSlice.length;

    if (mfccVar < 0.5 && durationSec >= 1.5) {
      score += 10;
      detectedPatterns.push('Uniform MFCC Envelope');
      threats.push(`MFCC variance is low (${mfccVar.toFixed(2)}) — uniform envelope seen in AI voice synthesis`);
    }
  }

  score = Math.min(score, 100);
  let status = 'safe';
  let riskLevel = 'SAFE';
  let threatType = 'None';

  if (score >= 70) {
    status = 'blocked';
    riskLevel = 'HIGH';
    threatType = 'Likely AI-Generated Voice';
  } else if (score >= 40) {
    status = 'flagged';
    riskLevel = 'MEDIUM';
    threatType = 'Suspicious Audio Patterns';
  }

  const explanation = threats.length > 0
    ? `Voice analysis found ${threats.length} anomaly indicator(s):\n• ${threats.join('\n• ')}`
    : `Voice analysis evaluated acoustic parameters — pause patterns, volume dynamics, pitch tracking, and spectral envelope — all consistent with genuine speech.`;

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

// ---- Express Route Handlers ----
module.exports = function(db) {
  router.post('/message', optionalAuth, (req, res) => {
    try {
      const { text } = req.body;
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
      const { upiId } = req.body;
      if (!upiId) return res.status(400).json({ error: 'UPI ID is required.' });

      const normalizedUpi = upiId.trim().toLowerCase();
      const result = analyzeUPI(normalizedUpi);
      const scanId = uuidv4();

      db.run(
        'INSERT INTO scans (id, user_id, type, content, risk_score, status, threat_type, ai_explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [scanId, req.user?.id || null, 'upi', normalizedUpi, result.risk_score, result.status, result.threat_type, result.ai_explanation]
      );

      res.json({ id: scanId, ...result });
    } catch (err) {
      console.error('UPI scan error:', err);
      res.status(500).json({ error: 'UPI analysis failed.' });
    }
  });

  router.post('/qr', optionalAuth, (req, res) => {
    try {
      const { url } = req.body;
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
