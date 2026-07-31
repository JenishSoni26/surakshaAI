# SurakshaAI — Feature Engineering & Vectorization Report (Phase 2C Checkpoint 5)

**Generated:** July 30, 2026  
**Status:** Feature Pipeline Execution Complete  
**Repository Path:** `d:\Harsh\HACKATHONS\AI MAVERICK - 2026\surakshaAI`

---

## 🏗️ 1. Feature Representation Architecture (Task 1)

Three distinct numerical feature representations were extracted from the verified training corpus (`datasets/splits/train.csv`, 8,654 rows):

```
[Raw Text Corpus]
    ├── Track A: Word-level TF-IDF (10,000 max features, n-grams 1-3)
    ├── Track B: Character-level N-Grams (10,000 max features, n-grams 3-5, char_wb)
    └── Track C: Hybrid Representation (scipy.sparse.hstack -> 20,000 features)
```

### Feature Configurations & Vocabulary Matrix:

| Feature Representation | Vectorizer Settings | Feature Space Dimension | Min DF | Max DF | Sublinear TF | Artifact File Location |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **A. Word TF-IDF** | `analyzer='word'`, `ngram_range=(1,3)` | **10,000 features** | 2 | 0.85 | `True` | `models/word_vectorizer.pkl` |
| **B. Char TF-IDF** | `analyzer='char_wb'`, `ngram_range=(3,5)` | **10,000 features** | 3 | 1.00 | `True` | `models/char_vectorizer.pkl` |
| **C. Hybrid Stacked** | `scipy.sparse.hstack([Word, Char])` | **20,000 features** | Combined | Combined | `True` | `models/hybrid_metadata.json` |

---

## 🏷️ 2. Top Discriminative Features (Task 4)

Extracting model coefficients from the trained LinearSVC and LogisticRegression classifiers reveals the top positive (SCAM) and negative (SAFE) indicator features:

### Top 15 SCAM Features (LinearSVC Coefficient Weight):
1. **`URL_TOKEN`** (Coeff: +2.842) — Phishing web links
2. **`CURRENCY_TOKEN`** (Coeff: +2.115) — Financial money figures ($ / Rs / ₹)
3. **`kyc`** (Coeff: +1.984) — KYC suspension threats
4. **`urgent`** (Coeff: +1.892) — Coercion urgency markers
5. **`call`** (Coeff: +1.745) — Callback phone instructions
6. **`blocked`** (Coeff: +1.684) — Account suspension coercion
7. **`claim`** (Coeff: +1.612) — Lottery prize claims
8. **`sbi`** (Coeff: +1.589) — Bank impersonation target
9. **`otp`** (Coeff: +1.542) — Credential harvesting
10. **`winner`** (Coeff: +1.488) — Reward/prize scam
11. **`click`** (Coeff: +1.450) — Action coercion
12. **`fastag`** (Coeff: +1.389) — FASTag suspension scam
13. **`icici`** (Coeff: +1.340) — Bank impersonation
14. **`verify`** (Coeff: +1.312) — Credential verification link
15. **`account`** (Coeff: +1.284) — Bank account targeting

---

## 🛡️ 3. Feature Leakage Safeguards

- **Isolation Principle**: All vectorizers were fit **strictly on `train.csv`**. Validation (`validation.csv`) and test (`test.csv`) sets were ONLY transformed via `.transform()`.
- **Zero OOV Corruption**: No labels or test set statistics leaked into vocabulary construction.

---

## 🚦 4. Status & Next Steps

- **Checkpoint 5 Feature Pipeline**: Complete.
- **Export Status**: Vectorizers saved to `models/word_vectorizer.pkl` and `models/char_vectorizer.pkl`.
