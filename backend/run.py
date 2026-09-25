import sys
import os
import uvicorn
import socket
import subprocess
import threading
import time
import webbrowser

# Ensure AutoTali root directory is always on python sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def get_adb_devices():
    try:
        res = subprocess.run(["adb", "devices"], capture_output=True, text=True, timeout=2)
        lines = [line.strip() for line in res.stdout.strip().split("\n")[1:] if line.strip() and not line.startswith("*")]
        return lines
    except Exception:
        return []

def open_browser_delayed(url="http://localhost:8000", delay=1.8):
    time.sleep(delay)
    try:
        webbrowser.open(url)
    except Exception:
        pass

if __name__ == "__main__":
    local_ip = get_local_ip()
    devices = get_adb_devices()

    # Automatically launch default browser in background once server binds
    threading.Thread(target=open_browser_delayed, daemon=True).start()

    print("\n========================================================================")
    print("                     AUTOTALI SCANNER & SERVER                          ")
    print("========================================================================")
    print(f"  [PC Browser Local]   -->  http://localhost:8000")
    print(f"  [Phone Wi-Fi Access] -->  http://{local_ip}:8000")
    print(f"  [Phone USB Cable]    -->  http://localhost:8000 (via ADB reverse)")
    if devices:
        print(f"  [Connected Phones]   -->  {len(devices)} device(s) connected via USB:")
        for d in devices:
            print(f"                            * {d}")
    else:
        print(f"  [Connected Phones]   -->  No USB phone detected (Scan via Wi-Fi or webcam)")
    print("========================================================================")
    print("  Server is active. Keep this window open while scanning questionnaires.")
    print("  Press Ctrl+C to stop the server.")
    print("========================================================================\n")

    from backend.app import app, excel_writer
    try:
        _, next_resp = excel_writer.get_next_respondent_info()
        current_resp = max(0, next_resp - 1)
        sys.stdout.write(f"  [Live Status] Respondent: {current_resp} (Ready for #{next_resp})")
        sys.stdout.flush()
    except Exception:
        pass

    # Clean in-place console: suppress repetitive HTTP access logs
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="warning", access_log=False)
