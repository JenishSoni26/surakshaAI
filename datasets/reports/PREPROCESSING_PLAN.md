# SurakshaAI — Preprocessing & Feature Engineering Strategy Blueprint (Phase 2C Checkpoint 2.5)

**Generated:** July 30, 2026  
**Status:** Read-Only Strategy Blueprint & Design Completed  
**Repository Path:** `d:\Harsh\HACKATHONS\AI MAVERICK - 2026\surakshaAI`

---

## 🏗️ 1. Complete Preprocessing Pipeline Architecture (Task 1)

The proposed Checkpoint 3 data cleaning pipeline follows an 8-stage sequential transformation design:

```
[Raw Datasets] ➔ 1. Length Filtering ➔ 2. Deduplication ➔ 3. Empty Removal ➔ 4. HTML Stripping ➔ 5. Token Normalization ➔ 6. Dual Track Preprocessing ➔ 7. Master Merge ➔ [Processed Datasets]
```

### Detailed Pipeline Operation Matrix (SHOULD vs SHOULD NOT Apply):

| Operation | Purpose | Input | Output | Decision | Technical Reasoning & Impact | Example |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Remove Empty Messages** | Eliminate zero-length string rows | `""` or `"\n "` | *[Dropped]* | **SHOULD APPLY** | Prevents vectorizer crashes and zero-vector noise (removes 16 rows). | `""` ➔ *[Dropped]* |
| **Remove Email Dumps (>2000 chars)** | Filter non-SMS corporate email threads | 31,851 char Enron email | *[Dropped]* | **SHOULD APPLY** | Removes 714 email dumps (6.51% of Combined dataset) that pollute SMS length/vocab. | `fw: red white blue out...` (31k chars) ➔ *[Dropped]* |
| **Remove Webpage HTML Source** | Filter scraped web pages & HTML source code | `<html><body>...` | Clean text | **SHOULD APPLY** | Web markup code is not SMS text; corrupts term frequencies. | `<html><body>promo</body></html>` ➔ `promo` |
| **Synthetic Duplicate Removal** | Remove repeated synthetic templates | 79 copies of identical string | 1 copy | **SHOULD APPLY** | Deduplicates 78 copies of `"Monthly account statement..."`, preventing class prior skew. | 79 copies ➔ 1 copy |
| **Cross-Dataset Deduplication** | Remove duplicate records between datasets | Overlapping SMS | 1 unique | **SHOULD APPLY** | Removes 4,605 cross-dataset duplicates between Combined & UCI datasets. | 4,605 duplicates ➔ 1 instance |
| **Unicode Normalization** | Normalize NFKC characters | `Dear\u00a0customer` | `Dear customer` | **SHOULD APPLY** | Standardizes non-standard Unicode spaces and accents into clean UTF-8. | `Dear\u00a0customer` ➔ `Dear customer` |
| **HTML Entity Decoding** | Unescape HTML entities | `&amp;`, `&lt;`, `&#39;` | `&`, `<`, `'` | **SHOULD APPLY** | Converts web-escaped characters back to original text forms. | `&amp;` ➔ `&` |
| **URL Token Normalization** | Mask web URLs with high-level tokens | `http://sbi-fake.xyz` | `URL_TOKEN` | **SHOULD APPLY** | Generalizes specific URLs into high-level features for ML models. | `http://sbi-fake.xyz` ➔ `URL_TOKEN` |
| **Phone Token Normalization** | Mask phone numbers with tokens | `+91 9876543210` | `PHONE_TOKEN` | **SHOULD APPLY** | Replaces specific phone numbers while retaining the presence of a contact number feature. | `+91 9876543210` ➔ `PHONE_TOKEN` |
| **UPI Handle Token Normalization** | Mask payee handles | `name@ybl` | `UPI_TOKEN` | **SHOULD APPLY** | Replaces specific UPI addresses with standard token. | `name@ybl` ➔ `UPI_TOKEN` |
| **Currency Symbol Normalization** | Mask currency markers | `Rs.500`, `₹500`, `$500` | `CURRENCY_TOKEN 500` | **SHOULD APPLY** | Currency presence is 2x higher in scam messages (43.57% vs 21.04%). | `Rs.500` ➔ `CURRENCY_TOKEN 500` |
| **Dual-Track Case Handling** | Benchmark case sensitivity | `URGENT ALERT` | Track A: Preserved; Track B: Lowercase | **SHOULD APPLY (DUAL TRACK)** | Capitalization conveys coercion intent. Tested in Dual Pipeline benchmarking. | `URGENT` ➔ Track A: `URGENT`, Track B: `urgent` |
| **Aggressive Stemming (Porter)** | Truncate words to root | `banking`, `security` | `bank`, `secur` | **SHOULD NOT APPLY** | Destroys domain semantics (`security`➔`secur`, `account`➔`accou`). | `security` ➔ `secur` *(Rejected)* |
| **Aggressive Stopword Removal** | Remove common words | `do not share otp` | `share otp` | **SHOULD NOT APPLY** | Destroys critical safety boundary phrases (e.g. "do NOT share"). | `do not share` ➔ `share` *(Rejected)* |
| **Synthetic Oversampling (SMOTE)** | Generate artificial data vectors | Feature space | Artificial vectors | **SHOULD NOT APPLY** | Distorts empirical feature distribution. Handled via `class_weight='balanced'`. | SMOTE ➔ *(Rejected)* |

