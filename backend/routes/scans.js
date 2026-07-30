const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ── Multi-language translation templates ──────────────────────────────────
const TRANSLATIONS = {
  en: {
    analysisFound: (count) => `Analysis found ${count} risk indicator(s):`,
    noSuspicious: 'No suspicious patterns detected. This message appears to be safe.',
    verifiedMerchant: 'Verified merchant UPI handle. Registered with a trusted payment bank. Safe for transactions.',
    verifiedBank: 'UPI ID uses a registered bank handle. The payment provider is legitimate.',
    unknownUPI: 'UPI ID uses an unrecognized handle format. Could not verify against known payment providers. Exercise caution.',
    qrContainsUPI: 'QR contains UPI payment link.',
    qrConcerns: (count) => `QR code analysis found ${count} concern(s):`,
    qrSafe: 'QR code appears to link to a legitimate destination.',
    voiceAnalyzed: (dims, count) => `Voice analysis examined ${dims} signal dimensions and found ${count} anomaly indicator(s):`,
    voiceSafe: (dims) => `Voice analysis examined ${dims} signal dimensions — pause patterns, loudness dynamics, spectral shape, pitch tracking, MFCC envelope, and formant structure — all consistent with genuine human speech.`,
    keyword: (kw) => `Contains suspicious keyword/pattern: "${kw}"`,
    suspiciousDomain: (d) => `Suspicious domain detected: ${d}`,
    httpLink: 'Non-secure HTTP link detected',
    otpRequest: 'Requests OTP / PIN sharing - legitimate banks & platforms NEVER ask for your OTP',
    moneyDemand: 'Demands money transfer, fee payment, or delivery charge - classic scam tactic',
    urgency: 'Uses strict time pressure / urgency tactics to force a quick response',
    shortenedURL: 'Shortened URL hides true destination',
    blockThreat: 'Threatens account, card, SIM, or app closure/blocking',
    parcelScam: 'Fake parcel / delivery fee scam - asking money/link click to release stuck package',
    apkThreat: 'Asks to download or install an untrusted APK file - high malware risk',
    remoteAppThreat: 'Prompts installation of remote control app (AnyDesk/TeamViewer/RustDesk) - extreme risk of account takeover',
    utilityBillScam: 'Threatens immediate power/electricity disconnection - known utility scam tactic',
    digitalArrest: 'Claims legal/police action or digital arrest regarding parcel/CBI - law enforcement scam',
    jobScam: 'Promises daily income for completing video likes or Telegram tasks - task scam pattern',
    clipShort: (dur) => `Clip is very short (${dur}s) — too little data for a confident reading`,
    noPauses: (ratio) => `Almost no pauses detected (${ratio}% silence) — natural speech usually has 10-40% pause time; gapless audio is a trait of TTS`,
    flatLoudness: (v) => `Loudness is unusually flat (variance ${v}) — real voices rise and fall; constant level is common in TTS/cloned audio`,
    abnormalZCR: (v) => `Zero-crossing rate (${v}%) is outside the typical 1.5-28% range for natural speech`,
    clipping: (v) => `${v}% of samples are clipped — may indicate re-encoding or artificial generation`,
    lowSignal: 'Signal level is extremely low — mostly silence or noise, insufficient voice content',
    spectralFlat: (v) => `Spectral flatness is extremely low (${v}) — the audio is abnormally clean and tonal, a strong trait of synthesized speech`,
    spectralHigh: (v) => `Spectral flatness is very high (${v}) — audio is noise-dominant, may be heavily processed`,
    centroidLow: (v) => `Spectral centroid is unusually low (${v} Hz) — speech energy is concentrated in an abnormally narrow low-frequency band`,
    centroidHigh: (v) => `Spectral centroid is unusually high (${v} Hz) — frequency distribution is atypical for natural voice`,
    lowPitchConf: (v) => `Very low pitch confidence (${v}%) — could not reliably track a fundamental frequency, unusual for clear speech`,
    stablePitch: (mean, std) => `Pitch is abnormally stable (mean ${mean} Hz, std ${std} Hz) — natural speech has pitch variation; monotone F0 is a hallmark of basic TTS`,
    pitchOutOfRange: (v) => `Mean pitch (${v} Hz) is outside the typical human range (65-400 Hz)`,
    lowMFCC: (v) => `MFCC variance is very low (${v}) — the spectral envelope is unusually uniform, a pattern seen in AI-generated speech`,
    formantNarrow: (v) => `Formant spacing is abnormally narrow (${v} Hz) — natural speech typically shows 800-1200 Hz formant separation`,
    formantWide: (v) => `Formant spacing is unusually wide (${v} Hz) — spectral peak distribution is atypical for human voice`,
  },
  hi: {
    analysisFound: (count) => `विश्लेषण में ${count} जोखिम संकेतक पाए गए:`,
    noSuspicious: 'कोई संदिग्ध पैटर्न नहीं मिला। यह संदेश सुरक्षित प्रतीत होता है।',
    verifiedMerchant: 'सत्यापित व्यापारी UPI हैंडल।',
    verifiedBank: 'UPI ID एक पंजीकृत बैंक हैंडल का उपयोग करता है।',
    unknownUPI: 'UPI ID एक अपरिचित हैंडल प्रारूप का उपयोग करता है। सावधानी बरतें।',
    qrContainsUPI: 'QR में UPI भुगतान लिंक है।',
    qrConcerns: (count) => `QR कोड विश्लेषण में ${count} चिंता(एं) पाई गई:`,
    qrSafe: 'QR कोड एक वैध गंतव्य से जुड़ा प्रतीत होता है।',
    voiceAnalyzed: (dims, count) => `ध्वनि विश्लेषण ने ${dims} सिग्नल आयामों की जांच की और ${count} विसंगति संकेतक पाए:`,
    voiceSafe: (dims) => `ध्वनि विश्लेषण ने ${dims} सिग्नल आयामों की जांच की — सभी वास्तविक मानव भाषण के अनुरूप हैं।`,
    keyword: (kw) => `संदिग्ध कीवर्ड मिला: "${kw}"`,
    suspiciousDomain: (d) => `संदिग्ध डोमेन पाया: ${d}`,
    httpLink: 'असुरक्षित HTTP लिंक पाया गया',
    otpRequest: 'OTP/पिन शेयर करने का अनुरोध - बैंक कभी OTP नहीं मांगते',
    moneyDemand: 'पैसे/शुल्क/डिलीवरी चार्ज की मांग - फ्रॉड पैटर्न',
    urgency: 'तत्काल कार्रवाई या समय सीमा का दबाव',
    shortenedURL: 'छोटा किया गया URL वास्तविक गंतव्य छुपाता है',
    blockThreat: 'खाता/कार्ड/सिम/व्हाट्सएप ब्लॉक या बंद करने की धमकी',
    parcelScam: 'फर्जी पार्सल/डिलीवरी शुल्क ठगी - डिलीवरी के नाम पर लिंक या पैसे की मांग',
    apkThreat: 'अज्ञात APK फाइल डाउनलोड करने को कहा गया - गंभीर वायरस का खतरा',
    remoteAppThreat: 'रिमोट एक्सेस ऐप (AnyDesk/TeamViewer) इंस्टॉल करने को कहा गया - अत्यधिक जोखिम',
    utilityBillScam: 'बिजली कनेक्शन तुरंत काटने की धमकी - आम बिजली बिल ठगी',
    digitalArrest: 'डिजिटल अरेस्ट या सीबीआई/पुलिस कार्रवाई का दावा',
    jobScam: 'पार्ट टाइम जॉब या टेलीग्राम टास्क फ्रॉड',
  },
  gu: {
    analysisFound: (count) => `વિશ્લેષણમાં ${count} જોખમ સૂચક મળ્યા:`,
    noSuspicious: 'કોઈ શંકાસ્પદ પેટર્ન મળ્યા નથી. આ સંદેશ સુરક્ષિત જણાય છે.',
    verifiedMerchant: 'ચકાસાયેલ વેપારી UPI હેન્ડલ.',
    verifiedBank: 'UPI ID નોંધાયેલ બેંક હેન્ડલનો ઉપયોગ કરે છે.',
    unknownUPI: 'UPI ID અજાણ્યા હેન્ડલ ફોર્મેટનો ઉપયોગ કરે છે. સાવધાની રાખો.',
    qrContainsUPI: 'QR માં UPI ચૂકવણી લિંક છે.',
    qrConcerns: (count) => `QR કોડ વિશ્લેષણમાં ${count} ચિંતા મળી:`,
    qrSafe: 'QR કોડ કાયદેસર ગંતવ્ય સાથે જોડાયેલ જણાય છે.',
    voiceAnalyzed: (dims, count) => `ધ્વનિ વિશ્લેષણે ${dims} સિગ્નલ પરિમાણોની તપાસ કરી અને ${count} વિસંગતતા સૂચક મળ્યા:`,
    voiceSafe: (dims) => `ધ્વનિ વિશ્લેષણે ${dims} સિગ્નલ પરિમાણોની તપાસ કરી — બધા વાસ્તવિક માનવ ભાષણ સાથે સુસંગત છે.`,
    keyword: (kw) => `શંકાસ્પદ કીવર્ડ મળ્યો: "${kw}"`,
    suspiciousDomain: (d) => `શંકાસ્પદ ડોમેન મળ્યું: ${d}`,
    httpLink: 'અસુરક્ષિત HTTP લિંક મળી',
    otpRequest: 'OTP / પિન શેર કરવાની વિનંતી - બેંક કે પ્લેટફોર્મ ક્યારેય OTP માંગતા નથી',
    moneyDemand: 'પૈસા ટ્રાન્સફર કે ડિલિવરી ચાર્જ ચૂકવવાની માંગ - સ્કેમ પેટર્ન',
    urgency: 'સમય મર્યાદા કે તાત્કાલિક કાર્યવાહીનું દબાણ',
    shortenedURL: 'ટૂંકી કરેલ URL વાસ્તવિક ગંતવ્ય છુપાવે છે',
    blockThreat: 'ખાતું/કાર્ડ/વોટ્સએપ બ્લોક કે બંધ કરવાની ધમકી',
    parcelScam: 'બનાવટી પાર્સલ/ડિલિવરી ચાર્જ છેતરપિંડી - પૈસા કે લિંક પર ક્લિક કરવાની માંગ',
    apkThreat: 'અજાણી APK ફાઇલ ડાઉનલોડ કરવા જણાવાયું - ગંભીર જોખમ',
    remoteAppThreat: 'રમોટ કંટ્રોલ એપ (AnyDesk/TeamViewer) ઇન્સ્ટોલ કરવા જણાવાયું - અત્યંત જોખમી',
    utilityBillScam: 'વીજળી કનેક્શન કાપવાની ધમકી - જાણીતી છેતરપિંડી',
    digitalArrest: 'ડીજિટલ અરેસ્ટ અથવા સીબીઆઈ/પોલીસ કાર્યવાહીનો દાવો',
    jobScam: 'દૈનિક કમાણીની લાલચ આપતી બનાવટી નોકરીની યોજના',
  },
  ta: {
    analysisFound: (count) => `பகுப்பாய்வில் ${count} ஆபத்து குறிகாட்டிகள் கண்டறியப்பட்டன:`,
    noSuspicious: 'சந்தேகத்திற்குரிய தகவல்கள் இல்லை.',
    otpRequest: 'OTP பகிருமாறு கேட்கிறது - வங்கிகள் OTP கேட்காது',
    moneyDemand: 'பணம் அனுப்பக் கோருகிறது - மோசடி வடிவம்',
    urgency: 'உடனடி நடவடிக்கை எடுக்க அச்சுறுத்தல்',
    blockThreat: 'கணக்கு/கார்டு முடக்கப்படும் என அச்சுறுத்தல்',
    parcelScam: 'போலி பார்சல்/டெலிவரி கட்டண மோசடி',
    utilityBillScam: 'மின்சார இணைப்பு துண்டிக்கப்படும் என அச்சுறுத்தல்',
  },
  te: {
    analysisFound: (count) => `విశ్లేషణలో ${count} ప్రమాద సూచికలు కనుగొనబడ్డాయి:`,
    noSuspicious: 'సందేశం సురక్షితంగా కనిపిస్తుంది.',
    otpRequest: 'OTP ని షేర్ చేయమని అడుగుతోంది - బ్యాంకులు OTP అడగవు',
    moneyDemand: 'డబ్బు పంపమని కోరుతోంది - మోసపూరిత నమూనా',
    urgency: 'వెంటనే చర్య తీసుకోవాలని ఒత్తిడి చేస్తోంది',
    blockThreat: 'ఖాతా/కార్డ్ బ్లాక్ చేస్తామని బెదిరింపు',
    parcelScam: 'నకిలీ పార్శిల్/డెలివరీ ఛార్జ్ మోసం',
    utilityBillScam: 'విద్యుత్ కనెక్షన్ నిలిపివేస్తామని బెదిరింపు',
  },
  kn: {
    analysisFound: (count) => `ವಿಶ್ಲೇಷಣೆಯಲ್ಲಿ ${count} ಅಪಾಯ ಸೂಚಕಗಳು ಕಂಡುಬಂದಿವೆ:`,
    noSuspicious: 'ಸಂದೇಶ ಸುರಕ್ಷಿತವಾಗಿ ಕಾಣುತ್ತದೆ.',
    otpRequest: 'OTP ಹಂಚಿಕೊಳ್ಳಲು ಕೇಳುತ್ತಿದೆ - ಬ್ಯಾಂಕ್‌ಗಳು OTP ಕೇಳುವುದಿಲ್ಲ',
    moneyDemand: 'ಹಣ ಕಳುಹಿಸಲು ವಿನಂತಿಸುತ್ತಿದೆ - ವಂಚನೆ ಮಾದರಿ',
    urgency: 'ತಕ್ಷಣದ ಕ್ರಮಕ್ಕಾಗಿ ಒತ್ತಡ ಹೇರುತ್ತಿದೆ',
    blockThreat: 'ಖಾತೆ/ಕಾರ್ಡ್ ಬ್ಲಾಕ್ ಮಾಡುವ ಬೆದರಿಕೆ',
    parcelScam: 'ನಕಲಿ ಪಾರ್ಸಲ್/ಡೆಲಿವರಿ ಶುಲ್ಕ ವಂಚನೆ',
    utilityBillScam: 'ವಿದ್ಯುತ್ ಸಂಪರ್ಕ ಕಡಿತಗೊಳಿಸುವ ಬೆದರಿಕೆ',
  },
  bn: {
    analysisFound: (count) => `বিশ্লেষণে ${count}টি ঝুঁকি নির্দেশক পাওয়া গেছে:`,
    noSuspicious: 'বার্তাটি নিরাপদ বলে মনে হচ্ছে।',
    otpRequest: 'OTP শেয়ার করার অনুরোধ - ব্যাংক কখনো OTP চায় না',
    moneyDemand: 'টাকা পাঠানোর দাবি - ক্লাসিক স্ক্যাম প্যাটার্ন',
    urgency: 'জরুরি পদক্ষেপের জন্য চাপ সৃষ্টি করা হচ্ছে',
    blockThreat: 'অ্যাকাউন্ট/কার্ড ব্লক করার হুমকি',
    parcelScam: 'ভুয়া পার্সেল/ডেলিভারি ফি জালিয়াতি',
    utilityBillScam: 'বিদ্যুৎ সংযোগ বিচ্ছিন্ন করার হুমকি',
  },
  mr: {
    analysisFound: (count) => `विश्लेषणात ${count} जोखीम सूचक आढळले:`,
    noSuspicious: 'हा संदेश सुरक्षित दिसतो.',
    otpRequest: 'OTP शेअर करण्याची विनंती - बँका कधीही OTP मागत नाहीत',
    moneyDemand: 'पैसे भरण्याची मागणी - क्लासिक स्कॅम नमुना',
    urgency: 'तात्काळ कारवाईसाठी दबाव',
    blockThreat: 'खाते/कार्ड/सिम ब्लॉक करण्याची धमकी',
    parcelScam: 'बनावट पार्सल/डिलीव्हरी शुल्क फसवणूक',
    utilityBillScam: 'वीज कनेक्शन तोडण्याची धमकी - वीज बिल फसवणूक',
  },
  pa: {
    analysisFound: (count) => `ਵਿਸ਼ਲੇਸ਼ਣ ਵਿੱਚ ${count} ਜੋਖਮ ਸੂਚਕ ਮਿਲੇ:`,
    noSuspicious: 'ਇਹ ਸੁਨੇਹਾ ਸੁਰੱਖਿਅਤ ਜਾਪਦਾ ਹੈ।',
    otpRequest: 'OTP ਸਾਂਝਾ ਕਰਨ ਦੀ ਬੇਨਤੀ - ਬੈਂਕ ਕਦੇ OTP ਨਹੀਂ ਮੰਗਦੇ',
    moneyDemand: 'ਪੈਸੇ ਭੇਜਣ ਦੀ ਮੰਗ - ਠੱਗੀ ਦਾ ਤਰੀਕਾ',
    urgency: 'ਤੁਰੰਤ ਕਾਰਵਾਈ ਲਈ ਦਬਾਅ',
    blockThreat: 'ਖਾਤਾ/ਕਾਰਡ ਬਲਾਕ ਕਰਨ ਦੀ ਧਮਕੀ',
    parcelScam: 'ਝੂਠਾ ਪਾਰਸਲ/ਡਿਲੀਵਰੀ ਚਾਰਜ ਫਰਾਡ',
    utilityBillScam: 'ਬਿਜਲੀ ਕਨੈਕਸ਼ਨ ਕੱਟਣ ਦੀ ਧਮਕੀ',
  }
};

