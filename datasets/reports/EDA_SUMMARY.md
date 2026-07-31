# SurakshaAI — Executive Summary: Exploratory Data Analysis (EDA)

**Phase 2C Checkpoint 2**

---

## 📌 Executive Findings

1. **Scam Messages Are 75%–100% Longer**:
   Across all datasets, scam messages average **138–800 characters** vs **52–454 characters** for safe messages. Scammers pack urgent call-to-actions, URLs, phone numbers, and instructions into their payloads.

2. **Public Datasets Have Zero Coverage of Indian Financial Vectors**:
   Global datasets (UCI, Kaggle) contain **0% occurrences** of `UPI`, `KYC`, `OTP`, `Aadhaar`, `FASTag`, and major Indian banks (`SBI`, `HDFC`, `ICICI`, `Kotak`, `Canara`, `PNB`). The synthetic dataset supplies 100% of this critical regional coverage.

3. **URL & Pattern Density**:
   Phishing URLs are **40x more frequent** in scam messages (15.14%) than in legitimate messages (0.38%). Currency symbols appear in **43.57% of scam messages**.

4. **Class Imbalance**:
   The merged training corpus contains **79.5% SAFE** and **20.5% SCAM** messages (~4:1 ratio). Using `class_weight='balanced'` in ML models handles this imbalance effectively without artificial oversampling.

---

## 📋 Recommended Preprocessing & Feature Engineering Rules

- **Cleaning Rules (to apply in Checkpoint 3)**:
  - Filter out records >2,000 characters (removes email dumps and web page scrapings).
  - Remove empty/null message rows (16 rows).
  - Deduplicate synthetic dataset (removes 78 copies of `"Monthly account statement is available in net banking."`).
  - Strip raw HTML tags.
- **Feature Extraction**:
  - Combine Word TF-IDF (n-grams 1–3) with Char N-Grams (3–5) to capture both semantic phrases and typo-obfuscated terms.

---

## 🚦 Status & Next Steps

- **Checkpoint 2 Status**: Complete (Read-Only Analysis).
- **Awaiting User Approval** to proceed to **CHECKPOINT 3 — Data Cleaning**.
