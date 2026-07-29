# SurakshaAI Automated Evaluation & Regression Testing Framework

A production-quality automated evaluation and regression testing framework built for the SurakshaAI Scam Analyzer. This framework benchmarks the current rule-based heuristic system and enables direct accuracy and safety comparison against future Gemini AI LLM integration.

---

## 📁 Directory Structure

```
backend/tests/
├── datasets/
│   └── scamMessages.json     # 120 realistic test cases across 6 categories
├── reports/
│   ├── latest-report.txt     # Plaintext summary report
│   ├── latest-report.json    # Full JSON evaluation data
│   ├── rule-based-report.json# Rule-based baseline dataset
│   ├── gemini-report.json    # Gemini AI evaluation dataset
│   └── dashboard.html        # Interactive HTML metrics dashboard
├── runTests.js               # Test execution engine
├── compareResults.js         # Benchmark comparison script
├── metrics.js                # Accuracy, F1, & confusion matrix calculator
├── utils.js                  # Report formatter & HTML generator
└── README.md                 # Framework documentation
```

---

## 📊 Dataset Overview (120 Test Messages)

The dataset contains **120 realistic test cases** across 6 distinct categories (20 messages each):

1. **Legitimate Banking Messages** (20 msgs) - Expected: `SAFE` (OTP, Debit/Credit alerts, NEFT, UPI received, ATM withdrawal, Cheque clearance).
2. **Legitimate Ecommerce Messages** (20 msgs) - Expected: `SAFE` (Amazon, Flipkart, Swiggy, Zomato, Blinkit, Courier, Uber/Ola).
3. **Phishing Scams** (20 msgs) - Expected: `HIGH` (Fake bank links, KYC expiry, PAN update, Electricity bill cut, FASTag block).
4. **Financial Fraud** (20 msgs) - Expected: `HIGH` (Lottery, Crypto schemes, Task scams, Instant loans, Stock tips, Customs parcel).
5. **Social Engineering** (20 msgs) - Expected: `HIGH` (Fake son/daughter emergency, Police/CBI digital arrest, Remote app install, OTP share).
6. **Hard Cases** (20 msgs) - Expected: `SAFE` (Contextual challenges: real courier links, friend reimbursement requests, legitimate HR slips).

---

## 🚀 How to Run Tests

### 1. Ensure Backend Server is Running
Before executing tests, ensure the backend API is active:
```bash
npm run dev:backend
```

### 2. Run the Evaluation
Execute the test runner script:
```bash
# Run default evaluation (Rule-Based engine)
node backend/tests/runTests.js

# Specify mode or custom endpoint
node backend/tests/runTests.js --mode Rule-Based --endpoint http://localhost:3001/api/scans/message
```

---

## 📈 Viewing Reports

After evaluation completes, reports are automatically generated in `backend/tests/reports/`:

1. **Console Output**: Displayed directly in terminal.
2. **Text Summary**: `backend/tests/reports/latest-report.txt`
3. **JSON Data**: `backend/tests/reports/latest-report.json`
4. **HTML Dashboard**: Open `backend/tests/reports/dashboard.html` in any browser to view:
   - Accuracy, Precision, Recall & F1 Score cards
   - Category Breakdown Chart (Chart.js)
   - Confusion Matrix (SAFE, MEDIUM, HIGH)
   - False Positives & False Negatives tables
   - Top detected scam indicators
   - Engine recommendations

---

## ⚖️ Comparing Gemini AI vs Rule-Based

To compare performance before and after Gemini AI integration:

1. Run evaluation on Rule-Based engine:
   ```bash
   node backend/tests/runTests.js --mode Rule-Based
   ```
2. Integrate Gemini AI into `/api/scans/message`.
3. Run evaluation on Gemini AI engine:
   ```bash
   node backend/tests/runTests.js --mode "Gemini AI"
   ```
4. Run the comparison engine:
   ```bash
   node backend/tests/compareResults.js
   ```

The script will output accuracy improvement %, reduction in false positives, reduction in false negatives, and category-by-category comparison tables.

---

## ➕ How to Extend the Dataset

To add new test cases, open `backend/tests/datasets/scamMessages.json` and append a new JSON object:

```json
{
  "id": 121,
  "category": "Social Engineering",
  "subcategory": "Fake Police",
  "message": "Your Aadhaar is linked to illegal parcel in Mumbai Customs. Call Inspector NOW.",
  "expected": "HIGH"
}
```
