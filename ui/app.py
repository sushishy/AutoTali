"""
Main Application Coordinator Window.
"""
import tkinter as tk
from tkinter import ttk, messagebox
from PIL import Image, ImageTk
import cv2
import config
from camera import CameraStream
from detector import SectionDetector
from storage import ExcelWriter
from ui.theme import apply_theme, BG_DARK, BG_CARD, BG_DARKER
from ui.header import HeaderBar
from ui.side_panel import SidePanel


class AutoTallyApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("AutoTally — Questionnaire OMR Scanner")
        self.geometry("1100x820")
        self.minsize(980, 720)

        apply_theme(self)

        self.camera = CameraStream(config.DEFAULT_CAMERA_URL)
        self.detector = SectionDetector()
        self.excel_writer = ExcelWriter()

        self.current_section_idx = 0
        self.current_respondent_no = 16
        self.collected_data = {}
        self.state = "live"
        self.current_detected_val = None

        self._build_layout()
        self._refresh_respondent_info()

        self.camera.start()
        self._poll_camera()
        self.protocol("WM_DELETE_WINDOW", self._on_close)

    def _build_layout(self):
        self.header = HeaderBar(self, self._on_reconnect_camera, config.DEFAULT_CAMERA_URL)
        self.header.pack(fill=tk.X, side=tk.TOP)

        self.prog_bar = ttk.Progressbar(self, orient=tk.HORIZONTAL, length=100, mode="determinate", maximum=len(config.SECTIONS))
        self.prog_bar.pack(fill=tk.X, padx=16, pady=(8, 4))
        self.prog_bar["value"] = 1

        container = tk.Frame(self, bg=BG_DARK, padx=16, pady=6)
        container.pack(fill=tk.BOTH, expand=True)

        sec_bar = tk.Frame(container, bg=BG_CARD, padx=12, pady=8)
        sec_bar.pack(fill=tk.X, pady=(0, 8))

        self.sec_badge = tk.Label(sec_bar, text="SCAN STEP 1/7", bg="#3b82f6", fg="white", font=("Segoe UI", 9, "bold"), padx=8, pady=2)
        self.sec_badge.pack(side=tk.LEFT, padx=(0, 10))

        self.sec_name_lbl = ttk.Label(sec_bar, text="Now scan: Part I — SHS Strand", style="SectionTitle.TLabel")
        self.sec_name_lbl.pack(side=tk.LEFT)

        body = tk.Frame(container, bg=BG_DARK)
        body.pack(fill=tk.BOTH, expand=True)

        self.cam_display = tk.Label(body, bg="#09090b", text="Connecting to camera...", fg="#a1a1aa", font=("Segoe UI", 12))
        self.cam_display.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 10))

        self.side_panel = SidePanel(body)
        self.side_panel.pack(side=tk.RIGHT, fill=tk.Y)
        self.side_panel.render_fields(config.SECTIONS[0]["type"])

        self._build_bottom_controls()

    def _build_bottom_controls(self):
        bottom = tk.Frame(self, bg=BG_DARKER, padx=16, pady=12)
        bottom.pack(fill=tk.X, side=tk.BOTTOM)

        self.status_lbl = tk.Label(bottom, text="Status: Live Preview. Align questionnaire section.", bg=BG_DARKER, fg="#94a3b8", font=("Segoe UI", 10))
        self.status_lbl.pack(side=tk.LEFT, padx=6)

        self.btn_capture = tk.Button(bottom, text="📸 CAPTURE FRAME", command=self._on_capture, bg="#0284c7", fg="white", font=("Segoe UI", 11, "bold"), padx=16, pady=6, relief=tk.FLAT, cursor="hand2")
        self.btn_capture.pack(side=tk.RIGHT, padx=4)

        self.btn_retake = tk.Button(bottom, text="🔄 RETAKE", command=self._on_retake, bg="#475569", fg="white", font=("Segoe UI", 11, "bold"), padx=16, pady=6, relief=tk.FLAT, cursor="hand2", state=tk.DISABLED)
        self.btn_retake.pack(side=tk.RIGHT, padx=4)

        self.btn_confirm_next = tk.Button(bottom, text="NEXT SECTION ➔", command=self._on_confirm_next, bg="#16a34a", fg="white", font=("Segoe UI", 11, "bold"), padx=18, pady=6, relief=tk.FLAT, cursor="hand2", state=tk.DISABLED)
        self.btn_confirm_next.pack(side=tk.RIGHT, padx=4)

    def _poll_camera(self):
        if self.state == "live":
            grabbed, frame = self.camera.read()
            if grabbed and frame is not None:
                sec = config.SECTIONS[self.current_section_idx]
                det_fn = self.detector.detect_part1_strand if sec["type"] == "strand" else self.detector.detect_grid_section
                detected_val, display_frame, _ = det_fn(frame)

                self.current_detected_val = detected_val
                self.side_panel.sync_detection(sec["type"], detected_val)
                self._display_image(display_frame)
            else:
                self.cam_display.config(text=f"Waiting for video feed...\nSource: {self.camera.src}\n(Check IP Webcam app)")
        self.after(33, self._poll_camera)

    def _display_image(self, cv_frame):
        rgb_frame = cv2.cvtColor(cv_frame, cv2.COLOR_BGR2RGB)
        h, w = rgb_frame.shape[:2]
        disp_w, disp_h = max(self.cam_display.winfo_width(), 480), max(self.cam_display.winfo_height(), 360)
        scale = min(disp_w / w, disp_h / h)
        resized = cv2.resize(rgb_frame, (max(1, int(w * scale)), max(1, int(h * scale))), interpolation=cv2.INTER_AREA)
        imgtk = ImageTk.PhotoImage(image=Image.fromarray(resized))
        self.cam_display.imgtk = imgtk
        self.cam_display.configure(image=imgtk, text="")

    def _on_capture(self):
        grabbed, frame = self.camera.read()
        if not grabbed or frame is None:
            messagebox.showwarning("No Camera", "Camera feed is not ready.")
            return

        sec = config.SECTIONS[self.current_section_idx]
        det_fn = self.detector.detect_part1_strand if sec["type"] == "strand" else self.detector.detect_grid_section
        self.current_detected_val, overlay, _ = det_fn(frame)

        self.state = "captured"
        self.side_panel.sync_detection(sec["type"], self.current_detected_val)
        self._display_image(overlay)

        self.btn_capture.config(state=tk.DISABLED)
        self.btn_retake.config(state=tk.NORMAL)
        self.btn_confirm_next.config(state=tk.NORMAL)
        self.status_lbl.config(text="Frame frozen. Review detections on right, edit if needed, then click Next.", fg="#38bdf8")

    def _on_retake(self):
        self.state = "live"
        self.btn_capture.config(state=tk.NORMAL)
        self.btn_retake.config(state=tk.DISABLED)
        self.btn_confirm_next.config(state=tk.DISABLED)
        self.status_lbl.config(text="Status: Live Preview. Align questionnaire section.", fg="#94a3b8")

    def _on_confirm_next(self):
        sec = config.SECTIONS[self.current_section_idx]
        self.collected_data[sec["id"]] = self.side_panel.get_values(sec["type"])

        if self.current_section_idx < len(config.SECTIONS) - 1:
            self.current_section_idx += 1
            self._update_section_view()
            self._on_retake()
        else:
            self._save_to_excel()

    def _update_section_view(self):
        sec = config.SECTIONS[self.current_section_idx]
        step, total = self.current_section_idx + 1, len(config.SECTIONS)
        self.sec_badge.config(text=f"SCAN STEP {step}/{total}")
        self.sec_name_lbl.config(text=f"Now scan: {sec['name']}")
        self.header.update_info(self.current_respondent_no, step, total)
        self.prog_bar["value"] = step
        self.btn_confirm_next.config(text="SAVE TO EXCEL 💾" if step == total else "NEXT SECTION ➔")
        self.side_panel.render_fields(sec["type"])

    def _save_to_excel(self):
        ok, msg = self.excel_writer.append_respondent_data(self.current_respondent_no, self.collected_data)
        if ok:
            messagebox.showinfo("Saved Successfully!", f"{msg}\n\nReady for next respondent!")
            self.current_section_idx = 0
            self.collected_data = {}
            self._refresh_respondent_info()
            self._update_section_view()
            self._on_retake()
        else:
            messagebox.showerror("Error Saving", f"Failed to save to Excel:\n{msg}")

    def _refresh_respondent_info(self):
        _, next_no = self.excel_writer.get_next_respondent_info()
        self.current_respondent_no = next_no
        self.header.update_info(self.current_respondent_no, self.current_section_idx + 1, len(config.SECTIONS))

    def _on_reconnect_camera(self, new_url):
        self.status_lbl.config(text=f"Connecting to {new_url}...", fg="#facc15")
        if self.camera.set_source(new_url):
            self.status_lbl.config(text="Connected to camera stream successfully!", fg="#4ade80")
        else:
            self.status_lbl.config(text=f"Failed to connect: {self.camera.last_error or 'Stream unreachable'}", fg="#f87171")

    def _on_close(self):
        self.camera.stop()
        self.destroy()
