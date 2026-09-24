# AutoTally — Questionnaire OMR Scanner

## Full Implementation Plan

---

## Project Summary

A Python desktop app that uses a **phone camera via local WiFi (IP Webcam app)** to scan filled paper questionnaires one section at a time. It detects checked square checkboxes (✓), highlights them on screen for confirmation, then appends results as a new row into `Tally.xlsx`.

---

## Files (READ-ONLY — Never Modified Directly)


| File                                | Path                                                        |
| ------------------------------------- | ------------------------------------------------------------- |
| `Tally.xlsx`                        | `C:\Users\User\OneDrive\Desktop\Tally.xlsx`                 |
| `Adapted_Survey_Questionnaire.docx` | `C:\Users\User\Downloads\Adapted_Survey_Questionnaire.docx` |

---

## Confirmed Questionnaire Structure

### 7 Sections = 7 Scans per Respondent → 1 Row in Excel


| Scan # | Section                          | Excel Column(s)     | Answer Type                 | Options                          |
| -------- | ---------------------------------- | --------------------- | ----------------------------- | ---------------------------------- |
| 1      | Part I — SHS Strand             | Col B               | Single checkbox (3 choices) | 1=STEM, 2=TVL-ICT, 3=Non-Aligned |
| 2      | A. Device Availability           | Col C–G (Q1–Q5)   | Grid (5 rows × 5 cols)     | 1–5 scale                       |
| 3      | B. Internet Connectivity         | Col H–L (Q1–Q5)   | Grid (5 rows × 5 cols)     | 1–5 scale                       |
| 4      | C. Frequency of ICT Use          | Col M–Q (Q1–Q5)   | Grid (5 rows × 5 cols)     | 1–5 scale                       |
| 5      | A. Perceived Academic Difficulty | Col R–V (Q1–Q5)   | Grid (5 rows × 5 cols)     | 1–5 scale                       |
| 6      | B. Computing Self-Efficacy       | Col W–AA (Q1–Q5)  | Grid (5 rows × 5 cols)     | 1–5 scale                       |
| 7      | C. Academic Adjustment Behaviors | Col AB–AF (Q1–Q5) | Grid (5 rows × 5 cols)     | 1–5 scale                       |

### Excel Row Format (1 respondent = 1 row)

```
Col A  | Col B  | Col C–G            | Col H–L                | Col M–Q               | Col R–V                       | Col W–AA                 | Col AB–AF
Row #  | Strand | Device Avail Q1–Q5 | Internet Connect. Q1–5 | Freq. of ICT Use Q1–5 | Perceived Acad. Diff. Q1–5   | Computing Self-Eff. Q1–5 | Acad. Adj. Behav. Q1–5
```

> **Note:** 15 respondents already exist in rows 3–17. Scanner must start from row 18 and auto-increment. NEVER delete or overwrite existing data.

---

## Physical Questionnaire Layout (confirmed from photos)

### Part I (Strand Section)

- 3 vertical square checkboxes beside: STEM / TVL-ICT / Non-Aligned
- Only 1 can be checked
- Check mark style: bold ✓ inside a square box
- Written with ballpen (dark ink)

### Sections A–C / Part II A–C (Grid Tables)

- Table header row: `| No. | Statement | 5 | 4 | 3 | 2 | 1 |`
- 5 rows (Q1–Q5), each row has 5 square checkboxes
- Section title printed above table (e.g., "A. Device Availability")
- Only 1 checkbox checked per row
- Columns go right-to-left: 5=Always, 4=Often, 3=Occasionally, 2=Rarely, 1=Never

---

## Camera Setup

### Requirements

- Android phone with **IP Webcam** app (free — Play Store)
- Phone + PC on the **same WiFi network**
- No internet needed — 100% local

### How to Connect

1. Open IP Webcam on phone → tap **"Start server"**
2. Note the URL shown (e.g., `http://192.168.1.5:8080`)
3. Enter that URL once in the scanner app settings
4. OpenCV connects via: `cv2.VideoCapture("http://192.168.x.x:8080/video")`

### Best Scanning Technique