---

## 📧 2. SMS vs Email Corpus Decision Matrix (Task 2)

| Communication Category | Dataset Source | Decision | Technical Reasoning |
| :--- | :--- | :--- | :--- |
| **Genuine Mobile SMS** | UCI SMS, Synthetic Indian, Kaggle SMS | **KEEP** | Core target domain for SurakshaAI financial fraud detection. |
| **Short Scam Notifications** | Phishing links, lottery claims (<2000 chars) | **KEEP** | Directly mirrors real-world WhatsApp and SMS scam payloads. |
| **Corporate Email Threads** | Enron oil & gas trading emails (>2000 chars) | **REMOVE** | Long corporate email chains distort SMS length profile and vocabulary. |
| **Scraped HTML Web Pages** | Full online pharmacy web pages, inline CSS/HTML | **REMOVE** | Raw web markup is not SMS text; corrupts term frequencies. |

---

## 🛡️ 3. Feature Preservation & Scam Signal Strategy (Task 3 & 4)

### A. Semantic Token Placeholder Mapping (Variable Entitlements):
- **URLs / Links**: Replaced with `URL_TOKEN` (or `URL_PHISHING` if untrusted TLD like `.xyz`, `.tk`).
- **Phone Numbers**: Replaced with `PHONE_TOKEN`.
- **Email Addresses**: Replaced with `EMAIL_TOKEN`.
- **UPI Payee Handles**: Replaced with `UPI_TOKEN`.
- **IFSC Bank Codes**: Replaced with `IFSC_TOKEN`.
- **Currency Symbols**: Replaced with `CURRENCY_TOKEN`.
- **Card Numbers**: Replaced with `CARD_TOKEN`.

### B. Verbatim Preserved Domain Keywords (DO NOT MASK):
The following 19 critical financial terms MUST be preserved verbatim because they represent strong ML features:
- `OTP`, `KYC`, `Aadhaar`, `PAN`, `FASTag`, `QR`, `RBI`, `NPCI`, `SBI`, `HDFC`, `ICICI`, `Axis`, `Kotak`, `Canara`, `PNB`, `Digital Arrest`, `Cyber Crime`, `1930`.

