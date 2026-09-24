import os
import base64
import cv2
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Any, Dict, List, Optional

import config
from detector import SectionDetector
from storage import ExcelWriter

app = FastAPI(title="AutoTali Web API", version="1.0.0")

# Enable CORS for local network and localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = SectionDetector()
excel_writer = ExcelWriter()


class DetectRequest(BaseModel):
    section_id: int
    image_base64: str  # Base64-encoded JPEG from client camera
    return_overlay: Optional[bool] = True


class SaveRequest(BaseModel):
    respondent_no: int
    data: Dict[int, Any]  # {1: 2, 2: [5,4,3,2,1], ...}


class NewSheetRequest(BaseModel):
    filename: str


class SwitchSheetRequest(BaseModel):
    filename: str


def get_local_ip():
    import socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


@app.get("/api/status")
def get_status():
    """Returns current scanning status, next respondent info, IP addresses, section schemas, and sheets."""
    next_row, next_resp_no = excel_writer.get_next_respondent_info()
    return {
        "next_row": next_row,
        "next_respondent_no": next_resp_no,
        "excel_path": excel_writer.excel_path,
        "active_file": os.path.basename(excel_writer.excel_path),
        "available_files": excel_writer.list_sheets(),
        "sections": config.SECTIONS,
        "local_ip": get_local_ip(),
        "port": 8000,
    }


@app.get("/api/respondent/{respondent_no}")
def get_respondent(respondent_no: int):
    """Loads existing survey data for a respondent number if it exists in the active Excel file."""
    data = excel_writer.load_respondent_data(respondent_no)
    if data is None:
        return {"exists": False, "data": None}
    # Convert int keys to strings for JSON (section ids are ints)
    return {"exists": True, "data": data}



@app.post("/api/sheets/new")
def create_new_sheet(payload: NewSheetRequest):
    """Creates a new empty formatted Excel workbook with custom name."""
    clean_name = payload.filename.strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Filename cannot be empty")
    success, msg = excel_writer.create_new_template(clean_name)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    next_row, next_resp_no = excel_writer.get_next_respondent_info()
    return {
        "success": True,
        "message": msg,
        "active_file": os.path.basename(excel_writer.excel_path),
        "available_files": excel_writer.list_sheets(),
        "next_respondent_no": next_resp_no,
    }


@app.post("/api/sheets/switch")
def switch_sheet(payload: SwitchSheetRequest):
    """Switches active target Excel file."""
    success, msg = excel_writer.switch_file(payload.filename)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    next_row, next_resp_no = excel_writer.get_next_respondent_info()
    return {
        "success": True,
        "message": msg,
        "active_file": os.path.basename(excel_writer.excel_path),
        "available_files": excel_writer.list_sheets(),
        "next_respondent_no": next_resp_no,
    }


@app.post("/api/detect")
def detect_marks(payload: DetectRequest):
    """Processes base64 image through OpenCV checkbox detection for the specified section."""
    try:
        # Decode base64 image
        header_split = payload.image_base64.split(",")
        encoded = header_split[1] if len(header_split) > 1 else header_split[0]
        img_bytes = base64.b64decode(encoded)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image payload")

        # Find section config
        sec = next((s for s in config.SECTIONS if s["id"] == payload.section_id), None)
        if not sec:
            raise HTTPException(status_code=404, detail="Section ID not found")

        if sec["type"] == "strand":
            detected_val, overlay, scores, meta = detector.detect_part1_strand(frame)
        else:
            detected_val, overlay, scores, meta = detector.detect_grid_section(frame)

        overlay_b64 = None
        if payload.return_overlay:
            # Encode annotated overlay frame to base64 JPEG
            _, buffer = cv2.imencode(".jpg", overlay, [cv2.IMWRITE_JPEG_QUALITY, 85])
            overlay_b64 = "data:image/jpeg;base64," + base64.b64encode(buffer).decode("utf-8")

        return {
            "success": True,
            "section_id": payload.section_id,
            "detected_value": detected_val,
            "overlay_base64": overlay_b64,
            "scores": scores,
            "is_valid": meta.get("is_valid", False),
            "confidence": meta.get("confidence", 0.0),
            "table_found": meta.get("table_found", meta.get("boxes_found", False)),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/save")
def save_survey(payload: SaveRequest):
    """Appends full respondent row to Tally.xlsx."""
    success, message = excel_writer.append_respondent_data(
        payload.respondent_no, payload.data
    )
    if not success:
        raise HTTPException(status_code=500, detail=message)

    _, next_resp_no = excel_writer.get_next_respondent_info()
    return {
        "success": True,
        "message": message,
        "next_respondent_no": next_resp_no,
    }


# Mount the React Frontend build directly — single server, single port, single tab!
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")

if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    if os.path.exists(FRONTEND_DIST):
        target = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.isfile(target):
            return FileResponse(target)
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)

    # Fallback if frontend/dist is ever missing
    from fastapi.responses import HTMLResponse
    return HTMLResponse(
        """<!DOCTYPE html>
        <html>
        <head>
            <title>AutoTali - Setup Required</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { background: #08080a; color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 16px; box-sizing: border-box; }
                .card { background: #121212; border: 1px solid #262626; border-radius: 12px; padding: 32px 28px; max-width: 440px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.8); }
                h1 { margin-top: 0; font-size: 1.4rem; font-weight: 800; letter-spacing: 0.04em; }
                p { color: #a3a3a3; line-height: 1.5; font-size: 0.88rem; margin: 12px 0; }
                code { background: #1c1c1c; padding: 3px 8px; border-radius: 4px; color: #60a5fa; font-size: 0.85rem; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>AutoTali Frontend Missing</h1>
                <p>The pre-built frontend files were not found in <code>frontend/dist</code>.</p>
                <p>Make sure the <code>frontend/dist</code> folder is extracted or run <code>npm run build</code> inside the <code>frontend</code> directory.</p>
            </div>
        </body>
        </html>""",
        status_code=200,
    )


