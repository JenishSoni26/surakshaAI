/**
 * @file explainEngine.js
 * @description Explanation Engine for SurakshaAI Hybrid AI architecture.
 * Synthesizes detected threat patterns, rule findings, and classifier outputs into clear,
 * human-readable explanations and actionable recommendations across 9 Indian languages.
 */

const patternTranslations = {
  hi: {
    'Suspicious Phishing TLD Link': 'संदिग्ध फ़िशिंग लिंक',
    'Shortened Destination URL': 'छोटा किया गया URL',
    'Unencrypted HTTP Link': 'असुरक्षित HTTP लिंक',
    'Unprefixed Phishing Domain': 'संदिग्ध फ़िशिंग डोमेन',
    'Digital Arrest & Police / Govt Coercion': 'डिजिटल अरेस्ट व पुलिस दबाव',
    'Relative / Landlord Emergency Fraud': 'आपातकालीन रिश्तेदार स्कैम',
    'Credential / OTP Extraction Request': 'OTP व पासवर्ड मांगने का प्रयास',
    'Remote Desktop App Request': 'रिमोट ऐप डाउनलोड अनुरोध',
    'Advance Fee & Impersonation Scam': 'लॉटरी व एडवांस फीस स्कैम',
    'Task / Work-From-Home Job Scam': 'घर बैठे टास्क व जॉब स्कैम',
    'Fake Investment / Instant Loan Scam': 'फर्जी निवेश व तुरंत लोन स्कैम',
    'Urgency Coercion & Account Threat': 'खाता बंद होने की चेतावनी',
    'Payment Manipulation / Over-Refund Trick': 'गलत ट्रांसफर व रिफंड ट्रिक',
    'Unrecognized Payment Handle': 'अविश्वसनीय UPI हैंडल',
    'Malformed Payee Address': 'त्रुटिपूर्ण भुगतान पता',
    'High-Risk TLD in QR Payload': 'QR कोड में संदिग्ध लिंक',
    'Deepfake Voice Cloning Detected': 'AI वॉइस डीपफेक पहचान हुई'
  },
  gu: {
    'Suspicious Phishing TLD Link': 'શંકાસ્પદ ફિશિંગ લિંક',
    'Shortened Destination URL': 'ટૂંકી કરેલી URL લિંક',
    'Unencrypted HTTP Link': 'અસુરક્ષિત HTTP લિંક',
    'Unprefixed Phishing Domain': 'શંકાસ્પદ ફિશિંગ ડોમેન',
    'Digital Arrest & Police / Govt Coercion': 'ડિજિટલ અરેસ્ટ સ્કેમ',
    'Relative / Landlord Emergency Fraud': 'કટોકટી સંબંધી સ્કેમ',
    'Credential / OTP Extraction Request': 'OTP અને પાસવર્ડ ચોરીનો પ્રયાસ',
    'Remote Desktop App Request': 'રિમોટ એપ ડાઉનલોડ વિનંતી',
    'Advance Fee & Impersonation Scam': 'ઇનામ અને એડવાન્સ ફી સ્કેમ',
    'Task / Work-From-Home Job Scam': 'ઘર બેઠા કામ અને ટાસ્ક સ્કેમ',
    'Fake Investment / Instant Loan Scam': 'નકલી રોકાણ અને ત્વરિત લોન સ્કેમ',
    'Urgency Coercion & Account Threat': 'એકાઉન્ટ બ્લોકની ચેતવણી',
    'Payment Manipulation / Over-Refund Trick': 'ખોટા પૈસા ટ્રાન્સફર ટ્રિક',
    'Unrecognized Payment Handle': 'અવિશ્વસનીય UPI હેન્ડલ',
    'Deepfake Voice Cloning Detected': 'AI વૉઇસ ડીપફેક ઓળખાયો'
  },
  ta: {
    'Suspicious Phishing TLD Link': 'சந்தேகத்திற்குரிய ஃபிஷிங் இணைப்பு',
    'Digital Arrest & Police / Govt Coercion': 'டிஜிட்டல் கைது மோசடி',
    'Credential / OTP Extraction Request': 'OTP மற்றும் வங்கி விவரங்கள் திருட்டு',
    'Advance Fee & Impersonation Scam': 'லாட்டரி மற்றும் பரிசு மோசடி',
    'Deepfake Voice Cloning Detected': 'AI குரல் மோசடி கண்டறியப்பட்டது'
  },
  te: {
    'Suspicious Phishing TLD Link': 'సందేహాస్పద ఫిషింగ్ లింక్',
    'Digital Arrest & Police / Govt Coercion': 'డిజిటల్ అరెస్ట్ మరియు బెదిరింపు',
    'Credential / OTP Extraction Request': 'OTP మరియు బ్యాంకింగ్ సమాచారం దొంగతనం',
    'Advance Fee & Impersonation Scam': 'లాటరీ మరియు బహుమతి స్కామ్',
    'Deepfake Voice Cloning Detected': 'AI వాయిస్ క్లోనింగ్ గుర్తించబడింది'
  },
  kn: {
    'Suspicious Phishing TLD Link': 'ಸಂದೇಹಾಸ್ಪದ ಫಿಷಿಂಗ್ ಲಿಂಕ್',
    'Digital Arrest & Police / Govt Coercion': 'ಡಿಜಿಟಲ್ ಬಂಧನ ವಂಚನೆ',
    'Credential / OTP Extraction Request': 'OTP ಕಳವು ಯತ್ನ',
    'Deepfake Voice Cloning Detected': 'AI ಧ್ವನಿ ನಕಲು ಪತ್ತೆಯಾಗಿದೆ'
  },
  bn: {
    'Suspicious Phishing TLD Link': 'সন্দেহজনক ফিশিং লিংক',
    'Digital Arrest & Police / Govt Coercion': 'ডিজিটাল গ্রেপ্তার ভয় দেখানো',
    'Credential / OTP Extraction Request': 'OTP ও ব্যাংক তথ্য চুরির চেষ্টা',
    'Deepfake Voice Cloning Detected': 'AI ভয়েস ক্লোনিং সনাক্ত হয়েছে'
  },
  mr: {
    'Suspicious Phishing TLD Link': 'संशयास्पद फिशिंग लिंक',
    'Digital Arrest & Police / Govt Coercion': 'डिजिटल अटक व भीती दाखवणे',
    'Credential / OTP Extraction Request': 'OTP माहिती चोरीचा प्रयत्न',
    'Deepfake Voice Cloning Detected': 'AI व्हॉइस क्लोनिंग आढळले'
  },
  pa: {
    'Suspicious Phishing TLD Link': 'ਸ਼ੱਕੀ ਫਿਸ਼ਿੰਗ ਲਿੰਕ',
    'Digital Arrest & Police / Govt Coercion': 'ਡਿਜੀਟਲ ਗ੍ਰਿਫਤਾਰੀ ਦਾ ਡਰ',
    'Credential / OTP Extraction Request': 'OTP ਜਾਣਕਾਰੀ ਚੋਰੀ ਦੀ ਕੋਸ਼ਿਸ਼',
    'Deepfake Voice Cloning Detected': 'AI ਵੌਇਸ ਕਲੋਨਿੰਗ ਪਛਾਣੀ ਗਈ'
  }
};