function getT(lang) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return (key, ...args) => {
    const fn = dict[key] || TRANSLATIONS.en[key];
    if (!fn) return key;
    if (typeof fn === 'function') return fn(...args);
    return fn;
  };
}

const PHISHING_KEYWORDS_EN = [
  'click here', 'verify your account', 'account blocked', 'account suspended', 'urgent action',
  'immediately', 'lottery winner', 'won prize', 'congratulations won', 'processing fee',
  'send money', 'transfer money', 'share otp', 'tell otp', 'kbc lucky draw', 'selected for prize',
  'pan card expired', 'aadhaar link', 'kyc update', 'last chance to claim', 'free recharge',
  'cashback reward', 'limited time offer', 'act now', 'account will be closed', 'verify now',
  'confirm your identity', 'security alert', 'unauthorized access', 'account locked',
  'reset password', 'jackpot winner', 'redeem points', 'electricity bill unpaid', 'power cutoff',
  'light bill', 'digital arrest', 'customs package', 'cbi officer', 'part time job', 'telegram task',
  'like youtube video', 'work from home income', 'install apk', 'download app', 'anydesk',
  'teamviewer', 'rustdesk', 'quicksupport', 'parcel stuck', 'delivery charge', 'share the otp',
  'kyc is incomplete'
];

