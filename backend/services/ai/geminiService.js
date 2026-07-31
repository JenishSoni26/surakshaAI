/**
 * @file geminiService.js
 * @description Gemini AI Service Layer for SurakshaAI.
 * Modular service wrapper for Gemini LLM capabilities with full 9-language localization support.
 */

const { buildMessageAnalysisPrompt, buildUPIAnalysisPrompt, buildVoiceTranscriptPrompt, getLanguageName } = require('./promptTemplates');

const safetyGuidanceByLang = {
  en: {
    HIGH: 'Critical Risk Alert: Stop interaction immediately. Do not click links, scan QR codes, or share credentials. Call 1930 Cyber Helpline to report.',
    MEDIUM: 'Cautionary Advisory: Verify the source independently through official contact numbers before proceeding with any action.',
    LOW: 'Standard Safe Security Practice: Keep passwords unique and never share your confidential UPI PIN with anyone.'
  },
  hi: {
    HIGH: 'गंभीर जोखिम चेतावनी: तुरंत बातचीत बंद करें। लिंक पर क्लिक न करें, QR स्कैन न करें या क्रेडेंशियल साझा न करें। 1930 पर कॉल करें।',
    MEDIUM: 'सावधानी सलाह: कोई भी कार्रवाई करने से पहले आधिकारिक संपर्क नंबरों के माध्यम से स्रोत की स्वतंत्र रूप से पुष्टि करें।',
    LOW: 'मानक सुरक्षा अभ्यास: पासवर्ड अद्वितीय रखें और अपना गोपनीय UPI PIN कभी किसी के साथ साझा न करें।'
  },
  gu: {
    HIGH: 'ગંભીર જોખમ ચેતવણી: તરત જ ક્રિયાપ્રતિક્રિયા બંધ કરો. લિંક્સ પર ક્લિક કરશો નહીં, QR સ્કેન કરશો નહીં. 1930 પર કૉલ કરો.',
    MEDIUM: 'સાવચેતી સલાહ: આગળ વધતા પહેલા સત્તાવાર સંપર્ક નંબરો દ્વારા સ્વતંત્ર રીતે સ્ત્રોત ચકાસો.',
    LOW: 'સામાન્ય સુરક્ષા નિયમ: પાસવર્ડ અનન્ય રાખો અને તમારો ગુપ્ત UPI PIN ક્યારેય કોઈ સાથે શેર કરશો નહીં.'
  },
  ta: {
    HIGH: 'முக்கிய ஆபத்து எச்சரிக்கை: உரையாடலை உடனடியாக நிறுத்தவும். லிங்க்களை கிளிக் செய்ய வேண்டாம். 1930 ஐ அழைக்கவும்.',
    MEDIUM: 'எச்சரிக்கை ஆலோசனை: தொடர்வதற்கு முன் அதிகாரப்பூர்வ எண்கள் மூலம் மூலத்தை சரிபார்க்கவும்.',
    LOW: 'பாதுகாப்பு நடைமுறை: கடவுச்சொற்களை தனித்துவமாக வைத்திருங்கள் மற்றும் UPI PIN ஐ யாருடனும் பகிர வேண்டாம்.'
  },
  te: {
    HIGH: 'తీవ్రమైన ప్రమాద హెచ్చరిక: పరస్పర చర్యను వెంటనే నిలిపివేయండి. లింక్‌లను క్లిక్ చేయవద్దు. 1930 కి కాల్ చేయండి.',
    MEDIUM: 'హెచ్చరిక సలహా: చర్య తీసుకునే ముందు అధికారిక సంప్రదింపు నంబర్ల ద్వారా మూలాన్ని ధృవీకరించుకోండి.',
    LOW: 'సాధారణ భద్రతా విధానం: పాస్‌వర్డ్‌లను ప్రత్యేకంగా ఉంచండి మరియు మీ UPI PIN ని ఎవరితోనూ పంచుకోవద్దు.'
  },
  kn: {
    HIGH: 'ತೀವ್ರ ಅಪಾಯದ ಎಚ್ಚರಿಕೆ: ತಕ್ಷಣವೇ ಸಂಪರ್ಕವನ್ನು ನಿಲ್ಲಿಸಿ. ಲಿಂಕ್‌ಗಳನ್ನು ಕ್ಲಿಕ್ ಮಾಡಬೇಡಿ. 1930 ಗೆ ಕರೆ ಮಾಡಿ.',
    MEDIUM: 'ಎಚ್ಚರಿಕೆಯ ಸಲಹೆ: ಮುಂದುವರಿಯುವ ಮೊದಲು ಅಧಿಕೃತ ಸಂಖ್ಯೆಗಳ ಮೂಲಕ ಮೂಲವನ್ನು ಪರಿಶೀಲಿಸಿ.',
    LOW: 'ಸಾಮಾನ್ಯ ಭದ್ರತಾ ನಿಯಮ: ಪಾಸ್‌ವರ್ಡ್‌ಗಳನ್ನು ಅನನ್ಯವಾಗಿರಿಸಿ ಮತ್ತು ನಿಮ್ಮ UPI PIN ಅನ್ನು ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ.'
  },
  bn: {
    HIGH: 'জরুরি ঝুঁকি সতর্কতা: অবিলম্বে যোগাযোগ বন্ধ করুন। লিংকে ক্লিক করবেন না। ১৯৩০ নম্বরে কল করুন।',
    MEDIUM: 'সতর্কতামূলক পরামর্শ: কোনো পদক্ষেপ নেওয়ার আগে অফিসিয়াল নম্বরের মাধ্যমে যাচাই করুন।',
    LOW: 'সাধারণ সুরক্ষা নিয়ম: পাসওয়ার্ড অনন্য রাখুন এবং আপনার UPI PIN কারো সাথে শেয়ার করবেন না।'
  },
  mr: {
    HIGH: 'गंभीर जोखीम इशारा: संवाद त्वरित थांबवा. लिंक्सवर क्लिक करू नका. १९३० वर कॉल करा.',
    MEDIUM: 'काळजीचा सल्ला: कोणतीही कारवाई करण्यापूर्वी अधिकृत क्रमांकांद्वारे स्त्रोताची पडताळणी करा.',
    LOW: 'मानक सुरक्षा पद्धत: पासवर्ड अद्वितीय ठेवा आणि तुमचा गुप्त UPI PIN कोणासोबतही शेअर करू नका.'
  },
  pa: {
    HIGH: 'ਗੰਭੀਰ ਜੋਖਮ ਚੇਤਾਵਨੀ: ਤੁਰੰਤ ਗੱਲਬਾਤ ਬੰਦ ਕਰੋ। ਲਿੰਕਾਂ \'ਤੇ ਕਲਿੱਕ ਨਾ ਕਰੋ। 1930 \'ਤੇ ਕਾਲ ਕਰੋ।',
    MEDIUM: 'ਸਾਵਧਾਨੀ ਸਲਾਹ: ਅੱਗੇ ਵਧਣ ਤੋਂ ਪਹਿਲਾਂ ਅਧਿਕਾਰਤ ਨੰਬਰਾਂ ਰਾਹੀਂ ਸਰੋਤ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ।',
    LOW: 'ਸਧਾਰਨ ਸੁਰੱਖਿਆ ਨਿਯਮ: ਪਾਸਵਰਡ ਵੱਖਰੇ ਰੱਖੋ ਅਤੇ ਆਪਣਾ UPI PIN ਕਿਸੇ ਨਾਲ ਸਾਂਝਾ ਨਾ ਕਰੋ।'
  }
};

