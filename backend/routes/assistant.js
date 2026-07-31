const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const router = express.Router();

const botResponsesByLang = {
  en: {
    emergency: 'To report a cyber crime or financial fraud in India:\n\n1. **Call 1930** — National Cyber Crime Helpline (24/7)\n2. **Visit cybercrime.gov.in** — File an online complaint immediately\n3. **Contact your bank** — Call your bank\'s fraud helpline to freeze compromised accounts\n4. **Save evidence** — Keep screenshots, UTR transaction numbers, and scam messages',
    upi_safety: 'To verify UPI safety:\n\n1. Use our **UPI Guardian** tool to verify VPA handle authenticity\n2. **Never enter your UPI PIN** to receive money — PIN is only required to send or transfer money\n3. Check merchant handles: Official accounts use verified bank handles (@ybl, @oksbi, @paytm)',
    phishing: '**Phishing** is a cyber attack where scammers impersonate legitimate organizations (banks, government) to trick you into revealing sensitive credentials.\n\n• **Signs:** Fake urgency, suspicious URLs (.xyz, .tk), requests for OTP/PIN\n• **Digital Arrest & OTP Scams:** Authorities or banks will NEVER ask for passwords over calls\n• Use our **Scam Analyzer** to scan any suspicious text or SMS',
    qr_scam: '**QR Code Safety Guide**:\n\n1. **Scanning a QR code sends money** — you NEVER scan a QR code to receive money or refunds\n2. Inspect the decoded URL for fake bank domains or `.apk` download links\n3. Test suspicious QR payloads using our **QR Scanner** before making payments',
    voice_privacy: '**Voice Detector & Privacy Policy**:\n\n1. Audio processed in **Voice Detector** is analyzed locally in your browser memory via Web Audio DSP\n2. Acoustic features are evaluated statelessly and temporary recordings are **never permanently stored** on servers\n3. You can reset audio buffers anytime by refreshing the Voice Detector page',
    general_safety: '**SurakshaAI Online Safety Guidelines**:\n\n1. Enable Two-Factor Authentication (2FA) on all financial and social accounts\n2. Never share OTPs, UPI PINs, or password credentials with anyone\n3. Verify unknown calls, emails, and links through our threat protection suite',
    default: 'I\'m your SurakshaAI Security Assistant! I can help you with:\n\n• **Scam Analyzer** — Check suspicious messages & SMS\n• **UPI Guardian** — Verify payment handles & VPAs\n• **QR Scanner** — Scan payment QR codes safely\n• **Voice Detector** — Detect AI voice deepfakes\n• **Security Tips & Privacy** — Learn digital safety best practices\n\nWhat would you like to know?'
  },
  hi: {
    emergency: 'भारत में साइबर अपराध या वित्तीय धोखाधड़ी की रिपोर्ट करने के लिए:\n\n1. **1930 पर कॉल करें** — राष्ट्रीय साइबर अपराध हेल्पलाइन (24/7)\n2. **cybercrime.gov.in पर जाएं** — तुरंत ऑनलाइन शिकायत दर्ज करें\n3. **अपने बैंक से संपर्क करें** — धोखाधड़ी हेल्पलाइन पर कॉल करके खाता ब्लॉक करें\n4. **साक्ष्य सुरक्षित रखें** — स्क्रीनशॉट और यूटीआर नंबर सहेजें',
    upi_safety: 'UPI सुरक्षा निर्देश:\n\n1. हैंडल सत्यापन के लिए **UPI गार्डियन** टूल का उपयोग करें\n2. **पैसे प्राप्त करने के लिए कभी भी UPI PIN दर्ज न करें**\n3. केवल अधिकृत बैंक हैंडल (@ybl, @oksbi, @paytm) पर भरोसा करें',
    phishing: '**फ़िशिंग** एक ऐसा साइबर हमला है जिसमें स्कैमर बैंक या सरकार का रूप धारण करके व्यक्तिगत डेटा चुराते हैं।\n\n• हमारे **स्कैम एनालाइज़र** से किसी भी संदिग्ध संदेश की जाँच करें',
    qr_scam: '**QR कोड सुरक्षा निर्देश**:\n\n1. **QR कोड स्कैन करने से पैसे कटते हैं** — पैसे प्राप्त करने के लिए QR स्कैन न करें\n2. हमारे **QR स्कैनर** से भुगतान से पहले कोड की जांच करें',
    voice_privacy: '**आवाज पहचान और गोपनीयता नीति**:\n\n1. वॉइस डिटेक्टर में ऑडियो का विश्लेषण आपके ब्राउज़र में सुरक्षित रूप से किया जाता है\n2. रिकॉर्डिंग सर्वर पर स्थायी रूप से संग्रहीत नहीं की जाती हैं',
    general_safety: '**सुरक्षाAI ऑनलाइन सुरक्षा दिशानिर्देश**:\n\n1. सभी वित्तीय खातों पर द्वि-स्तरीय प्रमाणीकरण (2FA) सक्षम करें\n2. कभी भी OTP या UPI PIN साझा न करें',
    default: 'मैं आपका सुरक्षाAI सुरक्षा सहायक हूँ! आप मुझसे स्कैम, UPI सुरक्षा या डिजिटल सुरक्षा के बारे में पूछ सकते हैं।'
  },
  gu: {
    emergency: 'ભારતમાં સાયબર ક્રાઇમ અથવા નાણાકીય ફ્રોડની જાણ કરવા માટે:\n\n1. **1930 પર કૉલ કરો** — રાષ્ટ્રીય સાયબર ક્રાઇમ હેલ્પલાઇન (24/7)\n2. **cybercrime.gov.in પર જાઓ** — ઓનલાઇન ફરિયાદ નોંધાવો\n3. **તમારી બેંકનો સંપર્ક કરો** — એકાઉન્ટ તરત ફ્રીજ કરાવો',
    upi_safety: 'UPI સુરક્ષા સૂચનાઓ:\n\n1. અમારા **UPI ગાર્ડિયન** ટૂલનો ઉપયોગ કરો\n2. **પૈસા મેળવવા માટે ક્યારેય UPI PIN દાખલ કરશો નહીં**',
    phishing: '**ફિશિંગ** એ સાયબર હુમલો છે જ્યાં સ્કેમર્સ બેંકો અથવા સરકારનું રૂપ ધારણ કરે છે.\n\nઅમારા **સ્કેમ એનાલાઇઝર** વડે મેસેજ ચકાસો.',
    qr_scam: '**QR કોડ સુરક્ષા સૂચનાઓ**:\n\n1. **QR કોડ સ્કેન કરવાથી પૈસા કપાય છે** — પૈસા મેળવવા માટે QR સ્કેન ન કરો\n2. અમારા **QR સ્કેનર** વડે ચકાસણી કરો',
    voice_privacy: '**વોઇસ ડિટેક્ટર પ્રાઇવસી**:\n\n1. ઓડિયો એનાલિસિસ બ્રાઉઝર મેમરીમાં સુરક્ષિત રીતે થાય છે\n2. રેકોર્ડિંગ્સ કાયમી ધોરણે સર્વર પર સંગ્રહિત થતા નથી',
    general_safety: '**સુરક્ષાAI ઓનલાઇન સુરક્ષા માર્ગદર્શિકા**:\n\n1. ટુ-ફેક્ટર ઓથેન્ટિકેશન (2FA) સક્રિય કરો\n2. ક્યારેય OTP અથવા UPI PIN શેર કરશો નહીં',
    default: 'હું તમારો સુરક્ષાAI સુરક્ષા સહાયક છું! તમે મને સ્કેમ, UPI સુરક્ષા અથવા સુરક્ષા નિયમો વિશે પૂછી શકો છો.'
  }
};