const PHISHING_KEYWORDS_HINGLISH = [
  'account block', 'account band', 'account suspend', 'paise bhejo', 'paisa transfer',
  'lottery jeeto', 'inam jeeta', 'kbc lucky draw', 'bijli bill', 'light bill', 'power cut',
  'electric bill', 'call karo', 'link par click', 'kyc update', 'pan card link',
  'aadhaar update', 'otp batao', 'otp share', 'otp bhejo', 'urjent update',
  'part time job', 'daily kamaye', 'telegram group', 'apk download', 'app install',
  'file download', 'digital arrest', 'customs officer', 'challan pay', 'parcel stuck',
  'delivery charge'
];

const PHISHING_KEYWORDS_HI = [
  'यहाँ क्लिक करें', 'क्लिक करें', 'खाता सत्यापित', 'ब्लॉक', 'निलंबित', 'तुरंत', 'तत्काल',
  'लॉटरी', 'जीता', 'जीत', 'बधाई', 'इनाम', 'पुरस्कार', 'दावा करें', 'प्रोसेसिंग शुल्क',
  'पैसे भेजें', 'ट्रांसफर', 'ओटीपी', 'ओटीपी शेयर', 'केबीसी', 'लकी ड्रॉ', 'चयनित',
  'निष्क्रिय', 'लिंक करें', 'पैन कार्ड', 'आधार', 'केवाईसी', 'अपडेट करें', 'समाप्त',
  'आखिरी मौका', 'मुफ्त रिचार्ज', 'कैशबैक', 'सीमित समय', 'बोनस', 'अभी करें', 'चुना गया',
  'खाता बंद', 'सत्यापित करें', 'पहचान की पुष्टि', 'बैंक अलर्ट', 'सुरक्षा चेतावनी',
  'अनधिकृत', 'खाता लॉक', 'पासवर्ड रीसेट', 'मुफ्त उपहार', 'कूपन', 'वाउचर', 'विजेता',
  'जैकपॉट', 'प्राप्त करें', 'रिडीम', 'बिजली बिल', 'लाइट बिल', 'कनेक्शन कटेगा',
  'डिजिटल अरेस्ट', 'सीबीआई अधिकारी', 'पुलिस केस', 'एपीके डाउनलोड', 'ऐप इंस्टॉल',
  'पार्ट टाइम जॉब', 'टेलीग्राम टास्क', 'एनीडेस्क', 'टीमव्यूअर', 'कॉल करें', 'पार्सल',
  'डिलीवरी चार्ज', 'ओटीपी भेजें'
];