class GeminiService {
  constructor() {
    this.isConfigured = false;
  }

  async enrichExplanation(analysis, options = {}) {
    const lang = options.lang || 'en';
    const recommendedModules = this.recommendLearningModules(analysis.riskLevel, analysis.detectedPatterns);
    
    return {
      ...analysis,
      geminiEnriched: false,
      safetyGuidance: this.getSafetyGuidance(analysis.riskLevel, lang),
      recommendedModules
    };
  }

  recommendLearningModules(riskLevel, detectedPatterns = []) {
    const modules = [];
    const patternsLower = detectedPatterns.join(' ').toLowerCase();

    if (patternsLower.includes('tld') || patternsLower.includes('phishing') || patternsLower.includes('link')) {
      modules.push('Identifying Phishing SMS');
    }
    if (patternsLower.includes('upi') || patternsLower.includes('vpa') || patternsLower.includes('handle')) {
      modules.push('Safe UPI Practices');
    }
    if (patternsLower.includes('qr')) {
      modules.push('QR Code Safety');
    }
    if (patternsLower.includes('voice') || patternsLower.includes('pitch') || patternsLower.includes('deepfake')) {
      modules.push('Voice Call Scams');
    }
    if (patternsLower.includes('otp') || patternsLower.includes('credential')) {
      modules.push('Digital Banking Security');
    }

    if (modules.length === 0) {
      if (riskLevel === 'HIGH' || riskLevel === 'MEDIUM') {
        modules.push('Identifying Phishing SMS', 'Safe UPI Practices');
      } else {
        modules.push('Digital Banking Security');
      }
    }

    return modules;
  }

  getSafetyGuidance(riskLevel, lang = 'en') {
    const dict = safetyGuidanceByLang[lang] || safetyGuidanceByLang.en;
    return dict[riskLevel] || dict.LOW;
  }
}

module.exports = new GeminiService();