const explanationsByLang = {
  en: {
    highRisk: (patterns) => `High risk detected! Threat indicators found: ${patterns}. Message contains malicious phishing or fraud coercion patterns.`,
    highRiskGeneral: 'High risk detected! AI security engine flagged content with severe fraud probability.',
    medRisk: (patterns) => `Suspicious patterns flagged: ${patterns}. Content exhibits characteristics commonly associated with scam attempts.`,
    medRiskGeneral: 'Suspicious activity flagged. Analysis detected potential risk anomalies requiring caution.',
    lowRisk: 'No suspicious scam indicators found. Content matches standard legitimate communication patterns.',
    recUPIHigh: 'DO NOT transfer money or scan this payment QR code. Verify payee identity directly through official banking channels.',
    recVoiceHigh: 'Disconnect call immediately. Do not share OTPs, passwords, or personal details. Confirm caller identity via official numbers.',
    recSMSHigh: 'DO NOT click any links, share OTPs, or transfer money. Block sender and report to national Cyber Fraud Helpline 1930.',
    recUPIMed: 'Confirm payee name and bank details on payment screen before entering UPI PIN.',
    recVoiceMed: 'Exercise caution. Verify suspicious requests directly through official bank customer support.',
    recSMSMed: 'Exercise caution. Verify the sender through official channels before acting on urgent requests.',
    recLow: 'Standard security practices apply. Never share your confidential UPI PIN or banking OTPs with anyone.'
  },
  hi: {
    highRisk: (patterns) => `उच्च जोखिम की पहचान हुई! पाए गए खतरे के संकेतक: ${patterns}। संदेश में धोखाधड़ी और फ़िशिंग पैटर्न शामिल हैं।`,
    highRiskGeneral: 'उच्च जोखिम की पहचान हुई! AI सुरक्षा इंजन ने इस सामग्री को धोखाधड़ी के रूप में चिह्नित किया है।',
    medRisk: (patterns) => `संदिग्ध पैटर्न चिह्नित: ${patterns}। इस सामग्री में धोखाधड़ी के प्रयास से जुड़े लक्षण हैं।`,
    medRiskGeneral: 'संदिग्ध गतिविधि की पहचान हुई। सावधानी बरतने की आवश्यकता है।',
    lowRisk: 'कोई संदिग्ध स्कैम संकेतक नहीं मिला। सामग्री सामान्य और सुरक्षित प्रतीत होती है।',
    recUPIHigh: 'पैसे ट्रांसफर न करें और न ही QR स्कैन करें। बैंक चैनलों के माध्यम से प्राप्तकर्ता की पुष्टि करें।',
    recVoiceHigh: 'कॉल तुरंत काटें। OTP या पासवर्ड साझा न करें। 1930 पर रिपोर्ट करें।',
    recSMSHigh: 'किसी भी लिंक पर क्लिक न करें और न ही पैसे ट्रांसफर करें। 1930 साइबर हेल्पलाइन पर रिपोर्ट करें।',
    recUPIMed: 'UPI PIN दर्ज करने से पहले भुगतान स्क्रीन पर प्राप्तकर्ता का नाम और बैंक विवरण सत्यापित करें।',
    recVoiceMed: 'सावधानी बरतें। बैंक ग्राहक सेवा नंबर से पुष्टि करें।',
    recSMSMed: 'सावधानी बरतें। आधिकारिक चैनलों के माध्यम से प्रेषक की पुष्टि करें।',
    recLow: 'मानक सुरक्षा अभ्यास लागू होते हैं। अपना UPI PIN या बैंक OTP कभी किसी से साझा न करें।'
  },
  gu: {
    highRisk: (patterns) => `ઉચ્ચ જોખમ મળી આવ્યું! શોધાયેલ ખતરાના સૂચકો: ${patterns}. આ સંદેશમાં ફિશિંગ અને ફ્રોડ પેટર્ન છે.`,
    highRiskGeneral: 'ઉચ્ચ જોખમ મળી આવ્યું! AI સુરક્ષા એન્જિને આ સામગ્રીને ફ્રોડ તરીકે ચિહ્નિત કરી છે.',
    medRisk: (patterns) => `શંકાસ્પદ પેટર્ન ચિહ્નિત: ${patterns}. આ સામગ્રીમાં સ્કેમના લક્ષણો છે.`,
    medRiskGeneral: 'શંકાસ્પદ પ્રવૃત્તિ મળી આવી. સાવચેતી રાખવી જરૂરી છે.',
    lowRisk: 'કોઈ શંકાસ્પદ સ્કેમ સૂચક મળ્યા નથી. સામગ્રી સામાન્ય અને સુરક્ષિત જણાય છે.',
    recUPIHigh: 'નાણાં ટ્રાન્સફર કરશો નહીં અથવા QR સ્કેન કરશો નહીં. બેંક મારફતે ચકાસણી કરો.',
    recVoiceHigh: 'કૉલ તરત જ કાપી નાખો. OTP અથવા પાસવર્ડ શેર કરશો નહીં. 1930 પર રિપોર્ટ કરો.',
    recSMSHigh: 'કોઈપણ લિંક પર ક્લિક કરશો નહીં અથવા નાણાં ટ્રાન્સફર કરશો નહીં. 1930 હેલ્પલાઇન પર રિપોર્ટ કરો.',
    recUPIMed: 'UPI PIN દાખલ કરતા પહેલા ચુકવણી સ્ક્રીન પર નામ ચકાસો.',
    recVoiceMed: 'સાવચેતી રાખો. બેંક ગ્રાહક સેવા નંબર પરથી ખાતરી કરો.',
    recSMSMed: 'સાવચેતી રાખો. સત્તાવાર માધ્યમો દ્વારા ખાતરી કરો.',
    recLow: 'સામાન્ય સુરક્ષા નિયમો લાગુ પડે છે. તમારો UPI PIN અથવા OTP ક્યારેય કોઈ સાથે શેર કરશો નહીં.'
  },
  ta: {
    highRisk: (patterns) => `அதிக ஆபத்து கண்டறியப்பட்டது! அச்சுறுத்தல் குறிகாட்டிகள்: ${patterns}. இந்த செய்தியில் மோசடி வடிவங்கள் உள்ளன.`,
    highRiskGeneral: 'அதிக ஆபத்து கண்டறியப்பட்டது! AI பாதுகாப்பு எஞ்சின் இதை மோசடியாகக் குறித்துள்ளது.',
    medRisk: (patterns) => `சந்தேகத்திற்குரிய வடிவங்கள்: ${patterns}. எச்சரிக்கையுடன் இருக்கவும்.`,
    medRiskGeneral: 'சந்தேகத்திற்குரிய நடவடிக்கை கண்டறியப்பட்டது. எச்சரிக்கை தேவை.',
    lowRisk: 'சந்தேகத்திற்குரிய குறிகாட்டிகள் எதுவும் காணப்படவில்லை. செய்தி பாதுகாப்பானது.',
    recUPIHigh: 'பணம் அனுப்ப வேண்டாம் அல்லது QR ஸ்கேன் செய்ய வேண்டாம். வங்கியைத் தொடர்பு கொள்ளவும்.',
    recVoiceHigh: 'அழைப்பை உடனடியாக துண்டிக்கவும். OTP அல்லது கடவுச்சொல்லைப் பகிர வேண்டாம்.',
    recSMSHigh: 'இணைப்புகளைக் கிளிக் செய்ய வேண்டாம். 1930 சைபர் ஹெல்ப்லைனில் புகாரளிக்கவும்.',
    recUPIMed: 'UPI PIN ஐ உள்ளிடுவதற்கு முன் பெயரை சரிபார்க்கவும்.',
    recVoiceMed: 'எச்சரிக்கையுடன் செயல்படவும். வங்கி சேவை மூலம் சரிபார்க்கவும்.',
    recSMSMed: 'அதிகாரப்பூர்வ சேனல்கள் மூலம் சரிபார்க்கவும்.',
    recLow: 'உங்கள் UPI PIN அல்லது OTP ஐ யாருடனும் பகிர வேண்டாம்.'
  },
  te: {
    highRisk: (patterns) => `అధిక ప్రమాదం గుర్తించబడింది! ముప్పు సూచికలు: ${patterns}. ఈ సందేశంలో మోసపూరిత వివరాలు ఉన్నాయి.`,
    highRiskGeneral: 'అధిక ప్రమాదం గుర్తించబడింది! AI సెక్యూరిటీ ఇంజిన్ తీవ్రమైన మోసాన్ని గుర్తించింది.',
    medRisk: (patterns) => `సందేహాస్పద నమూనాలు: ${patterns}. జాగ్రత్త వహించండి.`,
    medRiskGeneral: 'సందేహాస్పద కార్యకలాపం గుర్తించబడింది.',
    lowRisk: 'ఎటువంటి సందేహాస్పద స్కామ్ సూచికలు కనుగొనబడలేదు. సందేశం సురక్షితమైనది.',
    recUPIHigh: 'డబ్బు ట్రాన్స్‌ఫర్ చేయవద్దు లేదా QR స్కాన్ చేయవద్దు. బ్యాంక్ ద్వారా ధృవీకరించుకోండి.',
    recVoiceHigh: 'వెంటనే కాల్ కట్ చేయండి. OTP లు లేదా పాస్‌వర్డ్‌లను పంచుకోవద్దు.',
    recSMSHigh: 'ఏ లింక్‌లను క్లిక్ చేయవద్దు. 1930 సైబర్ హెల్ప్‌లైన్‌కు నివేదించండి.',
    recUPIMed: 'UPI PIN ఎంటర్ చేసే ముందు చెల్లింపు స్క్రీన్‌పై వివరాలను సరిచూసుకోండి.',
    recVoiceMed: 'జాగ్రత్త వహించండి. బ్యాంక్ కస్టమర్ కేర్ ద్వారా ధృవీకరించుకోండి.',
    recSMSMed: 'అధికారిక మార్గాల ద్వారా వివరాలను నిర్ధారించుకోండి.',
    recLow: 'మీ UPI PIN లేదా OTP ని ఎవరితోనూ పంచుకోవద్దు.'
  },
  kn: {
    highRisk: (patterns) => `ಹೆಚ್ಚಿನ ಅಪಾಯ ಪತ್ತೆಯಾಗಿದೆ! ಬೆದರಿಕೆ ಸೂಚಕಗಳು: ${patterns}. ಈ ಸಂದೇಶದಲ್ಲಿ ವಂಚನೆಯ ಲಕ್ಷಣಗಳಿವೆ.`,
    highRiskGeneral: 'ಹೆಚ್ಚಿನ ಅಪಾಯ ಪತ್ತೆಯಾಗಿದೆ! AI ಭದ್ರತಾ ಎಂಜಿನ್ ವಂಚನೆಯನ್ನು ಗುರುತಿಸಿದೆ.',
    medRisk: (patterns) => `ಸಂದೇಹಾಸ್ಪದ ಮಾದರಿಗಳು: ${patterns}. ಎಚ್ಚರಿಕೆ ವಹಿಸಿ.`,
    medRiskGeneral: 'ಸಂದೇಹಾಸ್ಪದ ಚಟುವಟಿಕೆ ಪತ್ತೆಯಾಗಿದೆ.',
    lowRisk: 'ಯಾವುದೇ ಸಂದೇಹಾಸ್ಪದ ಸೂಚಕಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಸಂದೇಶವು ಸುರಕ್ಷಿತವಾಗಿದೆ.',
    recUPIHigh: 'ಹಣ ಕಳುಹಿಸಬೇಡಿ ಅಥವಾ QR ಸ್ಕ್ಯಾನ್ ಮಾಡಬೇಡಿ. ಬ್ಯಾಂಕ್ ಮೂಲಕ ಪರಿಶೀಲಿಸಿ.',
    recVoiceHigh: 'ತಕ್ಷಣ ಕರೆ ಕಟ್ ಮಾಡಿ. OTP ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ.',
    recSMSHigh: 'ಯಾವ ಲಿಂಕ್ ಅನ್ನೂ ಕ್ಲಿಕ್ ಮಾಡಬೇಡಿ. 1930 ಹೆಲ್ಪ್‌ಲೈನ್‌ಗೆ ದೂರು ನೀಡಿ.',
    recUPIMed: 'UPI PIN ನಮೂದಿಸುವ ಮೊದಲು ಹೆಸರು ಪರಿಶೀಲಿಸಿ.',
    recVoiceMed: 'ಎಚ್ಚರಿಕೆಯಿಂದಿರಿ. ಬ್ಯಾಂಕ್ ಗ್ರಾಹಕ ಸೇವೆಯಿಂದ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.',
    recSMSMed: 'ಅಧಿಕೃತ ಮೂಲಗಳಿಂದ ಪರಿಶೀಲಿಸಿ.',
    recLow: 'ನಿಮ್ಮ UPI PIN ಅಥವಾ OTP ಅನ್ನು ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ.'
  },
  bn: {
    highRisk: (patterns) => `উচ্চ ঝুঁকি শনাক্ত হয়েছে! সনাক্তকৃত হুমকি: ${patterns}। বার্তায় জালিয়াতির প্যাটার্ন রয়েছে।`,
    highRiskGeneral: 'উচ্চ ঝুঁকি শনাক্ত হয়েছে! AI সিকিউরিটি ইঞ্জিন এটিকে জালিয়াতি হিসেবে চিহ্নিত করেছে।',
    medRisk: (patterns) => `সন্দেহজনক প্যাটার্ন: ${patterns}। সতর্ক থাকুন।`,
    medRiskGeneral: 'সন্দেহজনক কার্যকলাপ শনাক্ত হয়েছে।',
    lowRisk: 'কোনো সন্দেহজনক স্ক্যাম নির্দেশক পাওয়া যায়নি। বার্তাটি নিরাপদ।',
    recUPIHigh: 'টাকা পাঠাবেন না বা QR স্ক্যান করবেন না। ব্যাংকের মাধ্যমে যাচাই করুন।',
    recVoiceHigh: 'কলটি কেটে দিন। OTP বা পাসওয়ার্ড শেয়ার করবেন না।',
    recSMSHigh: 'কোনো লিংকে ক্লিক করবেন না। ১৯৩০ হেল্পলাইনে অভিযোগ করুন।',
    recUPIMed: 'UPI PIN দেওয়ার আগে নাম যাচাই করুন।',
    recVoiceMed: 'সতর্ক থাকুন। ব্যাংক কাস্টমার কেয়ারের মাধ্যমে নিশ্চিত হন।',
    recSMSMed: 'অফিসিয়াল মাধ্যমে যাচাই করুন।',
    recLow: 'আপনার UPI PIN বা OTP কারো সাথে শেয়ার করবেন না।'
  },
  mr: {
    highRisk: (patterns) => `उच्च जोखीम आढळली! धोक्याचे संकेत: ${patterns}. या संदेशात फसवणुकीचे पॅटर्न आहेत.`,
    highRiskGeneral: 'उच्च जोखीम आढळली! AI सुरक्षा इंजिनने फसवणूक ओळखली आहे.',
    medRisk: (patterns) => `संशयास्पद पॅटर्न: ${patterns}. काळजी घ्या.`,
    medRiskGeneral: 'संशयास्पद हालचाली आढळल्या.',
    lowRisk: 'कोणतेही संशयास्पद संकेत आढळले नाहीत. संदेश सुरक्षित वाटतो.',
    recUPIHigh: 'पैसे पाठवू नका किंवा QR स्कॅन करू नका. बँकेकडून खात्री करा.',
    recVoiceHigh: 'कॉल लगेच कट करा. OTP किंवा पासवर्ड शेअर करू नका.',
    recSMSHigh: 'कोणत्याही लिंकवर क्लिक करू नका. १९३० वर तक्रार करा.',
    recUPIMed: 'UPI PIN टाकण्यापूर्वी नाव तपासा.',
    recVoiceMed: 'काळजी घ्या. बँक कस्टमर केअरकडून खात्री करा.',
    recSMSMed: 'अधिकृत माध्यमातून पडताळणी करा.',
    recLow: 'तुमचा UPI PIN किंवा OTP कोणासोबतही शेअर करू नका.'
  },
  pa: {
    highRisk: (patterns) => `ਉੱਚ ਜੋਖਮ ਦੀ ਪਛਾਣ ਹੋਈ! ਖਤਰੇ ਦੇ ਸੰਕੇਤ: ${patterns}। ਸੁਨੇਹੇ ਵਿੱਚ ਧੋਖਾਧੜੀ ਦੇ ਲੱਛਣ ਹਨ।`,
    highRiskGeneral: 'ਉੱਚ ਜੋਖਮ ਦੀ ਪਛਾਣ ਹੋਈ! AI ਸੁਰੱਖਿਆ ਇੰਜਣ ਨੇ ਧੋਖਾਧੜੀ ਦੀ ਪਛਾਣ ਕੀਤੀ ਹੈ।',
    medRisk: (patterns) => `ਸ਼ੱਕੀ ਸੰਕੇਤ: ${patterns}। ਸਾਵਧਾਨੀ ਵਰਤੋ।`,
    medRiskGeneral: 'ਸ਼ੱਕੀ ਗਤੀਵਿਧੀ ਦੀ ਪਛਾਣ ਹੋਈ।',
    lowRisk: 'ਕੋਈ ਸ਼ੱਕੀ ਸੰਕੇਤ ਨਹੀਂ ਮਿਲਿਆ। ਸੁਨੇਹਾ ਸੁਰੱਖਿਅਤ ਹੈ।',
    recUPIHigh: 'ਪੈਸੇ ਨਾ ਭੇਜੋ ਅਤੇ QR ਸਕੈਨ ਨਾ ਕਰੋ। ਬੈਂਕ ਤੋਂ ਪੁਸ਼ਟੀ ਕਰੋ।',
    recVoiceHigh: 'ਕਾਲ ਤੁਰੰਤ ਕੱਟੋ। OTP ਜਾਂ ਪਾਸਵਰਡ ਸਾਂਝਾ ਨਾ ਕਰੋ।',
    recSMSHigh: 'ਕਿਸੇ ਲਿੰਕ \'ਤੇ ਕਲਿੱਕ ਨਾ ਕਰੋ। 1930 \'ਤੇ ਰਿਪੋਰਟ ਕਰੋ।',
    recUPIMed: 'UPI PIN ਭਰਨ ਤੋਂ ਪਹਿਲਾਂ ਨਾਮ ਦੀ ਜਾਂਚ ਕਰੋ।',
    recVoiceMed: 'ਸਾਵਧਾਨੀ ਵਰਤੋ। ਬੈਂਕ ਗਾਹਕ ਸੇਵਾ ਤੋਂ ਪੁਸ਼ਟੀ ਕਰੋ।',
    recSMSMed: 'ਅਧਿਕਾਰਤ ਸਰੋਤਾਂ ਤੋਂ ਪੁਸ਼ਟੀ ਕਰੋ।',
    recLow: 'ਆਪਣਾ UPI PIN ਜਾਂ OTP ਕਿਸੇ ਨਾਲ ਸਾਂਝਾ ਨਾ ਕਰੋ।'
  }
};