const PHISHING_KEYWORDS_GU = [
  'અહીં ક્લિક કરો', 'ક્લિક કરો', 'ખાતું ચકાસો', 'બ્લોક', 'સસ્પેન્ડ', 'તાત્કાલિક', 'તુરંત',
  'લોટરી', 'જીત્યા', 'જીત', 'અભિનંદન', 'ઇનામ', 'પુરસ્કાર', 'દાવો કરો', 'પ્રોસેસિંગ ફી',
  'પૈસા મોકલો', 'ટ્રાન્સફર', 'ઓટીપી', 'ઓટીપી શેર', 'કેબીસી', 'લકી ડ્રો', 'પસંદ',
  'નિષ્ક્રિય', 'લિંક કરો', 'પાન કાર્ડ', 'આધાર', 'કેવાયસી', 'અપડેટ', 'સમાપ્ત',
  'છેલ્લી તક', 'મફત રિચાર્જ', 'કેશબેક', 'મર્યાદિત સમય', 'રિવોર્ડ', 'બોનસ', 'હમણાં કરો',
  'પસંદ કરાયા', 'ખાતું બંધ', 'એકાઉન્ટ બંધ', 'ચકાસો', 'ઓળખ ચકાસો', 'બેંક અલર્ટ', 'સુરક્ષા ચેતવણી',
  'અનધિકૃત', 'ખાતું લૉક', 'પાસવર્ડ રીસેટ', 'વીજળી બિલ', 'લાઈટ બિલ', 'કનેક્શન કપાશે',
  'ડીજિટલ અરેસ્ટ', 'એપીકે', 'એપ્લિકેશન ઇન્સ્ટોલ', 'પાર્સલ', 'ડિલિવરી ચાર્જ', 'ઓટીપી મોકલો',
  'અટકી ગયું', 'લિંક પર ક્લિક'
];

const PHISHING_KEYWORDS_TA = [
  'கிளிக்', 'கணக்கு', 'தடுக்கப்பட்டது', 'உடனடியாக', 'புதுப்பிக்க', 'ஓடிபி', 'பகிரவும்',
  'வங்கி கணக்கு', 'லாட்டரி', 'பரிசு', 'மின்சாரக் கட்டணம்', 'இணைப்பு துண்டிப்பு'
];

const PHISHING_KEYWORDS_TE = [
  'క్లిక్', 'ఖాతా', 'బ్లాక్', 'వెంటనే', 'అప్‌డేట్', 'ఓటీపీ', 'కరెంట్ బిల్లు', 'విద్యుత్',
  'చెల్లించలేదు', 'నిలిపివేత', 'లక్కీ డ్రా', 'బహుమతి'
];

const PHISHING_KEYWORDS_KN = [
  'ಕ್ಲಿಕ್', 'ಖಾತೆ', 'ಬ್ಲಾಕ್', 'ತಕ್ಷಣ', 'ಅಪ್‌ಡೇಟ್', 'ಒಟಿಪಿ', 'ವಿದ್ಯುತ್ ಬಿಲ್', 'ಬಾಕಿ',
  'ಪವರ್ ಕಟ್', 'ತಡೆಯಲು', 'ಹಂಚಿಕೊಳ್ಳಿ', 'ಬಹುಮಾನ'
];

const PHISHING_KEYWORDS_BN = [
  'ক্লিক', 'অ্যাকাউন্ট', 'ব্লক', 'জরুরি', 'আপডেট', 'ওটিপি', 'প্রসেসিং ফি', 'লটারি',
  'জিতেছেন', 'টাকা', 'বিদ্যুৎ সংযোগ', 'বিচ্ছিন্ন'
];

