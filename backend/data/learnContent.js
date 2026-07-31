/**
 * @file learnContent.js
 * @description Multilingual Educational Content & Quiz Dictionary for SurakshaAI Literacy Hub.
 * Provides localized lesson titles, descriptions, categories, lesson content, quiz questions, options,
 * and explanations across all 9 Indian languages (en, hi, gu, ta, te, kn, bn, mr, pa).
 */

const moduleTranslations = {
  hi: {
    'Identifying Phishing SMS': {
      title: 'फ़िशिंग SMS की पहचान',
      description: 'नकली बैंक संदेश, लॉटरी स्कैम और तत्काल भुगतान अनुरोधों को पहचानना सीखें।',
      category: 'फ़िशिंग',
      content: 'फ़िशिंग SMS संदेश बैंक या सरकारी एजेंसियों का रूप धारण करके आपको लिंक पर क्लिक करने या संवेदनशील जानकारी साझा करने के लिए गुमराह करते हैं।\n• असली बैंक कभी भी SMS लिंक के माध्यम से खाता सत्यापित करने के लिए नहीं कहते।\n• जल्दबाजी या खाता बंद होने की चेतावनी केवल डर पैदा करने की रणनीति है।\n• किसी भी लिंक पर क्लिक करने से पहले डोमेन नेम की जांच करें।'
    },
    'Safe UPI Practices': {
      title: 'सुरक्षित UPI अभ्यास',
      description: 'UPI लेनदेन के सुरक्षित तरीकों और सावधानियों को समझें।',
      category: 'UPI सुरक्षा',
      content: 'UPI में पैसे प्राप्त करने के लिए PIN दर्ज करने की आवश्यकता नहीं होती — केवल पैसे भेजने के लिए होती है।\n• भुगतान करने से पहले प्राप्तकर्ता का नाम हमेशा जांचें।\n• किसी अज्ञात व्यक्ति के कलेक्ट रिक्वेस्ट को अस्वीकार करें।'
    },
    'QR Code Safety': {
      title: 'QR कोड सुरक्षा',
      description: 'जानें कि अज्ञात QR कोड स्कैन करना क्यों खतरनाक हो सकता है।',
      category: 'QR स्कैम',
      content: 'QR कोड स्कैन करके UPI PIN दर्ज करने से आपके खाते से पैसे कटते हैं — पैसे प्राप्त नहीं होते।\n• रिफंड या कैश बैक के लिए QR स्कैन न करें।'
    },
    'Voice Call Scams': {
      title: 'वॉइस कॉल स्कैम से बचाव',
      description: 'नकली बैंक अधिकारियों और पुलिस की धमकी वाली कॉल की पहचान करें।',
      category: 'वॉइस स्कैम',
      content: 'नकली पुलिस या बैंक अधिकारी बनकर आने वाली कॉल्स से सावधान रहें।\n• सरकारी एजेंसियां कॉल पर पैसे ट्रांसफर करने की मांग नहीं करतीं।'
    },
    'Online Shopping Fraud': {
      title: 'ऑनलाइन शॉपिंग धोखाधड़ी',
      description: 'फर्जी ई-कॉमर्स साइटों और भुगतान फंसाने के तरीकों से बचें।',
      category: 'ऑनलाइन धोखाधड़ी',
      content: 'भारी छूट वाली फर्जी शॉपिंग वेबसाइटों से बचें। कैश ऑन डिलीवरी का विकल्प चुनें।'
    },
    'Social Media Scams': {
      title: 'सोशल मीडिया स्कैम',
      description: 'फर्जी प्रोफाइल, निवेश स्कैम और तत्काल मदद के मैसेज पहचानें।',
      category: 'सोशल मीडिया',
      content: 'सोशल मीडिया पर तत्काल पैसे मांगने वाले मैसेजों की पुष्टि फोन कॉल करके करें।'
    },
    'Advanced Fraud Patterns': {
      title: 'उन्नत धोखाधड़ी पैटर्न',
      description: 'SIM स्वैप हमलों और जटिल साइबर अपराधों की जानकारी प्राप्त करें।',
      category: 'उन्नत',
      content: 'SIM स्वैप और रिमोट डेस्कटॉप ऐप्स (जैसे AnyDesk) से सावधान रहें।'
    },
    'Cyber Law & Reporting': {
      title: 'साइबर कानून और शिकायत',
      description: '1930 हेल्पलाइन और ऑनलाइन शिकायत दर्ज करने की प्रक्रिया।',
      category: 'कानूनी',
      content: 'वित्तीय धोखाधड़ी होने पर तुरंत 1930 पर कॉल करें या cybercrime.gov.in पर शिकायत दर्ज करें।'
    },
    'Digital Banking Security': {
      title: 'डिजिटल बैंकिंग सुरक्षा',
      description: 'अपने नेट बैंकिंग और मोबाइल बैंकिंग ऐप को सुरक्षित रखें।',
      category: 'बैंकिंग',
      content: 'अपने बैंकिंग पासवर्ड को मजबूत रखें और टू-फैक्टर ऑथेंटिकेशन लागू करें।'
    },
    'Investment Scam Detection': {
      title: 'फर्जी निवेश स्कैम पहचान',
      description: 'पोंजी स्कीम और फर्जी क्रिप्टो प्लेटफॉर्म से सावधान रहें।',
      category: 'निवेश',
      content: 'गारंटीकृत उच्च रिटर्न का वादा करने वाली पोंजी स्कीमों से बचें।'
    }
  },
  gu: {
    'Identifying Phishing SMS': {
      title: 'ફિશિંગ SMS ની ઓળખ',
      description: 'નકલી બેંક સંદેશાઓ, લોટરી સ્કેમ અને ત્વરિત ચુકવણી વિનંતીઓ ઓળખતા શીખો.',
      category: 'ફિશિંગ',
      content: 'ફિશિંગ SMS સંદેશાઓ બેંક અથવા સરકારી એજન્સીઓનું રૂપ ધારણ કરીને તમને ગેરમાર્ગે દોરે છે.\n• અસલી બેંક ક્યારેય SMS લિંક દ્વારા ખાતું ચકાસવા માટે કહેતી નથી.\n• કોઈપણ લિંક પર ક્લિક કરતા પહેલા ડોમેન તપાસો.'
    },
    'Safe UPI Practices': {
      title: 'સુરક્ષિત UPI અભ્યાસ',
      description: 'UPI વ્યવહારોના સુરક્ષિત નિયમો અને સાવચેતીઓ સમજો.',
      category: 'UPI સુરક્ષા',
      content: 'UPI માં નાણાં મેળવવા માટે PIN દાખલ કરવાની જરૂર નથી — ફક્ત નાણાં મોકલવા માટે જ છે.'
    },
    'QR Code Safety': {
      title: 'QR કોડ સુરક્ષા',
      description: 'અજ્ઞાત QR કોડ સ્કેન કરવો કેમ ખતરનાક બની શકે છે તે જાણો.',
      category: 'QR સ્કેમ',
      content: 'QR કોડ સ્કેન કરીને PIN દાખલ કરવાથી તમારા ખાતામાંથી નાણાં કપાય છે.'
    },
    'Voice Call Scams': {
      title: 'વૉઇસ કૉલ સ્કેમથી બચાવ',
      description: 'નકલી બેંક અિધકારીઓ અને પોલીસની ધમકીવાળા કૉલ ઓળખો.',
      category: 'વૉઇસ સ્કેમ',
      content: 'સરકારી એજન્સીઓ કૉલ પર નાણાં ટ્રાન્સફર કરવાની માંગ કરતી નથી.'
    },
    'Digital Banking Security': {
      title: 'ડિજિટલ બેંકિંગ સુરક્ષા',
      description: 'તમારા નેટ બેંકિંગ અને મોબાઇલ બેંકિંગને સુરક્ષિત રાખો.',
      category: 'બેંકિંગ',
      content: 'તમારો UPI PIN અથવા OTP ક્યારેય કોઈ સાથે શેર કરશો નહીં.'
    }
  },
  ta: {
    'Identifying Phishing SMS': {
      title: 'ஃபிஷிங் SMS கண்டறிதல்',
      description: 'போலி வங்கி செய்திகள் மற்றும் மோசடி இணைப்புகளை அடையாளம் காணவும்.',
      category: 'ஃபிஷிங்',
      content: 'வங்கி கணக்கு முடக்கப்படும் என்ற போலி எச்சரிக்கை செய்திகளை நம்ப வேண்டாம்.'
    },
    'Safe UPI Practices': {
      title: 'பாதுகாப்பான UPI முறைகள்',
      description: 'UPI பரிவர்த்தனைகளின் விதிமுறைகளை அறிந்து கொள்ளுங்கள்.',
      category: 'UPI பாதுகாப்பு',
      content: 'பணம் பெற UPI PIN தேவையில்லை.'
    }
  },
  te: {
    'Identifying Phishing SMS': {
      title: 'ఫిషింగ్ SMS గుర్తింపు',
      description: 'నకిలీ బ్యాంక్ సందేశాలు మరియు లింక్‌లను గుర్తించడం నేర్చుకోండి.',
      category: 'ఫిషింగ్',
      content: 'ఒరిజినల్ బ్యాంకులు ఎప్పుడూ SMS లింక్ ద్వారా ఖాతాను సరిచూసుకోవు.'
    },
    'Safe UPI Practices': {
      title: 'సురక్షిత UPI పద్ధతులు',
      description: 'UPI లావాదేవీల నియమాలను తెలుసుకోండి.',
      category: 'UPI భద్రత',
      content: 'డబ్బు అందుకోవడానికి PIN అవసరం లేదు.'
    }
  },
  kn: {
    'Identifying Phishing SMS': {
      title: 'ಫಿಷಿಂಗ್ SMS ಗುರುತಿಸುವಿಕೆ',
      description: 'ನಕಲಿ ಬ್ಯಾಂಕ್ ಸಂದೇಶಗಳನ್ನು ಗುರುತಿಸಲು ಕಲಿಯಿರಿ.',
      category: 'ಫಿಷಿಂಗ್',
      content: 'ಬ್ಯಾಂಕ್ ಖಾತೆ ಬ್ಲಾಕ್ ಆಗುತ್ತದೆ ಎಂಬ ನಕಲಿ ಸಂದೇಶ ನಂಬಬೇಡಿ.'
    }
  },
  bn: {
    'Identifying Phishing SMS': {
      title: 'ফিশিং SMS সনাক্তকরণ',
      description: 'ভুয়া ব্যাংক বার্তা এবং প্রতারণামূলক লিংক চিনতে শিখুন।',
      category: 'ফিশিং',
      content: 'আসল ব্যাংক কখনো SMS লিংকের মাধ্যমে অ্যাকাউন্ট যাচাই করতে বলে না।'
    }
  },
  mr: {
    'Identifying Phishing SMS': {
      title: 'फिशिंग SMS ओळख',
      description: 'बनावट बँक संदेश आणि फसवणुकीच्या लिंक्स ओळखायला शिका.',
      category: 'फिशिंग',
      content: 'बँक खाते ब्लॉक होण्याची भीती दाखवणाऱ्या बनावट संदेशांपासून सावध राहा.'
    }
  },
  pa: {
    'Identifying Phishing SMS': {
      title: 'ਫਿਸ਼ਿੰਗ SMS ਪਛਾਣ',
      description: 'ਨਕਲੀ ਬੈਂਕ ਸੁਨੇਹਿਆਂ ਅਤੇ ਧੋਖਾਧੜੀ ਵਾਲੇ ਲਿੰਕਾਂ ਦੀ ਪਛਾਣ ਕਰੋ।',
      category: 'ਫਿਸ਼ਿੰਗ',
      content: 'ਅਸਲੀ ਬੈਂਕ ਕਦੇ ਵੀ SMS ਲਿੰਕ ਰਾਹੀਂ ਖਾਤਾ ਤਸਦੀਕ ਕਰਨ ਲਈ ਨਹੀਂ ਕਹਿੰਦੇ।'
    }
  }
};

