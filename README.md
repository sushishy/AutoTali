# AutoTally — Questionnaire OMR Scanner

AutoTally is a desktop application built with Python, OpenCV, and Tkinter that scans paper survey questionnaires section by section using a phone camera stream (via IP Webcam over local WiFi). Detected marks are highlighted with real-time green/gray overlay boxes, reviewed/edited by the user, and appended directly to `Tally.xlsx`.

---

## Folder Structure

```
AutoTali/
├── config/
│   ├── __init__.py
│   └── settings.py          # Camera URL, file paths, and section column definitions
├── camera/
│   ├── __init__.py
│   └── stream.py            # Non-blocking threaded video capture & reconnection
├── detector/
│   ├── __init__.py
│   ├── preprocessor.py      # Adaptive thresholding and ink density ROI calculation
│   ├── strand_detector.py   # Part I SHS Strand (3 vertical choices) detection
│   └── grid_detector.py     # Grid sections A-C (5x5 matrix, scale 1-5) detection
├── storage/
│   ├── __init__.py
│   └── excel_writer.py      # Safe row finding & atomic writing into Tally.xlsx
├── ui/
│   ├── __init__.py
│   ├── theme.py             # Dark modern UI color tokens and ttk styles
│   ├── header.py            # Header bar with live camera reconnect & progress counter
│   ├── side_panel.py        # Detection review with radio buttons / comboboxes
│   └── app.py               # Main window coordinator
├── main.py                  # Application entry point
├── requirements.txt         # Required Python packages
└── plan.md                  # Specification document
```

---

## Requirements

Install the dependencies:

```bash
pip install -r requirements.txt
```

---

## How to Run

1. Open **IP Webcam** on your Android phone and tap **Start server**.
2. Run the application:
   ```bash
   python main.py
   ```
3. Enter your phone's IP Webcam video stream URL in the header bar (e.g. `http://192.168.1.X:8080/video`) and click **Connect**.
4. Align the questionnaire section with the guides.
5. Click **Capture Frame**, verify or adjust detected values on the right review panel, and click **Next Section**.
6. When all 7 sections are scanned, click **Save to Excel** to record the row into `Tally.xlsx`.