const PHISHING_KEYWORDS_MR = [
  'क्लिक', 'खाते', 'ब्लॉक', 'तात्काळ', 'अपडेट', 'ओटीपी', 'वीज बिल', 'थकबाकी',
  'वीज कनेक्शन', 'तोडले जाईल', 'पैसे पाठवा', 'बक्षीस'
];

const PHISHING_KEYWORDS_PA = [
  'ਕਲਿੱਕ', 'ਖਾਤਾ', 'ਬਲਾਕ', 'ਤੁਰੰਤ', 'ਅੱਪਡੇਟ', 'ਓਟੀਪੀ', 'ਬਿਜਲੀ ਦਾ ਬਿੱਲ', 'ਮਿਆਦ'
];

const PHISHING_KEYWORDS_ALL = {
  en: PHISHING_KEYWORDS_EN,
  hinglish: PHISHING_KEYWORDS_HINGLISH,
  hi: PHISHING_KEYWORDS_HI,
  gu: PHISHING_KEYWORDS_GU,
  ta: PHISHING_KEYWORDS_TA,
  te: PHISHING_KEYWORDS_TE,
  kn: PHISHING_KEYWORDS_KN,
  bn: PHISHING_KEYWORDS_BN,
  mr: PHISHING_KEYWORDS_MR,
  pa: PHISHING_KEYWORDS_PA,
};

function detectScriptLanguages(text) {
  const scripts = {
    hi: /[\u0900-\u097F]/g,
    mr: /[\u0900-\u097F]/g,
    gu: /[\u0A80-\u0AFF]/g,
    ta: /[\u0B80-\u0BFF]/g,
    te: /[\u0C00-\u0C7F]/g,
    kn: /[\u0C80-\u0CFF]/g,
    bn: /[\u0980-\u09FF]/g,
    pa: /[\u0A00-\u0A7F]/g,
    ml: /[\u0D00-\u0D7F]/g,
    or: /[\u0B00-\u0B7F]/g,
  };
  const detected = [];
  for (const [lang, regex] of Object.entries(scripts)) {
    const matches = text.match(regex);
    if (matches && matches.length >= 2) {
      detected.push(lang);
    }
  }
  return detected;
}

const SUSPICIOUS_DOMAINS = [
  '.xyz', '.tk', '.ml', '.ga', '.cf', '.gq', '.buzz', '.top', '.click', '.link',
  '.work', '.date', '.racing', '.review', 'bit.ly', 'tinyurl', 'shorturl', 'cutt.ly',
  '.info', '.biz', '.online', '.site', '.store', '.icu', '.space', '.fun'
];

const TRUSTED_UPI_SUFFIXES = [
  '@ybl', '@paytm', '@axl', '@upi', '@sbi', '@okhdfcbank', '@okicici', '@oksbi',
  '@apl', '@fbl', '@ibl', '@kbl', '@icici', '@hdfcbank', '@axisbank', '@postbank'
];