class ExplainEngine {
  generate({ riskLevel, detectedPatterns = [], ruleResult = {}, fusionResult = {}, inputType = 'sms', lang = 'en' }) {
    const dict = explanationsByLang[lang] || explanationsByLang.en;
    const langPatternMap = patternTranslations[lang] || {};

    const translatedPatterns = detectedPatterns.map(pat => langPatternMap[pat] || pat);
    const patternsText = translatedPatterns.length > 0 ? translatedPatterns.join(', ') : 'None';

    let explanation = '';
    let recommendation = '';

    if (riskLevel === 'HIGH') {
      if (detectedPatterns.length > 0) {
        explanation = dict.highRisk(patternsText);
      } else {
        explanation = dict.highRiskGeneral;
      }

      if (inputType === 'upi' || inputType === 'qr') {
        recommendation = dict.recUPIHigh;
      } else if (inputType === 'voice') {
        recommendation = dict.recVoiceHigh;
      } else {
        recommendation = dict.recSMSHigh;
      }
    } else if (riskLevel === 'MEDIUM') {
      if (detectedPatterns.length > 0) {
        explanation = dict.medRisk(patternsText);
      } else {
        explanation = dict.medRiskGeneral;
      }

      if (inputType === 'upi' || inputType === 'qr') {
        recommendation = dict.recUPIMed;
      } else if (inputType === 'voice') {
        recommendation = dict.recVoiceMed;
      } else {
        recommendation = dict.recSMSMed;
      }
    } else {
      explanation = dict.lowRisk;
      recommendation = dict.recLow;
    }

    return {
      explanation,
      recommendation
    };
  }
}

module.exports = new ExplainEngine();
