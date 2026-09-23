"""
Backend server runner for AutoTally.
Listens on 0.0.0.0 so both localhost and phone hotspot devices can connect.
"""
import uvicorn
import socket

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

import webbrowser
import threading
import time

def open_browser():
    time.sleep(1.2)
    webbrowser.open("http://localhost:8000")

if __name__ == "__main__":
    local_ip = get_local_ip()
    print("=" * 60)
    print("🚀 AutoTally Unified Web Scanner (Single Tab & Single Server)")
    print(f"👉 Local Access:   http://localhost:8000")
    print(f"👉 Phone/Hotspot:  http://{local_ip}:8000")
    print("=" * 60)

    # Automatically launch your browser in 1 tab
    threading.Thread(target=open_browser, daemon=True).start()

    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=False)