function analyzeMessage(text, lang = 'en') {
  const t = getT(lang);
  const lowerText = (text || '').toLowerCase();
  let score = 0;
  const threats = [];
  const matchedKeywords = new Set();

  const containsKeyword = (src, kw) => {
    if (/^[a-z0-9\s]+$/i.test(kw)) {
      if (kw.includes(' ')) {
        return src.includes(kw);
      }
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      return regex.test(src);
    }
    return src.includes(kw);
  };

  // 1. Keyword Scan
  PHISHING_KEYWORDS_EN.concat(PHISHING_KEYWORDS_HINGLISH).forEach(kw => {
    if (containsKeyword(lowerText, kw) && !matchedKeywords.has(kw)) {
      score += 10;
      matchedKeywords.add(kw);
      threats.push(t('keyword', kw));
    }
  });

  const detectedLangs = detectScriptLanguages(text || '');
  const langsToCheck = new Set([...detectedLangs, lang]);
  langsToCheck.delete('en');

  for (const checkLang of langsToCheck) {
    const keywords = PHISHING_KEYWORDS_ALL[checkLang];
    if (!keywords) continue;
    keywords.forEach(kw => {
      if ((text || '').includes(kw) && !matchedKeywords.has(kw)) {
        score += 10;
        matchedKeywords.add(kw);
        threats.push(t('keyword', kw));
      }
    });
  }

  // 2. High-Precision Scam Intent Patterns

  // 2a. Comprehensive OTP & PIN Sharing Request Scam (English & Multilingual)
  const otpPattern = /(?:otp|pin|passcode|code|6\s*digit|6\s*અંકનો|6\s*अंक|ઓટીપી|ओटीपी|ਓਟੀਪੀ|ஓடிபி|ఓటీపీ|ಒಟಿಪಿ|ওটিপি)\b.*(?:share|send|tell|enter|give|batao|bhejo|mohklo|મોકલો|શેર|बताओ|भेजो|दें|અલર્ટ|મોકલી|பகிரவும்|હંચಿಕೊಳ್ಳಿ|শেয়ার)/i;
  const reverseOtpPattern = /(?:share|send|tell|enter|give|batao|bhejo|મોકલો|શેર|बताओ|भेजो|பகிரவும்|હંચಿಕೊಳ್ಳಿ|শেয়ার)\b.*(?:otp|pin|passcode|code|ઓટીપી|ओटीपी|ஓடிபி|ఓటీపీ|ಒಟಿಪಿ|ওটিপি)/i;
  if (otpPattern.test(text) || reverseOtpPattern.test(text) || /\b(otp|ઓટીપી|ओटीपी|ஓடிபி|ఓటీపీ|ಒಟಿಪಿ|ওটিপি)\b/i.test(text) && /(?:share|send|tell|enter|give|batao|bhejo|મોકલો|શેર|बताओ|भेजो|મોકલી|பகிரவும்|ஹંચಿಕೊಳ್ಳಿ|শেয়ার)/i.test(text)) {
    score += 35;
    if (!threats.some(tr => tr.includes('OTP'))) {
      threats.push(t('otpRequest'));
    }
  }

  // 2b. Account / Card / App / WhatsApp Suspension & Block Threat
  const blockThreatPattern = /(?:block|suspend|deactivat|lock|close|closed|band|બંન્ધ|બ્લોક|બંધ|સ્થગિત|ब्लॉक|निलंबित|बंद|தடுக்கப்பட்டது|నిలిపివేత)\b.*(?:within|in\s*\d+|account|card|sim|atm|bank|whatsapp|વાહટ્સએપ|એકાઉન્ટ|ખાતું|खाता|कार्ड|सीम|கணக்கு|ఖాతా|ಖಾತೆ|অ্যাকাউন্ট)/i;
  const reverseBlockPattern = /(?:account|card|sim|atm|bank|whatsapp|વાહટ્સએપ|એકાઉન્ટ|ખાતું|खाता|कार्ड|सीम|கணக்கு|வங்கி|ఖాతా|ಖಾತೆ|অ্যাকাউন্ট)\b.*(?:block|suspend|deactivat|lock|close|closed|band|બંન્ધ|બ્લોક|બંધ|સ્થગિત|ब्लॉक|निलंबित|बंद|தடுக்கப்பட்டது|నిలిపివేత)/i;
  if (blockThreatPattern.test(text) || reverseBlockPattern.test(text)) {
    score += 25;
    if (!threats.some(tr => tr.includes('block') || tr.includes('ब्लॉक') || tr.includes('બ્લોક') || tr.includes('બંધ') || tr.includes('தடுக்கப்பட்டது'))) {
      threats.push(t('blockThreat'));
    }
  }

  // 2c. Parcel / Delivery Fee Phishing Scam (Multilingual)
  const parcelPattern = /(?:parcel|package|delivery|courier|post|speed\s*post|પાર્સલ|ડિલિવરી|पार्सल|डिलीवरी)\b.*(?:stuck|hold|held|return|fee|charge|₹|rs|અટકી|અટકાવેલ|પરત|ચાર્જ|ચૂકવવા|અટકાવાયેલ)/i;
  if (parcelPattern.test(text) || /(?:પાર્સલ|ડિલિવરી|parcel|delivery).*(?:ચૂકવવા|ચાર્જ|લિંક|link|fee|charge)/i.test(text)) {
    score += 35;
    threats.push(t('parcelScam'));
  }

  // 2d. Strict Urgency / Time Limits (e.g., within 30 minutes, today itself, immediately)
  const urgencyPattern = /(?:within|in)\s*\d+\s*(?:min|minute|hour|hrs|मदन|મિનિટ|મિનીટ|મિનિટો|घंटे|કલાક)|within\s*\d+|immediately|urgent|तुरंत|तत्काल|જલ્દી|આજે જ|તુરંત|તાત્કાળ|உடனடியாக|வெంటనే|ತಕ್ಷಣ|এখনই/i;
  if (urgencyPattern.test(text)) {
    score += 20;
    if (!threats.some(tr => tr.includes('urgency') || tr.includes('તાત્કાલિક') || tr.includes('સમય'))) {
      threats.push(t('urgency'));
    }
  }

  // 2e. Money Transfer & Delivery Fee Demands
  const feePattern = /(?:₹|rs\.?|inr|\$)\s*\d+|\b\d+\s*(?:₹|rs|rupees|રૂપિયા|रुपये|টাকা)/i;
  if (feePattern.test(text) || /প্রসেসিং ফি|processing fee|fee|charge/i.test(text)) {
    if (/send|transfer|pay|fee|charge|भेजो|भेजें|મોકલો|ચૂકવવા|ચૂકવો|ભરો|ચૂકવણી|કટણમ|शुल्क|फी|ચાર્જ|দিতে|पाठवा/i.test(text)) {
      score += 20;
      if (!threats.some(tr => tr.includes('money') || tr.includes('પૈસા') || tr.includes('પાર્સલ'))) {
        threats.push(t('moneyDemand'));
      }
    }
  }

  // 2f. Click Link Action (Multilingual)
  if (/click.*link|tap.*link|link.*click|લિંક.*પર.*ક્લિક|લિંક.*ક્લિક|લિંક.*ક્લિક|लिंक.*क्लिक|કલિક|ক্লিক/i.test(text)) {
    score += 15;
    threats.push(t('keyword', 'click link'));
  }

  // 2g. APK Malware Downloads
  if (/\.apk\b|download.*apk|install.*app|sbi.*apk|ebill.*apk|एपीके|એપીકે|\bapk\b/i.test(text)) {
    score += 45;
    threats.push(t('apkThreat'));
  }

  // 2h. Remote Control Software (AnyDesk, TeamViewer)
  if (/anydesk|teamviewer|rustdesk|quicksupport|screenshare|screen\s*share|रिमोट/i.test(text)) {
    score += 45;
    threats.push(t('remoteAppThreat'));
  }

  // 2i. Electricity Bill Cutoff Scam (Multilingual across HI, GU, TA, TE, KN, BN, MR, PA)
  if (/(?:electricity|power|light|bijli|बिजली|વીજળી|மின்சார|విద్యుత్|ವಿದ್ಯುತ್|বিদ্যুৎ|वीज|ਬਿਜਲੀ|కరెంట్)\s*.*(?:bill|cut|disconnect|off|night|today|unpaid|बिल|બિલ|કનેક્શન|કાટ|काट|துண்டிப்பு|నిలిపివేత|ಕಡಿತ|বিচ্ছিন্ন|थकबाकी|तोडले)/i.test(text)
      || /(?:बिजली|वीज|વીજળી|కరెంట్|ವಿದ್ಯುತ್|বিদ্যুৎ)\s*.*(?:कटेगा|तोडले|કપાશે|തുண்டிப்பு|నిలిపివేత|ಕಡಿತ|বিচ্ছিন্ন|थकबाकी)/i.test(text)) {
    score += 35;
    threats.push(t('utilityBillScam'));
  }

  // 2j. Digital Arrest Scam
  if (/digital\s*arrest|customs.*parcel|cbi.*officer|cyber.*police|illegal.*package|police.*verification|डिजिटल\s*अरेस्ट|સીબીઆઈ|सीबीआई/i.test(text)) {
    score += 35;
    threats.push(t('digitalArrest'));
  }

  // 2k. Prize / Lottery Scam (Multilingual)
  if (/lottery| prize|লটারি|লটারি জিতেছেন|જિતીયા|इनाम|पुरस्कार|બક્ષીસ/i.test(text)) {
    if (/won|winner| claim|জিতেছেন|જીત્યા|जीता|जिंकले/i.test(text)) {
      score += 25;
    }
  }

  // 2l. Suspicious URLs & Shorteners
  const urlMatch = (text || '').match(/https?:\/\/[^\s]+/gi) || [];
  urlMatch.forEach(url => {
    SUSPICIOUS_DOMAINS.forEach(domain => {
      if (url.toLowerCase().includes(domain)) {
        score += 20;
        threats.push(t('suspiciousDomain', domain));
      }
    });
    if (url.startsWith('http://')) {
      score += 10;
      threats.push(t('httpLink'));
    }
  });

  if (/bit\.ly|tinyurl|cutt\.ly|shorturl|goo\.gl|t\.co|is\.gd|v\.gd|rb\.gy/i.test(text || '')) {
    score += 15;
    threats.push(t('shortenedURL'));
  }

  // Final scoring & status calculation
  score = Math.min(score, 100);
  let status = 'safe';
  let threatType = 'None';

  if (score >= 45) {
    status = 'blocked';
    threatType = 'High Risk Scam';
  } else if (score >= 25) {
    status = 'flagged';
    threatType = 'Suspicious Message';
  }

  const explanation = threats.length > 0
    ? `${t('analysisFound', threats.length)}\n• ${threats.join('\n• ')}`
    : t('noSuspicious');

  return {
    riskScore: score,
    risk_score: score,
    riskLevel: score >= 45 ? 'HIGH' : score >= 25 ? 'MEDIUM' : 'SAFE',
    status,
    confidence: threats.length > 0 ? 0.95 : 0.85,
    threat_type: threatType,
    ai_explanation: explanation,
    reason: explanation,
    recommendation: score >= 45
      ? 'DO NOT click any links or transfer money. Block sender and report to 1930 Cyber Helpline.'
      : score >= 25
      ? 'Exercise caution. Verify the sender through official channels before acting.'
      : 'Message appears safe. Standard security practices apply.'
  };
}