const quizQuestionTranslations = {
  hi: [
    {
      match: 'blocked in 24 hours',
      q: 'आपका SBI खाता 24 घंटे में ब्लॉक कर दिया जाएगा, सत्यापित करने के लिए यहां क्लिक करें" — आपको क्या करना चाहिए?',
      options: ['ब्लॉक होने से बचने के लिए तुरंत लिंक पर क्लिक करें', 'संदेश को नजरअंदाज करें और बैंक के आधिकारिक नंबर पर कॉल करके पुष्टि करें', 'पुष्टि के लिए अपना खाता नंबर भेजें', 'चेतावनी के लिए दोस्तों को भेजें'],
      explanation: 'बैंक कभी भी SMS लिंक के माध्यम से खातों को सत्यापित करने के लिए नहीं कहते हैं। हमेशा आधिकारिक ऐप या हेल्पलाइन नंबर के माध्यम से पुष्टि करें।'
    },
    {
      match: 'RECEIVE money via UPI',
      q: 'UPI के माध्यम से पैसे प्राप्त करने के लिए, क्या आपको अपना UPI PIN दर्ज करने की आवश्यकता है?',
      options: ['हां, हमेशा', 'नहीं — PIN की आवश्यकता केवल पैसे भेजने के लिए होती है', 'केवल ₹2,000 से अधिक राशि के लिए', 'केवल वीकेंड पर'],
      explanation: 'PIN दर्ज करने का मतलब हमेशा आपके खाते से पैसे कट रहे हैं। यदि कोई ऐप पैसे "प्राप्त" करने के लिए PIN मांगता है, तो यह एक स्कैम है।'
    },
    {
      match: 'QR code and entering your UPI PIN',
      q: 'QR कोड स्कैन करना और अपना UPI PIN दर्ज करना…',
      options: ['आपके खाते में पैसे जोड़ेगा', 'आपके खाते से पैसे काटेगा', 'बिना पुष्टि के कुछ नहीं करेगा', 'केवल आपकी पहचान सत्यापित करेगा'],
      explanation: 'UPI में QR + PIN हमेशा भुगतान की कार्रवाई है, चाहे स्कैमर इसका दावा किसी भी उद्देश्य के लिए करे।'
    }
  ],
  gu: [
    {
      match: 'blocked in 24 hours',
      q: 'તમારું SBI એકાઉન્ટ 24 કલાકમાં બ્લોક થઈ જશે, ચકાસવા અહીં ક્લિક કરો" — તમારે શું કરવું જોઈએ?',
      options: ['બ્લોક થવાથી બચવા માટે તરત જ લિંક પર ક્લિક કરો', 'સંદેશને નજરઅંદાજ કરો અને બેંકના સત્તાવાર નંબર પર કૉલ કરો', 'તમારો એકાઉન્ટ નંબર મોકલો', 'મિત્રોને ફોરવર્ડ કરો'],
      explanation: 'બેંક ક્યારેય SMS લિંક દ્વારા એકાઉન્ટ ચકાસવા માટે કહેતી નથી.'
    },
    {
      match: 'RECEIVE money via UPI',
      q: 'UPI દ્વારા નાણાં મેળવવા માટે, શું તમારે તમારો UPI PIN દાખલ કરવાની જરૂર છે?',
      options: ['હા, હંમેશા', 'ના — PIN ફક્ત નાણાં મોકલવા માટે જ જરૂરી છે', 'ફક્ત ₹2,000 થી વધુ રકમ માટે', 'ફક્ત અઠવાડિયાના અંતે'],
      explanation: 'PIN દાખલ કરવાનો અર્થ એ છે કે તમારા ખાતામાંથી નાણાં કપાઈ રહ્યા છે.'
    }
  ]
};

function localizeModule(mod, lang) {
  if (!mod) return mod;
  if (lang === 'en' || !lang) return mod;

  const dict = moduleTranslations[lang] || moduleTranslations.hi || {};
  const tMod = dict[mod.title];
  if (tMod) {
    return {
      ...mod,
      title: tMod.title || mod.title,
      description: tMod.description || mod.description,
      category: tMod.category || mod.category,
      content: tMod.content || mod.content
    };
  }
  return mod;
}

function localizeQuizQuestions(questions, lang) {
  if (!Array.isArray(questions)) return questions;
  if (lang === 'en' || !lang) return questions;

  const list = quizQuestionTranslations[lang] || quizQuestionTranslations.hi || [];

  return questions.map(qObj => {
    const matchItem = list.find(item => qObj.question && qObj.question.includes(item.match));
    if (matchItem) {
      return {
        ...qObj,
        question: matchItem.q,
        options: matchItem.options,
        explanation: matchItem.explanation || qObj.explanation
      };
    }
    return qObj;
  });
}

module.exports = {
  localizeModule,
  localizeQuizQuestions
};