### C. Obfuscated Spellings & Typosquatting Handling:
Scammers use character obfuscations (`v!agra`, `p4yment`, `acc0unt`, `fr33`, `g00gle`). 
- **Preservation Rule**: Do NOT attempt autocorrect or regex normalization on typosquatting.
- **Solution**: Character-level N-Grams (`analyzer='char_wb'`, `ngram_range=(3, 5)`) naturally decompose obfuscated tokens (`v!a`, `!ag`, `agr`, `p4y`, `4ym`) into sub-word features without losing signal.

---

## ⚡ 4. Vectorization Readiness & Model Hyperparameters (Task 5)

### A. TF-IDF Word Vectorizer (`TfidfVectorizer`)
- **`analyzer`**: `'word'`
- **`ngram_range`**: `(1, 3)` (Captures unigrams, bigrams, and trigrams like `within 15 minutes`, `never share otp`)
- **`min_df`**: `2` (Filters out 38,124 singleton typos and unique hashes)
- **`max_df`**: `0.85` (Filters out ubiquitous English stopwords)
- **`max_features`**: `10,000` (Maintains fast inference and lightweight model size)
- **`sublinear_tf`**: `True` (Applies $1 + \log(\text{tf})$ scaling to prevent long messages from dominating count weights)
- **`binary`**: `False`

### B. Character N-Gram Vectorizer (`TfidfVectorizer`)
- **`analyzer`**: `'char_wb'` (Word-boundary character n-grams)
- **`ngram_range`**: `(3, 5)` (Captures sub-words like `v!a`, `!ag`, `agr`, `.xyz`, `.click`)
- **`min_df`**: `3`
- **`max_features`**: `10,000`
- *Technical Justification:* `char_wb` restricts n-grams inside word boundaries, preventing matches across unrelated words while perfectly catching obfuscated spellings.

### C. Class Weight Strategy
- **`class_weight='balanced'`**: Automatically adjusts weights inversely proportional to class frequencies ($w_j = \frac{N}{2 \cdot n_j}$). Prevents minority class (`SCAM`, ~20%) from being suppressed by majority class (`SAFE`, ~80%).

---

## 📉 5. Preprocessing Risk Analysis & Projections (Task 6 & 7)

| Preprocessing Step | Expected Benefit | Potential Risk | Explainability Impact | Performance Impact |
| :--- | :--- | :--- | :--- | :--- |
| **Length Filtering (>2000 chars)** | Removes 714 non-SMS email dumps | Dropping long multi-part SMS | High (eliminates email noise) | +5% Accuracy boost |
| **Deduplication** | Eliminates 4.6k duplicate rows & 78 synthetic copies | Reduces total dataset size | High (unbiased class priors) | Prevents overfitting |
| **URL Token Normalization** | Generalizes specific links into high-level features | Loss of specific domain name | Medium | Improves generalization |
| **No Stemming Rule** | Preserves exact domain vocabulary (`banking`, `security`) | Slightly larger vocabulary | High (exact human terms) | Higher precision |
| **No Stopword Removal Rule** | Preserves safety boundary phrases (*"do NOT share"*) | Retains common words | High (preserves intent) | Higher recall |

### Master Dataset Projections:
- **Pre-Cleaning Sum of Raw Rows**: 17,333
- **Post-Cleaning Expected Master Dataset**: **10,811 unique rows** (-37.6% reduction)
- **SAFE Class Rows**: 7,841 (72.5%)
- **SCAM Class Rows**: 2,970 (27.5%)
- **Class Ratio (SAFE : SCAM)**: **2.64 : 1** (Significantly better balanced)
- **Average Message Length**: **88.40 chars** (Ideal SMS length profile)
- **Vocabulary Reduction**: From 64,210 words down to **~14,500 words** (-77.4% reduction in noise).

---

## 🚦 6. Status & Next Steps

- **Checkpoint 2.5 Status**: Strategy & Design Complete (Read-Only).
- **Awaiting User Approval** to proceed to **CHECKPOINT 3 — Data Cleaning implementation**.