function analyzeUPI(upiId, lang = 'en') {
  const t = getT(lang);
  const lower = (upiId || '').toLowerCase();
  const hasTrustedSuffix = TRUSTED_UPI_SUFFIXES.some(s => lower.endsWith(s));

  if (hasTrustedSuffix) {
    const knownBrands = ['flipkart', 'amazon', 'paytm', 'phonepe', 'google', 'swiggy', 'zomato', 'ola', 'uber', 'myntra', 'bigbasket'];
    const isKnownBrand = knownBrands.some(b => lower.includes(b));
    if (isKnownBrand) {
      return { riskScore: 5, risk_score: 5, riskLevel: 'SAFE', status: 'verified', threat_type: 'None', ai_explanation: t('verifiedMerchant') };
    }
    return { riskScore: 25, risk_score: 25, riskLevel: 'SAFE', status: 'verified', threat_type: 'None', ai_explanation: t('verifiedBank') };
  }
  return { riskScore: 60, risk_score: 60, riskLevel: 'HIGH', status: 'flagged', threat_type: 'Unknown UPI Handle', ai_explanation: t('unknownUPI') };
}

function analyzeQR(url, lang = 'en') {
  const t = getT(lang);
  if ((url || '').startsWith('upi://')) {
    const params = new URLSearchParams(url.replace('upi://pay?', ''));
    const pa = params.get('pa') || '';
    const result = analyzeUPI(pa, lang);
    return { ...result, ai_explanation: `${t('qrContainsUPI')} ${result.ai_explanation}` };
  }

  let score = 30;
  const threats = [];

  SUSPICIOUS_DOMAINS.forEach(d => {
    if ((url || '').toLowerCase().includes(d)) {
      score += 20;
      threats.push(t('suspiciousDomain', d));
    }
  });

  if ((url || '').startsWith('http://')) {
    score += 15;
    threats.push(t('httpLink'));
  }
  if (/bit\.ly|tinyurl|cutt\.ly|shorturl/i.test(url || '')) {
    score += 15;
    threats.push(t('shortenedURL'));
  }

  score = Math.min(score, 100);
  let status = score >= 45 ? 'blocked' : score >= 25 ? 'flagged' : 'safe';
  let threatType = score >= 45 ? 'Malicious QR' : score >= 25 ? 'Suspicious QR' : 'None';
  const explanation = threats.length > 0
    ? `${t('qrConcerns', threats.length)}\n• ${threats.join('\n• ')}`
    : t('qrSafe');

  return { riskScore: score, risk_score: score, riskLevel: score >= 45 ? 'HIGH' : score >= 25 ? 'MEDIUM' : 'SAFE', status, threat_type: threatType, ai_explanation: explanation };
}

