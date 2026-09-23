"""
Side Panel Component for Reviewing and Manually Editing Detected Answers.
"""
import tkinter as tk
from tkinter import ttk
from ui.theme import BG_CARD


class SidePanel(tk.Frame):
    def __init__(self, parent):
        super().__init__(parent, bg=BG_CARD, width=300, padx=14, pady=12)
        self.pack_propagate(False)

        tk.Label(self, text="DETECTION REVIEW", bg=BG_CARD, fg="#38bdf8", font=("Segoe UI", 11, "bold")).pack(anchor=tk.W, pady=(0, 8))
        self.edit_container = tk.Frame(self, bg=BG_CARD)
        self.edit_container.pack(fill=tk.BOTH, expand=True)

        self.tip_lbl = tk.Label(
            self, text="💡 Tip:\nManually adjust any value if camera detection missed.",
            bg=BG_CARD, fg="#94a3b8", font=("Segoe UI", 9, "italic"), justify=tk.LEFT
        )
        self.tip_lbl.pack(fill=tk.X, side=tk.BOTTOM, pady=6)

        self.strand_var = tk.IntVar(value=1)
        self.grid_vars = [tk.IntVar(value=5) for _ in range(5)]

    def render_fields(self, sec_type, detected_val=None):
        for widget in self.edit_container.winfo_children():
            widget.destroy()

        if sec_type == "strand":
            tk.Label(self.edit_container, text="Selected SHS Strand:", bg=BG_CARD, fg="#f1f5f9", font=("Segoe UI", 10, "bold")).pack(anchor=tk.W, pady=(4, 6))
            if isinstance(detected_val, int):
                self.strand_var.set(detected_val)
            for val, text in [(1, "1 — STEM"), (2, "2 — TVL-ICT"), (3, "3 — Non-Aligned")]:
                tk.Radiobutton(
                    self.edit_container, text=text, value=val, variable=self.strand_var,
                    bg=BG_CARD, fg="#e2e8f0", selectcolor="#0f172a", activebackground=BG_CARD, font=("Segoe UI", 10)
                ).pack(anchor=tk.W, pady=3)
        else:
            tk.Label(self.edit_container, text="Confirm Q1–Q5 (Scale 1–5):", bg=BG_CARD, fg="#f1f5f9", font=("Segoe UI", 10, "bold")).pack(anchor=tk.W, pady=(4, 6))
            vals = detected_val if isinstance(detected_val, list) and len(detected_val) == 5 else [5, 5, 5, 5, 5]
            for i in range(5):
                row_f = tk.Frame(self.edit_container, bg=BG_CARD)
                row_f.pack(fill=tk.X, pady=4)
                tk.Label(row_f, text=f"Question {i+1}:", bg=BG_CARD, fg="#cbd5e1", width=12, anchor=tk.W).pack(side=tk.LEFT)
                self.grid_vars[i].set(vals[i])
                ttk.Combobox(row_f, textvariable=self.grid_vars[i], values=[5, 4, 3, 2, 1], width=5, state="readonly").pack(side=tk.RIGHT)

    def sync_detection(self, sec_type, detected_val):
        if sec_type == "strand" and isinstance(detected_val, int):
            self.strand_var.set(detected_val)
        elif sec_type == "grid" and isinstance(detected_val, list):
            for i, v in enumerate(detected_val[:5]):
                self.grid_vars[i].set(v)

    def get_values(self, sec_type):
        return self.strand_var.get() if sec_type == "strand" else [v.get() for v in self.grid_vars]
