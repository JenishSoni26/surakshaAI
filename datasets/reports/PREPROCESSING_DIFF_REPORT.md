# SurakshaAI — Preprocessing Dataset Lineage & Diff Report (Phase 2C Checkpoint 3)

**Generated:** July 30, 2026  
**Pipeline Execution Status:** Completed & Audited  
**Repository Path:** `d:\Harsh\HACKATHONS\AI MAVERICK - 2026\surakshaAI`

---

## 🏛️ 1. Reproducible Dataset Lineage Architecture

The dataset transformation pipeline enforces complete auditability across 4 isolated physical stages under `datasets/`:

```
datasets/
├── raw/         # Raw original input datasets (Immutable, 17,333 rows)
├── filtered/    # Structural cleaning only (Length thresholding & null removal, 16,603 rows)
├── normalized/  # Text normalization & placeholder token injection (16,603 rows)
├── processed/   # ML-ready deduplicated datasets (Track A & Track B, 10,818 rows)
└── reports/     # Execution logs, diffs, and audit reports
```

---

## 📊 2. Stage-by-Stage Row Count & Transformation Lineage

| Transformation Stage | Active File Path | Total Rows | Rows Removed / Changed | Cumulative Retention % | Stage Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Stage 1: Raw Input** | `datasets/raw/` | **17,333** | — | 100.00% | Initial sum of raw `combined_dataset.csv` (10.9k), `SMSSpamCollection` (5.5k), and `synthetic_800` (800). |
| **Stage 2: Filtered** | `datasets/filtered/filtered_all.csv` | **16,603** | -730 rows | 95.79% | Structural cleaning: dropped 16 empty rows & 714 non-SMS email dumps (>2000 chars). No text normalization applied. |
| **Stage 3: Normalized** | `datasets/normalized/normalized_all.csv` | **16,603** | 0 rows (2,603 tokens replaced) | 95.79% | Text normalization: HTML tag stripping, Unicode NFKC, and placeholder token injection (`URL_TOKEN`, `PHONE_TOKEN`, etc.). |
| **Stage 4: Processed (Track A)** | `datasets/processed/cleaned_trackA.csv` | **10,818** | -5,785 duplicates | **62.41%** | ML-ready master dataset with case preserved. Deduplicated cross-dataset and internal repeated templates. |
| **Stage 4: Processed (Track B)** | `datasets/processed/cleaned_trackB.csv` | **10,818** | 0 rows (lowercased) | **62.41%** | ML-ready master dataset lowercased for Track B vectorization. |

---

## 🔎 3. Detailed Operational Breakdown

### A. Structural Removal Audit:
- **Empty / Null Message Rows Removed:** 16 rows
- **Non-SMS Corporate Email Dumps Removed (>2000 chars):** 714 rows
- **Raw HTML Web Document Dumps Removed:** 0 rows *(HTML tags inside text stripped in Stage 3)*
- **Total Structural Rows Filtered:** **730 rows**

### B. Placeholder Token Injection Audit (Stage 3):
- **`URL_TOKEN` Replacements:** 465 occurrences
- **`PHONE_TOKEN` Replacements:** 33 occurrences
- **`EMAIL_TOKEN` Replacements:** 25 occurrences
- **`CURRENCY_TOKEN` Replacements:** 2,080 occurrences
- **Total Placeholders Injected:** **2,603 semantic tokens**

### C. Deduplication Audit (Stage 4):
- **Cross-Dataset Duplicates Removed (Combined ↔ UCI):** 4,605 rows
- **Synthetic Duplicate Templates Removed (`"Monthly account statement..."`):** 78 rows
- **Internal Dataset Duplicates Removed:** 1,102 rows
- **Total Duplicate Rows Removed:** **5,785 rows**

---

## 📈 4. Corpus Impact & Statistics Comparison

| Metric | Raw Input Corpus (Stage 1) | Final Processed Corpus (Stage 4) | Absolute Delta | Impact Analysis |
| :--- | :--- | :--- | :--- | :--- |
| **Total Rows** | 17,333 | **10,818** | -6,515 rows (-37.6%) | Removed email noise and duplicate bias. |
| **SAFE Class Count** | 13,780 (79.50%) | **8,208 (75.87%)** | -5,572 rows | Dropped redundant safe emails/SMS. |
| **SCAM Class Count** | 3,553 (20.50%) | **2,610 (24.13%)** | -943 rows | Retained 73.5% of scam examples. |
| **Class Ratio (SAFE : SCAM)** | 3.88 : 1 | **3.14 : 1** | **+23% better balance** | Improved class balance naturally. |
| **Average Message Length** | 364.57 chars | **280.47 chars** | -84.10 chars (-23.1%) | Shifted average closer to SMS length profile. |
| **Vocabulary Size (words)** | 58,998 words | **38,433 words** | -20,565 words (-34.9%) | Successfully eliminated email/web HTML code noise. |

---

## 🚦 5. Checkpoint 3 Completion Verdict

- **Lineage Integrity**: Verified. Intermediate files saved under `datasets/filtered/`, `datasets/normalized/`, and `datasets/processed/`.
- **Benchmark Isolation**: Verified. `backend/tests/datasets/scamMessages.json` (120 test cases) was NOT touched or included in any stage.
- **Checkpoint Status**: **Checkpoint 3 Complete**.
- **Next Step**: Awaiting user approval to proceed to **CHECKPOINT 4 — Dataset Merge**.