// ── Voice-analysis engine ─────────────────────────────────────────
function analyzeVoice(features, lang = 'en') {
  const t = getT(lang);
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
  } = features || {};

  let score = 0;
  const threats = [];
  const details = [];

  if (durationSec < 1.2) {
    score += 12;
    threats.push(t('clipShort', durationSec.toFixed(1)));
  }

  if (durationSec >= 1.2 && silenceRatio < 0.04) {
    score += 14;
    threats.push(t('noPauses', (silenceRatio * 100).toFixed(0)));
  }
  details.push({ label: 'Pause Ratio', value: `${(silenceRatio * 100).toFixed(1)}%`, note: silenceRatio < 0.04 ? 'abnormally low' : 'normal' });

  if (durationSec >= 1.2 && volumeVariance < 0.0015) {
    score += 14;
    threats.push(t('flatLoudness', volumeVariance.toFixed(4)));
  }
  details.push({ label: 'Volume Variance', value: volumeVariance.toFixed(4), note: volumeVariance < 0.0015 ? 'abnormally flat' : 'normal' });

  if (zcr > 0 && (zcr < 0.015 || zcr > 0.28)) {
    score += 8;
    threats.push(t('abnormalZCR', (zcr * 100).toFixed(1)));
  }

  if (clippingRatio > 0.02) {
    score += 8;
    threats.push(t('clipping', (clippingRatio * 100).toFixed(1)));
  }

  if (rms > 0 && rms < 0.008) {
    score += 6;
    threats.push(t('lowSignal'));
  }

  if (spectralFlatness >= 0) {
    if (spectralFlatness < 0.005 && durationSec >= 1.2) {
      score += 12;
      threats.push(t('spectralFlat', spectralFlatness.toFixed(4)));
    } else if (spectralFlatness > 0.5) {
      score += 6;
      threats.push(t('spectralHigh', spectralFlatness.toFixed(3)));
    }
    details.push({ label: 'Spectral Flatness', value: spectralFlatness.toFixed(4), note: spectralFlatness < 0.005 ? 'too clean' : spectralFlatness > 0.5 ? 'noise-like' : 'normal' });
  }

  if (spectralCentroid > 0) {
    if (spectralCentroid < 400) {
      score += 6;
      threats.push(t('centroidLow', spectralCentroid.toFixed(0)));
    } else if (spectralCentroid > 4500) {
      score += 6;
      threats.push(t('centroidHigh', spectralCentroid.toFixed(0)));
    }
    details.push({ label: 'Spectral Centroid', value: `${spectralCentroid.toFixed(0)} Hz` });
  }

  if (pitchConfidence > 0) {
    if (pitchConfidence < 0.1 && durationSec >= 2) {
      score += 8;
      threats.push(t('lowPitchConf', (pitchConfidence * 100).toFixed(0)));
    }
    if (pitchMean > 0 && pitchStd < 8 && pitchConfidence > 0.3) {
      score += 14;
      threats.push(t('stablePitch', pitchMean.toFixed(0), pitchStd.toFixed(1)));
    }
    if (pitchMean > 0 && (pitchMean < 65 || pitchMean > 400)) {
      score += 8;
      threats.push(t('pitchOutOfRange', pitchMean.toFixed(0)));
    }
    details.push({ label: 'Pitch', value: `${pitchMean.toFixed(0)} Hz (±${pitchStd.toFixed(1)})`, note: pitchStd < 8 ? 'monotone' : 'natural variation' });
    details.push({ label: 'Pitch Confidence', value: `${(pitchConfidence * 100).toFixed(0)}%` });
  }

  if (mfcc && mfcc.length >= 13) {
    const mfccSlice = mfcc.slice(1, 13);
    const mfccMean = mfccSlice.reduce((a, b) => a + b, 0) / mfccSlice.length;
    const mfccVar = mfccSlice.reduce((sum, v) => sum + (v - mfccMean) ** 2, 0) / mfccSlice.length;
    if (mfccVar < 0.5 && durationSec >= 1.5) {
      score += 10;
      threats.push(t('lowMFCC', mfccVar.toFixed(2)));
    }
    details.push({ label: 'MFCC Variance', value: mfccVar.toFixed(2), note: mfccVar < 0.5 ? 'abnormally uniform' : 'normal' });
  }

  if (formantSpread > 0) {
    if (formantSpread < 200) {
      score += 8;
      threats.push(t('formantNarrow', formantSpread.toFixed(0)));
    } else if (formantSpread > 2500) {
      score += 6;
      threats.push(t('formantWide', formantSpread.toFixed(0)));
    }
    details.push({ label: 'Formant Spread', value: `${formantSpread.toFixed(0)} Hz`, note: (formantSpread < 200 || formantSpread > 2500) ? 'atypical' : 'normal' });
  }

  score = Math.min(score, 100);
  let status = 'safe';
  let threatType = 'None';
  if (score >= 45) {
    status = 'blocked';
    threatType = 'Likely AI-Generated Voice';
  } else if (score >= 25) {
    status = 'flagged';
    threatType = 'Suspicious Audio Patterns';
  }

  const explanation = threats.length > 0
    ? `${t('voiceAnalyzed', details.length, threats.length)}\n• ${threats.join('\n• ')}`
    : t('voiceSafe', details.length);

  return { riskScore: score, risk_score: score, riskLevel: score >= 45 ? 'HIGH' : score >= 25 ? 'MEDIUM' : 'SAFE', status, threat_type: threatType, ai_explanation: explanation, details };
}

module.exports = function (db) {
  router.post('/message', optionalAuth, (req, res) => {
    try {
      const { text, lang } = req.body || {};
      if (!text) return res.status(400).json({ error: 'Message text is required.' });
      const result = analyzeMessage(text, lang);
      const scanId = uuidv4();
      db.run('INSERT INTO scans (id, user_id, type, content, risk_score, status, threat_type, ai_explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [scanId, req.user?.id || null, 'sms', text, result.risk_score, result.status, result.threat_type, result.ai_explanation]);
      res.json({ id: scanId, ...result });
    } catch (err) {
      console.error('Scan error:', err);
      res.status(500).json({ error: 'Analysis failed.' });
    }
  });

  router.post('/upi', optionalAuth, (req, res) => {
    try {
      const { upiId, lang } = req.body || {};
      if (!upiId) return res.status(400).json({ error: 'UPI ID is required.' });
      const result = analyzeUPI(upiId, lang);
      const scanId = uuidv4();
      db.run('INSERT INTO scans (id, user_id, type, content, risk_score, status, threat_type, ai_explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [scanId, req.user?.id || null, 'upi', upiId, result.risk_score, result.status, result.threat_type, result.ai_explanation]);
      res.json({ id: scanId, ...result });
    } catch (err) {
      console.error('UPI scan error:', err);
      res.status(500).json({ error: 'UPI analysis failed.' });
    }
  });

  router.post('/qr', optionalAuth, (req, res) => {
    try {
      const { url, lang } = req.body || {};
      if (!url) return res.status(400).json({ error: 'QR code URL is required.' });
      const result = analyzeQR(url, lang);
      const scanId = uuidv4();
      db.run('INSERT INTO scans (id, user_id, type, content, risk_score, status, threat_type, ai_explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [scanId, req.user?.id || null, 'qr', url, result.risk_score, result.status, result.threat_type, result.ai_explanation]);
      res.json({ id: scanId, ...result });
    } catch (err) {
      console.error('QR scan error:', err);
      res.status(500).json({ error: 'QR analysis failed.' });
    }
  });

  router.post('/voice', optionalAuth, (req, res) => {
    try {
      const { features, sourceType, fileName, lang } = req.body || {};
      if (!features || typeof features.durationSec !== 'number' || features.durationSec <= 0) {
        return res.status(400).json({ error: 'No audio features received. Record or upload an audio clip first.' });
      }
      const result = analyzeVoice(features, lang);
      const scanId = uuidv4();
      const contentLabel = fileName
        ? `upload: ${fileName}`
        : `${sourceType || 'recording'} (${features.durationSec.toFixed(1)}s)`;
      db.run('INSERT INTO scans (id, user_id, type, content, risk_score, status, threat_type, ai_explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [scanId, req.user?.id || null, 'voice', contentLabel, result.risk_score, result.status, result.threat_type, result.ai_explanation]);
      res.json({ id: scanId, ...result });
    } catch (err) {
      console.error('Voice scan error:', err);
      res.status(500).json({ error: 'Voice analysis failed.' });
    }
  });

  return router;
};
