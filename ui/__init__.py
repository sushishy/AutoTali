"""
UI Package for AutoTally.
"""
from ui.app import AutoTallyApp


def run_app():
    app = AutoTallyApp()
    app.mainloop()


__all__ = ["AutoTallyApp", "run_app"]
