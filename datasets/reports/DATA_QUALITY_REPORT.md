# SurakshaAI — Data Quality Validation Report (Phase 2C Checkpoint 1.5)

**Generated:** July 30, 2026  
**Status:** Read-Only Quality Inspection Completed  
**Repository Path:** `d:\Harsh\HACKATHONS\AI MAVERICK - 2026\surakshaAI`

---

## 🔍 Executive Summary

During Checkpoint 1, `combined_dataset.csv` exhibited an average message length of **~530 characters** and a maximum message length of **31,851 characters**. 

This read-only inspection confirms that these extreme outliers are **not genuine SMS messages**, but rather **scraped web text, full HTML documents, and corporate email threads (e.g. Enron email dumps)** imported when Kaggle's `combined_dataset.csv` concatenated SMS and Email corpora together.

By contrast, genuine SMS benchmark datasets (`UCI SMS Spam Collection` and `Indian Financial Messages Synthetic 800`) are **98.8% to 100% contained within 0–250 characters**.

---

## 📊 Task 1: Message Length Distribution Analysis

| Message Length Bucket | `combined_dataset.csv` (10,961 rows) | `SMSSpamCollection` archive (5,572 rows) | `indian_financial_messages_synthetic_800` (800 rows) |
| :--- | :--- | :--- | :--- |
| **0 – 50 chars** | 2,484 (22.66%) | 2,335 (41.91%) | 182 (22.75%) |
| **51 – 100 chars** | 2,089 (19.06%) | 1,472 (26.42%) | **598 (74.75%)** |
| **101 – 250 chars** | 2,471 (22.54%) | 1,696 (30.44%) | 20 (2.50%) |
| **251 – 500 chars** | 1,220 (11.13%) | 63 (1.13%) | 0 (0.00%) |
| **501 – 1,000 chars** | 1,125 (10.26%) | 6 (0.11%) | 0 (0.00%) |
| **1,001 – 2,000 chars** | 858 (7.83%) | 0 (0.00%) | 0 (0.00%) |
| **2,001+ chars (Outliers)** | **714 (6.51%)** | **0 (0.00%)** | **0 (0.00%)** |

### Key Observations:
- **Genuine SMS Profile:** In UCI SMS Spam and Synthetic Indian Financial datasets, **0.00%** of messages exceed 1,000 characters.
- **Email/Web Pollution in Combined Dataset:** In `combined_dataset.csv`, **714 messages (6.51%)** exceed 2,000 characters, reaching up to 31,851 characters.

---

## 🔬 Task 2: Outlier Inspection (20 Longest Messages in `combined_dataset.csv`)

