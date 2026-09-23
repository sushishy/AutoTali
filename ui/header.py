"""
Header Bar Component with Progress Indicator and Camera Settings.
"""
import tkinter as tk
from tkinter import ttk
from ui.theme import BG_DARKER


class HeaderBar(tk.Frame):
    def __init__(self, parent, on_reconnect_cb, initial_cam_url):
        super().__init__(parent, bg=BG_DARKER, padx=16, pady=12, relief=tk.RAISED, bd=1)
        self.on_reconnect_cb = on_reconnect_cb

        # Left Info
        left_f = tk.Frame(self, bg=BG_DARKER)
        left_f.pack(side=tk.LEFT, fill=tk.Y)

        ttk.Label(left_f, text="AUTOTALLY — QUESTIONNAIRE SCANNER", style="Header.TLabel").pack(anchor=tk.W)
        self.resp_lbl = ttk.Label(left_f, text="Respondent #16  |  Section 1 of 7", style="SubHeader.TLabel")
        self.resp_lbl.pack(anchor=tk.W, pady=(2, 0))

        # Right Camera Config
        right_f = tk.Frame(self, bg=BG_DARKER)
        right_f.pack(side=tk.RIGHT, fill=tk.Y)

        tk.Label(right_f, text="Camera / IP:", bg=BG_DARKER, fg="#cbd5e1", font=("Segoe UI", 9)).pack(side=tk.LEFT, padx=4)
        self.cam_entry = tk.Entry(right_f, width=28, bg="#27272a", fg="#ffffff", insertbackground="#ffffff", relief=tk.FLAT)
        self.cam_entry.insert(0, initial_cam_url)
        self.cam_entry.pack(side=tk.LEFT, padx=4, ipady=3)

        tk.Button(
            right_f, text="Connect", command=self._trigger_reconnect,
            bg="#2563eb", fg="white", relief=tk.FLAT, padx=10, cursor="hand2"
        ).pack(side=tk.LEFT, padx=3)

        tk.Button(
            right_f, text="⚡ USB Phone", command=self._set_usb_phone,
            bg="#059669", fg="white", relief=tk.FLAT, padx=8, cursor="hand2"
        ).pack(side=tk.LEFT, padx=3)

    def _set_usb_phone(self):
        self.cam_entry.delete(0, tk.END)
        self.cam_entry.insert(0, "http://127.0.0.1:8080/video")
        self._trigger_reconnect()

    def _trigger_reconnect(self):
        url = self.cam_entry.get().strip()
        if url:
            self.on_reconnect_cb(url)

    def update_info(self, resp_no, step, total):
        self.resp_lbl.config(text=f"Respondent #{resp_no}  |  Section {step} of {total}")
