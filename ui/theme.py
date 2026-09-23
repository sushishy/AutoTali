"""
UI Theme and Styles Configuration.
"""
from tkinter import ttk

BG_DARK = "#1e1e24"
BG_DARKER = "#18181b"
BG_CARD = "#27272a"
COLOR_PRIMARY = "#38bdf8"
COLOR_ACCENT = "#4ade80"
COLOR_MUTED = "#94a3b8"


def apply_theme(root):
    root.configure(bg=BG_DARK)
    style = ttk.Style(root)
    style.theme_use("clam")

    style.configure(".", background=BG_DARK, foreground="#f3f4f6", font=("Segoe UI", 10))
    style.configure("Header.TLabel", font=("Segoe UI", 15, "bold"), foreground=COLOR_PRIMARY, background=BG_DARKER)
    style.configure("SubHeader.TLabel", font=("Segoe UI", 11), foreground=COLOR_MUTED, background=BG_DARKER)
    style.configure("SectionTitle.TLabel", font=("Segoe UI", 13, "bold"), foreground=COLOR_ACCENT, background=BG_CARD)