| Row Index | Length (chars) | Label | Sample Text Snippet (First 200 chars) | Classification | Empirical Cause |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1060** | 31,851 | `ham` | `fw : " red , white and blue out " - - - - - original message - - - - - from : carter , rhonda [ mailto : rcarter @ cooperinst . org ] sent : friday , september 14 , 2001 12 : 33 pm...` | Email Thread Dump | Corporate Enron email forwarding chain |
| **2099** | 21,740 | `spam` | `online pharxmacy 80 % off all meds disscount phafrmacy onlsine ! ( grasnd opegning , 80 % off all meds , orfder today at your doorstep tomorrow ! ) weisght lorss meridia mesns heablth...` | Scraped Web Page | Scraped online pharmacy advertisement page |
| **4398** | 16,052 | `ham` | `the expatriate zone - issue # 1 2 / 14 / 00 the expatriate zone 1 / 15 / 00 issue # 1 where every day is " just another shitty day in paradise " the zine for the tropically impaired...` | Web Newsletter | Web newsletter publication dump |
| **3671** | 15,990 | `ham` | `fw : thought this was important bammelyoungfamilies - - - - - listbot sponsor - - - - start your own free email list at http : / / www . listbot . com / links...` | Email List Notice | ListBot email distribution chain |
| **4903** | 14,451 | `spam` | `we ' ve got your info by internet , hope to cooperate . html head titlechina inflatables / title meta http - equiv = content - type content = text / html ; charset = gb 2312...` | HTML Document | Raw HTML page source code |
| **5014** | 13,169 | `ham` | `re : coastal oil & gas corporation melissa , deal # 348450 has been created and entered in sitara . in addition , the volume has been edited from 3 , 000 to 1 , 000 on deal # 135714...` | Email Thread Dump | Enron corporate oil & gas trade email |
| **3046** | 13,161 | `ham` | `re : coastal oil & gas corporation daren , fyi . bob - - - - - forwarded by robert cotten / hou / ect on 07 / 28 / 2000 11 : 17 am - - - - - enron north america corp...` | Email Thread Dump | Enron corporate trading log email |
| **939** | 12,821 | `ham` | `re : coastal oil & gas corporation daren , fyi . bob - - - - - forwarded by robert cotten / hou / ect on 07 / 11 / 2000 11 : 48 am - - - - - enron north america corp...` | Email Thread Dump | Enron corporate trading log email |
| **3625** | 11,923 | `spam` | `free profiles you choose derm htmlheadtitlelt ; lt ; subscription derm @ iit . demokritos . gr gt ; gt ; / title / head body marginheight = 0 bgcolor = # 615 e 5 b...` | HTML Page Source | Web page HTML template with CSS tags |
| **4360** | 11,576 | `ham` | `re : sitara release ( re : changes in global due to consent to assignment ) changing counterparty names on sitara deal tickets has absolutely no impact to any downstream processes...` | Email Thread Dump | Corporate software release email thread |
| **5152** | 11,309 | `spam` | `( otcbb : itst ) up 38 % , uregent news alert urgent news alert stock profile press release international telephone services ( its ) is a telecommunications company born in 1995...` | Press Release | Full stock promo press release document |
| **3171** | 11,160 | `spam` | `54 - cy . . . adrian hideout or ( der the best mens products today cialis - ( super viagra ) via ( gra via ( gra soft tabs levitra sa ( ve u ( p t ( o 70 % we ship to all us states...` | Scraped Web Page | Scraped online pharmacy store catalog |
| **2156** | 10,803 | `ham` | `organizational changes we are making a number of significant organizational changes . these changes are intended to accomplish four key objectives : first , we need to realign...` | Corporate Document | Corporate organizational memo |
| **2870** | 10,506 | `ham` | `hpl optimization please make sure your staff receives this if they are not included on the distribution below . i hope all will understand the importance of confidentiality...` | Corporate Memo | Corporate staffing and legal memo |
| **5230** | 10,021 | `ham` | `bpa rate case - seasonal rates - - - - - forwarded by mary hain / hou / ect on 03 / 14 / 2000 08 : 48 am - - - - - enron capital minnesota power and light co...` | Legal Document | Federal energy rate case legal text |
| **330** | 9,896 | `spam` | `breaking news : abdv goes energy epgqlahhkqqltj waanmdp daily traders report nxfahxdbreaking newsvhxcwev lefsqwle - direct to lower prices to record low...` | Stock Spam Email | OTC stock promo email newsletter |
| **3035** | 9,882 | `ham` | `re : path manager rewrite / optimization project since lisa used fuchsia , i ' ll use lavender . . on # 1 i would eliminate that processing . in addition , can we delete...` | Email Thread Dump | Enron software project email thread |
| **3843** | 9,833 | `spam` | `ad - when he said he could make me famous if i gave him head on video i asked him if he the batteries were charged sexually - explicit to their first time / title meta...` | HTML Adult Promo | Scraped adult web page template |
| **699** | 9,485 | `spam` | `impact equity report mineral exploration stockp delta mining and exploration corp . otc : dmxpp controls 6 properties totaling 7 , 554 acres ( approximately 11 sq . miles )...` | Financial Report | Mining company equity promo report |
| **2714** | 9,482 | `spam` | `picks from analyst with high - level precision yap international , inc . ( ypil ) voip technology requires no computer or high speed internet connection for its dial - up product...` | Financial Report | Stock analyst newsletter document |

---

## 🛠️ Task 3: Proposed Objective Cleaning Rules

Based on empirical evidence from Task 1 and Task 2:

1. **Character Length Threshold (Max 2,000 characters)**:
   - Filter out records exceeding **2,000 characters** in length.
   - *Justification:* Genuine SMS messages virtually never exceed 2,000 characters. Removing these 714 records (6.51% of `combined_dataset.csv`) eliminates corporate email dumps and web page scrapings while retaining 100% of SMS content.
2. **HTML / XML Tag Removal**:
   - Strip all `<...>` markup tags during text normalization.
3. **Empty / Null Message Removal**:
   - Remove 16 rows containing empty or whitespace-only strings in `combined_dataset.csv`.

---

## 🔁 Task 4: Synthetic Dataset Duplicate Analysis

- **Inspection Finding:** In `indian_financial_messages_synthetic_800.xlsx`, the exact sentence `"Monthly account statement is available in net banking."` appears **79 times**.
- **Cause:** Template repetition during synthetic dataset generation for legitimate banking notices.
- **Recommendation:** **REMOVE 78 duplicate copies and retain exactly 1 instance** during the upcoming Checkpoint 3 cleaning phase.
- **Technical Justification:** Retaining 79 identical copies of a single generic sentence overweights a single phrase, skews TF-IDF term frequencies, and artificially inflates class priors.

---

## 🛡️ Task 5: Dataset Sanity Check Matrix

| Sanity Check Category | `combined_dataset.csv` | `SMSSpamCollection` archive | `indian_financial_messages_synthetic_800` |
| :--- | :--- | :--- | :--- |
| **Empty / Whitespace Messages** | **16 rows** | 0 | 0 |
| **Null Labels** | 0 | 0 | 0 |
| **Binary Corruption** | 0 | 0 | 0 |
| **Malformed Unicode** | 0 | 0 | 0 |
| **Embedded HTML / Tags** | **6 rows** | 6 rows *(text references)* | 0 |
| **XML Fragments** | 0 | 0 | 0 |
| **JSON Fragments** | 0 | 0 | 0 |
| **Concatenated Email Dumps** | **714 rows (>2000 chars)** | 0 | 0 |

---

## 🚦 Task 6: Final Data Quality Verdict

- **Read-Only Inspection Status**: Complete.
- **Sanity Verdict**: **SAFE TO PROCEED TO CHECKPOINT 2 (EDA)** once these objective cleaning rules are confirmed for Checkpoint 3.
- *Note:* No datasets, files, or records have been modified during this inspection.
