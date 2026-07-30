# SurakshaAI — Dataset Inventory & Discovery Report (Phase 2C Checkpoint 1 - Final)

**Generated:** July 30, 2026  
**Repository Path:** `d:\Harsh\HACKATHONS\AI MAVERICK - 2026\surakshaAI`

---

## 📁 1. Prepared Dataset Directory Structure

The repository folder structure for Phase 2C dataset management has been prepared under `datasets/`:

```
datasets/
├── raw/        # Untouched original raw dataset files
├── cleaned/    # Normalized and deduplicated individual datasets
├── processed/  # Final master merged dataset and train/val/test splits
├── augmented/  # Reserved for future targeted domain augmentations
└── reports/    # Dataset discovery, duplicate analysis, and EDA reports
```

*Note: Raw files remain 100% untouched.*

---

## 📊 2. Master Dataset Inventory & Suitability Summary

| Dataset Filename | Format | Source | Total Rows | Quality Score | Suitable Role | Synthetic? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`combined_dataset.csv`** | CSV | Kaggle Combined Public Datasets | 10,961 | **9.2 / 10** | **Training** | No |
| **`SMSSpamCollection`** *(archive)* | TSV | UCI Machine Learning Repository | 5,572 | **8.8 / 10** | **Training** | No |
| **`indian_financial_messages_synthetic_800.xlsx`** | XLSX | Custom Indian Financial Scam Dataset | 800 | **9.5 / 10** | **Training (Domain Augmentation)** | **Yes** |
| **`SMSSpamCollection`** *(sms+spam+collection)* | TSV | UCI Machine Learning Repository | 5,572 | **0.0 / 10** | **EXCLUDED (Redundant Copy)** | No |
| **`scamMessages.json`** | JSON | SurakshaAI Test Framework | 120 | **9.8 / 10** | **EVALUATION ONLY (Strictly Isolated)** | No |

---

## 📈 3. Detailed Dataset Statistics

| Metric | `combined_dataset.csv` | `SMSSpamCollection` (archive) | `indian_financial_messages_synthetic_800.xlsx` |
| :--- | :--- | :--- | :--- |
| **Total Rows** | 10,961 | 5,572 | 800 |
| **Unique Messages** | 10,266 | 5,158 | 722 |
| **Duplicate Count** | 695 | 414 | 78 |
| **Duplicate %** | 6.34% | 7.43% | 9.75% |
| **Average Length (chars)** | 530.01 | 80.38 | 72.18 |
| **Median Length (chars)** | 139 | 61 | 72 |
| **Shortest Message (chars)** | 0 | 2 | 42 |
| **Longest Message (chars)** | 31,851 | 910 | 105 |
| **Vocabulary Size (words)** | 54,899 | 8,753 | 884 |
| **Missing Values** | 0 | 0 | 0 |

---

## 🔄 4. Cross-Dataset Overlap & Master Merge Projections

A mild text normalization pass (Unicode NFKC, trimmed whitespace, collapsed spaces; case preserved) was performed to calculate overlap between training datasets:

- **Combined Large SMS ↔ UCI SMS Spam**: **4,605 overlapping messages** (82.65% of UCI dataset is already present in Combined dataset).
- **Combined Large SMS ↔ Synthetic 800**: **0 overlapping messages (0.00%)**.
- **UCI SMS Spam ↔ Synthetic 800**: **0 overlapping messages (0.00%)**.

### Expected Merged Dataset Metrics:
- **Sum of Raw Rows:** 17,333
- **Total Unique Master Rows After Merge:** **11,541 unique messages**
- **Synthetic Dataset Contribution:** 722 unique messages / 11,541 total = **6.26%**
- *Role*: The synthetic dataset acts as **Domain Augmentation** (supplementary training dataset) without dominating the general spam knowledge base.

---

## 🏦 5. Indian Financial Entity Coverage Analysis

Scanning all datasets for essential Indian banking and financial entities demonstrates why `indian_financial_messages_synthetic_800.xlsx` is necessary:

