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


class SaveRequest(BaseModel):
    respondent_no: int
    data: Dict[int, Any]  # {1: 2, 2: [5,4,3,2,1], ...}


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
    """Returns current scanning status, next respondent info, IP addresses, and section schemas."""
    next_row, next_resp_no = excel_writer.get_next_respondent_info()
    return {
        "next_row": next_row,
        "next_respondent_no": next_resp_no,
        "excel_path": excel_writer.excel_path,
        "sections": config.SECTIONS,
        "local_ip": get_local_ip(),
        "port": 8000,
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
            detected_val, overlay, scores = detector.detect_part1_strand(frame)
        else:
            detected_val, overlay, scores = detector.detect_grid_section(frame)

        # Encode annotated overlay frame to base64 JPEG
        _, buffer = cv2.imencode(".jpg", overlay, [cv2.IMWRITE_JPEG_QUALITY, 85])
        overlay_b64 = "data:image/jpeg;base64," + base64.b64encode(buffer).decode("utf-8")

        return {
            "success": True,
            "section_id": payload.section_id,
            "detected_value": detected_val,
            "overlay_base64": overlay_b64,
            "scores": scores,
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
    # Serve assets folder
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Serve index.html for all page requests
    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        target = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.isfile(target):
            return FileResponse(target)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