function detectIntent(message) {
  const lower = (message || '').toLowerCase().trim();

  // 1. Emergency Intent: Money already sent, account compromised, active fraud, explicit helpline/report requests
  const emergencyKeywords = [
    'sent money', 'lost money', 'paid a scammer', 'transferred money', 'account hacked', 
    'hacked', 'freeze my account', 'block my account', 'fell for', 'fake website', 'cybercrime helpline', 
    '1930', 'report cybercrime', 'report a scam', 'report fraud', 'money deducted', 
    'पैसे भेज दिए', 'अकाउंट हैक', 'રિપોર્ટ', 'ફ્રોડ થયુ'
  ];
  if (emergencyKeywords.some(kw => lower.includes(kw))) {
    return 'emergency';
  }

  // 2. Voice & Privacy Intent
  const voiceKeywords = ['delete voice', 'delete my voice', 'voice recording', 'audio recording', 'voice privacy', 'recordings', 'privacy'];
  if (voiceKeywords.some(kw => lower.includes(kw))) {
    return 'voice_privacy';
  }

  // 3. UPI Safety Intent
  const upiKeywords = ['upi', 'vpa', 'paytm', 'phonepe', 'gpay', 'यूपीआई'];
  if (upiKeywords.some(kw => lower.includes(kw))) {
    return 'upi_safety';
  }

  // 4. QR Code Education Intent
  const qrKeywords = ['qr', 'scan qr', 'qr scam', 'qr code', 'क्यूआर'];
  if (qrKeywords.some(kw => lower.includes(kw))) {
    return 'qr_scam';
  }

  // 5. Phishing / Digital Arrest / OTP Education Intent
  const phishingKeywords = ['phishing', 'digital arrest', 'otp', 'lottery', 'fake call', 'sms', 'sms link', 'फ़िशिंग', 'ફિશિંગ'];
  if (phishingKeywords.some(kw => lower.includes(kw))) {
    return 'phishing';
  }

  // 6. General Safety Tips Intent
  const safetyKeywords = ['security tips', 'safety tips', 'stay safe', 'online safety', 'cyber safety', 'best practices', 'सुरक्षा टिप्स'];
  if (safetyKeywords.some(kw => lower.includes(kw))) {
    return 'general_safety';
  }

  // 7. Conceptual "What is" / "How" generic questions
  if (lower.includes('what is') || lower.includes('how do') || lower.includes('explain')) {
    if (lower.includes('scam') || lower.includes('fraud')) {
      return 'phishing';
    }
  }

  return 'default';
}

function getBotReply(message, lang = 'en') {
  const dict = botResponsesByLang[lang] || botResponsesByLang.en;
  const intent = detectIntent(message);
  return dict[intent] || dict.default;
}

module.exports = function(db) {
  router.post('/chat', optionalAuth, (req, res) => {
    try {
      const { message, lang } = req.body || {};
      if (!message) return res.status(400).json({ error: 'Message text is required.' });

      const reply = getBotReply(message, lang || 'en');
      res.json({ reply, lang: lang || 'en' });
    } catch (err) {
      console.error('Assistant error:', err);
      res.status(500).json({ error: 'Assistant failed to respond.' });
    }
  });

  return router;
};