| Entity Keyword | `combined_dataset.csv` (10.9k) | `SMSSpamCollection` (5.5k) | `indian_financial_messages_synthetic_800.xlsx` (800) | Domain Coverage % (Synthetic) |
| :--- | :--- | :--- | :--- | :--- |
| **UPI** | 0 (0.00%) | 0 (0.00%) | **206** | **25.75%** |
| **OTP** | 0 (0.00%) | 0 (0.00%) | **117** | **14.62%** |
| **KYC** | 0 (0.00%) | 0 (0.00%) | **140** | **17.50%** |
| **Aadhaar** | 0 (0.00%) | 0 (0.00%) | **23** | **2.88%** |
| **PAN** | 12 (0.11%) | 1 (0.02%) | **33** | **4.12%** |
| **FASTag** | 0 (0.00%) | 0 (0.00%) | **21** | **2.62%** |
| **SBI** | 0 (0.00%) | 0 (0.00%) | **34** | **4.25%** |
| **HDFC** | 0 (0.00%) | 0 (0.00%) | **41** | **5.12%** |
| **ICICI** | 0 (0.00%) | 0 (0.00%) | **45** | **5.62%** |
| **Axis** | 5 (0.05%) | 1 (0.02%) | **29** | **3.62%** |
| **Kotak** | 0 (0.00%) | 0 (0.00%) | **45** | **5.62%** |
| **Canara** | 0 (0.00%) | 0 (0.00%) | **37** | **4.62%** |
| **BOB** | 343 (3.13%) | 1 (0.02%) | **51** | **6.38%** |
| **PNB** | 0 (0.00%) | 0 (0.00%) | **46** | **5.75%** |
| **QR** | 0 (0.00%) | 0 (0.00%) | **41** | **5.12%** |
| **PIN** | 13 (0.12%) | 5 (0.09%) | **41** | **5.12%** |

*Conclusion:* Global public datasets have near-zero coverage of Indian payment systems (UPI, OTP, KYC, FASTag, Indian banks). Including the synthetic dataset is empirically justified.

---

## 🌐 6. Language Distribution

| Language / Script | `combined_dataset.csv` | `SMSSpamCollection` | Synthetic 800 |
| :--- | :--- | :--- | :--- |
| **English** | 10,952 (99.9%) | 5,566 (99.9%) | 800 (100.0%) |
| **Mixed / Hinglish** | 9 (0.1%) | 6 (0.1%) | 0 (0.0%) |
| **Hindi / Gujarati Script** | 0 (0.0%) | 0 (0.0%) | 0 (0.0%) |

---

## ⭐ 7. Dataset Quality Scores & Justifications

1. **`combined_dataset.csv`** — **Quality Score: 9.2 / 10**
   - *Justification:* Large volume (10,961 rows) and rich vocabulary (54,899 words). Minor duplicate rate (6.34%). Excellent general SMS baseline.
2. **`SMSSpamCollection` (archive)** — **Quality Score: 8.8 / 10**
   - *Justification:* Highly clean, gold-standard academic dataset. However, 82.65% of its entries are already present in `combined_dataset.csv`.
3. **`indian_financial_messages_synthetic_800.xlsx`** — **Quality Score: 9.5 / 10**
   - *Justification:* High domain relevance for Indian financial scams. Balanced 50/50 SAFE/SCAM split. Zero missing values.
4. **`scamMessages.json`** — **Quality Score: 9.8 / 10**
   - *Justification:* Curated 120-message evaluation benchmark. Balanced across 6 categories. Reserved strictly for evaluation.

---

## 🔒 8. Benchmark Isolation Verification

We explicitly verify that `backend/tests/datasets/scamMessages.json`:
- Is **NOT** referenced by training pipelines, validation splits, merging, or feature engineering scripts.
- Is **EXCLUSIVELY** reserved for end-to-end evaluation and regression testing (`node backend/tests/runTests.js`).
- Prevents data leakage between model training and performance verification.