- Place questionnaire **flat on a table**
- Hold phone **directly above** the paper (bird's-eye view)
- Good lighting = better detection accuracy

---

## App UI Flow

```
┌─────────────────────────────────────┐
│  AUTOTALLY — QUESTIONNAIRE SCANNER  │
│  Respondent #16  [■■□□□□□] 2 of 7  │
│  Now scan: A. Device Availability   │
│                                     │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │    [ LIVE CAMERA FEED ]       │  │
│  │   (green boxes = detected     │  │
│  │    checked checkboxes)        │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
│  Detected: Q1:4  Q2:5  Q3:4  Q4:4  Q5:3  │
│                                     │
│  [CAPTURE]  [RETAKE]  [EDIT]        │
└─────────────────────────────────────┘
```

### Screen States

1. **Live view** — camera feed with real-time checkbox overlay highlights
2. **Capture** — freezes frame, shows detected values for confirmation
3. **Edit** — user can manually correct any wrong detection before saving
4. **Next section** — moves to next scan step with progress bar update
5. **Save** — after all 7 scans done, appends full row to Excel + shows success

---

## Detection Logic (OpenCV)

### For Grid Sections (Scans 2–7)

```
1. Convert frame to grayscale
2. Apply binary threshold → black/white image
3. Detect table grid lines (HoughLinesP or contour detection)
4. Isolate the 5×5 checkbox grid region
5. For each of the 5 rows (Q1–Q5):
   a. Look at each of the 5 checkbox cells
   b. Count dark pixels inside each cell
   c. Cell with the most dark pixels = the checked one
   d. Map column position → value:
      col 1 (leftmost) = 5, col 2 = 4, col 3 = 3, col 4 = 2, col 5 = 1
6. Return list: [Q1_val, Q2_val, Q3_val, Q4_val, Q5_val]
```

### For Part I (Scan 1 — Strand)

```
1. Detect 3 vertical square checkboxes on the left side
2. Count dark pixels inside each checkbox
3. Checkbox with most dark pixels = checked
4. Map position to value:
   top checkbox    = 1 (STEM)
   middle checkbox = 2 (TVL-ICT)
   bottom checkbox = 3 (Non-Aligned)
```

### Visual Overlay

- **Green box** drawn over detected checked checkbox ✅
- **Thin gray box** drawn over empty checkboxes
- Makes it easy to verify before confirming

---

## Project File Structure

```
C:\wamp64\www\AutoTally\
│
├── plan.md              ← This file
├── main.py              ← App entry point, launches the GUI
├── ui.py                ← Tkinter GUI (camera window, buttons, progress bar)
├── camera.py            ← Connects to IP Webcam stream via OpenCV
├── detector.py          ← Checkbox detection logic (OpenCV + NumPy)
├── excel_writer.py      ← Appends results row to Tally.xlsx (OpenPyXL)
├── config.py            ← Section names, column mappings, camera URL, file paths
├── requirements.txt     ← Python packages to install
└── README.md            ← Setup and usage instructions
```

---

## config.py (Key Settings)

```python
# ── Camera ──────────────────────────────────────────
# Set this to the URL shown in the IP Webcam app
CAMERA_URL = "http://192.168.1.5:8080/video"

# ── Excel ────────────────────────────────────────────
EXCEL_PATH = r"C:\Users\User\OneDrive\Desktop\Tally.xlsx"
DATA_START_ROW = 3          # First data row in Excel (after 2 header rows)

# ── Scanning Sequence ────────────────────────────────
# 7 sections in order — matches Excel column layout exactly
SECTIONS = [
    {
        "name": "Part I — SHS Strand",
        "type": "strand",
        "cols": ["B"],
        "choices": 3,
        "labels": ["STEM", "TVL-ICT", "Non-Aligned"]
    },
    {
        "name": "A. Device Availability",
        "type": "grid",
        "cols": ["C", "D", "E", "F", "G"]
    },
    {
        "name": "B. Internet Connectivity",
        "type": "grid",
        "cols": ["H", "I", "J", "K", "L"]
    },
    {
        "name": "C. Frequency of ICT Use",
        "type": "grid",
        "cols": ["M", "N", "O", "P", "Q"]
    },
    {
        "name": "A. Perceived Academic Difficulty",
        "type": "grid",
        "cols": ["R", "S", "T", "U", "V"]
    },
    {
        "name": "B. Computing Self-Efficacy",
        "type": "grid",
        "cols": ["W", "X", "Y", "Z", "AA"]
    },
    {
        "name": "C. Academic Adjustment Behaviors",
        "type": "grid",
        "cols": ["AB", "AC", "AD", "AE", "AF"]
    },
]
```

---

## excel_writer.py Logic

```python
# Rules:
# 1. Open Tally.xlsx with openpyxl
# 2. Find the next empty row (after last filled row, starting from row 3)
# 3. Write respondent number in Col A
# 4. Write strand value in Col B
# 5. Write Q1–Q5 for each of the 6 grid sections across cols C–AF
# 6. Save the file
# IMPORTANT: Never modify or delete rows 1–17 (headers + existing data)
```

---

## Tech Stack


| Package         | Purpose                            | Install                         |
| ----------------- | ------------------------------------ | --------------------------------- |
| `opencv-python` | Camera stream + checkbox detection | `pip install opencv-python`     |
| `numpy`         | Image array math                   | `pip install numpy`             |
| `openpyxl`      | Read/write Tally.xlsx              | `pip install openpyxl`          |
| `Pillow`        | Convert OpenCV frame for Tkinter   | `pip install Pillow`            |
| `tkinter`       | Desktop GUI                        | Built into Python — no install |

### Full Install Command

```bash
pip install opencv-python numpy openpyxl Pillow
```

---

## Build Order (Step by Step)

Build these files in this exact order:

1. **`config.py`** — all constants, section list, file paths
2. **`camera.py`** — connect to IP Webcam, grab frames
3. **`detector.py`** — detect checkboxes, return values
4. **`excel_writer.py`** — find next row, write data, save
5. **`ui.py`** — GUI: camera feed, progress bar, buttons, edit fields
6. **`main.py`** — wire all modules together, start the app
7. **`requirements.txt`** — list all pip packages
8. **`README.md`** — how to install and run

---

## Verification Checklist

- [X]  Camera stream connects from phone to PC via IP Webcam
- [X]  Detection works on the Part I (strand) section
- [X]  Detection works on a grid section (Device Availability)
- [X]  Green overlay shows on correct checked boxes
- [X]  Edit/correction screen works
- [X]  After 7 scans, full row written correctly to Tally.xlsx
- [X]  Existing rows 3–17 in Tally.xlsx are untouched
- [X]  Respondent number auto-increments correctly
- [X]  App ready for next respondent after save
