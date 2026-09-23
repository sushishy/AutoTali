"""
AutoTally Configuration Settings
Defines camera streaming URL, Excel destination path, and the 7 survey sections.
"""

import os

# Camera Configuration
DEFAULT_CAMERA_URL = "http://192.168.1.5:8080/video"

# Excel Directory & File Configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXCEL_DIR = os.path.join(BASE_DIR, "excel")
DEFAULT_EXCEL_FILENAME = "Tally.xlsx"
EXCEL_PATH = os.path.join(EXCEL_DIR, DEFAULT_EXCEL_FILENAME)
DESKTOP_EXCEL_PATH = r"C:\Users\User\OneDrive\Desktop\Tally.xlsx"

# If excel/Tally.xlsx doesn't exist yet, fall back to desktop path
if not os.path.exists(EXCEL_PATH) and os.path.exists(DESKTOP_EXCEL_PATH):
    EXCEL_PATH = DESKTOP_EXCEL_PATH

DATA_START_ROW = 3  # First data row in Excel (rows 1-2 are headers)

# Scanning Sequence — 7 sections in order (matches Excel column layout)
SECTIONS = [
    {
        "id": 1,
        "name": "Part I — SHS Strand",
        "type": "strand",
        "cols": ["B"],
        "choices": 3,
        "labels": ["STEM", "TVL-ICT", "Non-Aligned"]
    },
    {
        "id": 2,
        "name": "A. Device Availability",
        "type": "grid",
        "cols": ["C", "D", "E", "F", "G"],
        "num_questions": 5,
        "scale": [5, 4, 3, 2, 1]
    },
    {
        "id": 3,
        "name": "B. Internet Connectivity",
        "type": "grid",
        "cols": ["H", "I", "J", "K", "L"],
        "num_questions": 5,
        "scale": [5, 4, 3, 2, 1]
    },
    {
        "id": 4,
        "name": "C. Frequency of ICT Use",
        "type": "grid",
        "cols": ["M", "N", "O", "P", "Q"],
        "num_questions": 5,
        "scale": [5, 4, 3, 2, 1]
    },
    {
        "id": 5,
        "name": "A. Perceived Academic Difficulty",
        "type": "grid",
        "cols": ["R", "S", "T", "U", "V"],
        "num_questions": 5,
        "scale": [5, 4, 3, 2, 1]
    },
    {
        "id": 6,
        "name": "B. Computing Self-Efficacy",
        "type": "grid",
        "cols": ["W", "X", "Y", "Z", "AA"],
        "num_questions": 5,
        "scale": [5, 4, 3, 2, 1]
    },
    {
        "id": 7,
        "name": "C. Academic Adjustment Behaviors",
        "type": "grid",
        "cols": ["AB", "AC", "AD", "AE", "AF"],
        "num_questions": 5,
        "scale": [5, 4, 3, 2, 1]
    },
]
