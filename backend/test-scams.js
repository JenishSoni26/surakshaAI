const scansRouter = require('./routes/scans');
const mockDb = { run: () => {} };
const router = scansRouter(mockDb);

const assert = require('assert');

function callHandler(route, body) {
  let responseData = null;
  let statusCode = 200;
  
  const req = { body, user: { id: 'test-user-123' } };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    }
  };

  const layer = router.stack.find(s => s.route && s.route.path === route);
  if (!layer) throw new Error(`Route ${route} not found`);
  
  const handlers = layer.route.stack.map(s => s.handle);
  const mainHandler = handlers[handlers.length - 1];
  
  mainHandler(req, res);
  return { statusCode, data: responseData };
}

console.log('===============================================================');
console.log('🧪 SURAKSHAPAY COMPREHENSIVE MULTI-LANGUAGE SCAM SUITE');
console.log('===============================================================\n');

let totalTests = 0;
let passedTests = 0;

function runTest(category, name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ [${category}] ${name}`);
  } catch (err) {
    console.error(`  ❌ [${category}] ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

// Category 1: User Reported Cases
runTest('USER CASES', 'Gujarati WhatsApp OTP Scam', () => {
  const res = callHandler('/message', {
    text: `મારું WhatsApp એકાઉન્ટ બંધ થવાનું છે.\nતમારો 6 અંકનો OTP મોકલો જેથી એકાઉન્ટ ચાલુ રહે.`,
    lang: 'gu'
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'blocked');
  assert(res.data.risk_score >= 50);
});

runTest('USER CASES', 'English ATM Card Block 30-Min Urgency OTP Scam', () => {
  const res = callHandler('/message', {
    text: `Your ATM card will be blocked within 30 minutes.\nPlease share the OTP sent to your phone to keep your card active.`,
    lang: 'en'
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'blocked');
  assert(res.data.risk_score >= 50);
});

runTest('USER CASES', 'Gujarati Parcel Stuck ₹25 Delivery Charge Phishing', () => {
  const res = callHandler('/message', {
    text: `તમારું પાર્સલ અટકી ગયું છે.\n₹25 ડિલિવરી ચાર્જ ચૂકવવા માટે લિંક પર ક્લિક કરો.\nનહીં તો પાર્સલ પરત મોકલવામાં આવશે.`,
    lang: 'gu'
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'blocked');
  assert(res.data.risk_score >= 50);
});

// Category 2: Regional Indian Languages
runTest('REGIONAL', 'Hindi Electricity Connection Cutoff Scam', () => {
  const res = callHandler('/message', {
    text: 'प्रिय ग्राहक आपका बिजली बिल अपडेट नहीं है। आज रात 9:30 बजे बिजली कनेक्शन काट दिया जाएगा। तुरंत कॉल करें।',
    lang: 'hi'
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'blocked');
});

runTest('REGIONAL', 'Tamil Bank Account Block Scam', () => {
  const res = callHandler('/message', {
    text: 'உங்கள் வங்கி கணக்கு தடுக்கப்பட்டது. உடனடியாக புதுப்பிக்க ஓடிபி பகிரவும்.',
    lang: 'ta'
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'blocked');
});

runTest('REGIONAL', 'Telugu Current Bill Cutoff Scam', () => {
  const res = callHandler('/message', {
    text: 'మీ కరెంట్ బిల్లు చెల్లించలేదు. ఈ రాత్రి విద్యుత్ కనెక్షన్ నిలిపివేత చేయబడుతుంది.',
    lang: 'te'
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'blocked');
});

runTest('REGIONAL', 'Kannada Power Cut OTP Scam', () => {
  const res = callHandler('/message', {
    text: 'ನಿಮ್ಮ ವಿದ್ಯುತ್ ಬಿಲ್ ಬಾಕಿ ಇದೆ. ಪವರ್ ಕಟ್ ತಡೆಯಲು ಒಟಿಪಿ ಹಂಚಿಕೊಳ್ಳಿ.',
    lang: 'kn'
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'blocked');
});

runTest('REGIONAL', 'Bengali Lottery Winner Fraud', () => {
  const res = callHandler('/message', {
    text: 'অভিনন্দন! আপনি ২৫ লাখ টাকা লটারি জিতেছেন। প্রসেসিং ফি দিতে ক্লিক করুন।',
    lang: 'bn'
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'blocked');
});

runTest('REGIONAL', 'Marathi Electricity Bill Cutoff Threat', () => {
  const res = callHandler('/message', {
    text: 'तुमचे वीज बिल थकबाकी आहे. आज रात्री वीज कनेक्शन तोडले जाईल. तात्काळ पैसे पाठवा.',
    lang: 'mr'
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'blocked');
});

runTest('REGIONAL', 'Hinglish Account Block & Paise Transfer', () => {
  const res = callHandler('/message', {
    text: 'Dear customer aapka account block ho gaya hai. KYC update karne ke liye link par click karke paise transfer karo.',
    lang: 'en'
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'blocked');
});

// Category 3: Attack Vectors
runTest('ATTACK VECTORS', 'APK Malware Download Prompt', () => {
  const res = callHandler('/message', {
    text: 'Your bank KYC is incomplete. Download and install sbi_update.apk to avoid suspension.',
    lang: 'en'
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'blocked');
});

runTest('ATTACK VECTORS', 'AnyDesk Remote Control App Scam', () => {
  const res = callHandler('/message', {
    text: 'To resolve your bank issue, install AnyDesk app immediately and share screen code.',
    lang: 'en'
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'blocked');
});

runTest('ATTACK VECTORS', 'Digital Arrest CBI Officer Impersonation', () => {
  const res = callHandler('/message', {
    text: 'Digital arrest warrant issued by CBI officer regarding your customs parcel. Join video call immediately.',
    lang: 'en'
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'blocked');
});

// Category 4: Safety Baseline & Payment Verification
runTest('BASELINE', 'Safe Legitimate Friendly Message', () => {
  const res = callHandler('/message', {
    text: 'Hey Rohan, are we still meeting for lunch today at 1 PM near office?',
    lang: 'en'
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'safe');
  assert.strictEqual(res.data.risk_score, 0);
});

runTest('UPI GUARDIAN', 'Verified Merchant Handle (Flipkart)', () => {
  const res = callHandler('/upi', { upiId: 'flipkart@paytm', lang: 'en' });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'verified');
  assert.strictEqual(res.data.risk_score, 5);
});

runTest('UPI GUARDIAN', 'Unknown Untrusted UPI Handle', () => {
  const res = callHandler('/upi', { upiId: 'scammer99@fakebankxyz', lang: 'hi' });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'flagged');
  assert(res.data.risk_score >= 50);
});

runTest('QR SCANNER', 'Phishing URL in QR Code', () => {
  const res = callHandler('/qr', { url: 'http://free-cashback-reward.xyz', lang: 'gu' });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'blocked');
  assert(res.data.risk_score >= 50);
});

console.log('\n===============================================================');
console.log(`📊 TOTAL SUITE RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
console.log('===============================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
console.log('✨ All 17 Comprehensive Multi-Language Scam Tests Passed Successfully!\n');
