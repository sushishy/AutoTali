# AutoTali — Survey Tally Scanner

**AutoTali** is a fully offline, LAN-based web app for tallying paper survey questionnaires. Run it on your laptop, connect your phone to the same WiFi or hotspot, and scan or manually enter answers — all saved directly to Excel. No internet required.

---

## Features

- 📷 **Live QR-Style Auto-Scanner** — Aim your camera at any questionnaire section and AutoTali automatically detects the answers and snaps them instantly like a QR code scanner (complete with audio chime and haptic feedback). An **AUTO/MANUAL** toggle lets you switch between instant auto-scan and manual shutter mode.
- ✍️ **Manual Mode** — Tap answers directly on screen. Works on any device including iPhone.
- 📊 **Summary Mode** — See all collected answers for the current respondent at a glance before saving.
- 💾 **Smart Save (Upsert)** — Saves to Excel without creating duplicate rows. If a respondent number already exists, it updates that row in-place.
- ✏️ **Edit Existing Respondents** — Tap the respondent `#` in the header and jump directly to any respondent number.
- 📱 **Mobile-First UI** — Full-screen camera on phones, swipe-down gesture to dismiss the result card, responsive header with compact dropdowns.
- 🗂️ **Multi-File Support** — Switch between multiple Excel files or create a new empty questionnaire file from the dropdown — no need to touch the filesystem manually.
- 🔢 **Step Protection** — You can't skip ahead to a section you haven't reached yet. Steps are remembered across page reloads.
- 🌐 **Single Server, Single Port** — One `start.bat` launches everything (FastAPI backend + React frontend) on port `8000`. Access it from any device on the same network.
- 🔦 **Torch & Zoom** — Flash and zoom controls built into the camera view for better scanning in low light.
- 📋 **Back Navigation** — Go back to a previous section to fix a mistake without losing other answers.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python + FastAPI |
| Frontend | React + Vite |
| Detection | OpenCV (CLAHE preprocessing, checkbox grid detection) |
| Excel | openpyxl |
| Startup | Windows batch script (`start.bat`) |

---

## How to Run

1. Double-click **`start.bat`** (run as Administrator if prompted).
2. A browser tab opens automatically at `http://localhost:8000`.
3. On your **phone**, connect to the same WiFi or laptop hotspot, then open the URL shown in the header (e.g. `http://10.0.1.168:8000`).
4. Select a mode — **Scanner** to use the camera, **Manual** to tap answers directly.
5. Go section by section. Confirm each answer, then hit **Next**.
6. At the last section, tap **Save to Excel** — the row is written to `Tally.xlsx`.

---

## Questionnaire Format

All sections are defined in [`config/settings.py`](config/settings.py). Edit that file to:
- Add, remove, or rename sections
- Change the number of questions per section
- Map sections to different Excel columns
- Change the default Excel filename or directory

---

## Folder Structure

```
AutoTali/
├── backend/
│   └── app.py              # FastAPI server — all API endpoints
├── config/
│   └── settings.py         # Section definitions, Excel path, data layout
├── detector/
│   ├── preprocessor.py     # Image preprocessing (CLAHE, thresholding)
│   ├── strand_detector.py  # Single-choice strand section detection
│   └── grid_detector.py    # 5x5 Likert grid detection
├── storage/
│   └── excel_writer.py     # Excel read, write, upsert, and template creation
├── frontend/
│   ├── src/
│   │   ├── App.jsx                        # Root state and logic
│   │   ├── index.css                      # Global styles and responsive layout
│   │   └── components/
│   │       ├── StepHeader.jsx             # Header bar with dropdowns and step pills
│   │       ├── CameraScanner.jsx          # Live camera, capture, torch, zoom
│   │       ├── DetectionReview.jsx        # Result card with swipe-down gesture
│   │       └── ManualEntry.jsx            # Manual data entry form
│   └── dist/                              # Built frontend served by FastAPI
├── excel/
│   └── Tally.xlsx                         # Default output file
├── requirements.txt
└── start.bat               # One-click launcher (runs backend + builds/serves frontend)
```

---

## Requirements

```bash
pip install -r requirements.txt
```

---

## Notes

- **Android phones**: All features work including the live camera scanner.
- **iPhones**: Use Manual mode. The live camera viewfinder requires HTTPS which isn't set up for local use.
- **Excel file must be closed** in Microsoft Excel before saving, otherwise you'll get a permission error.
