import sys
import os
import uvicorn
import socket

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

import webbrowser
import threading
import time

def open_browser():
    time.sleep(1.2)
    webbrowser.open("http://localhost:8000")

if __name__ == "__main__":
    local_ip = get_local_ip()
    print("------------------------------------------------------------")
    print("  AUTOTALLY SCANNER SERVER READY")
    print("------------------------------------------------------------")
    print(f"  PC Browser:      http://localhost:8000")
    print(f"  Phone Browser:   http://{local_ip}:8000")
    print("------------------------------------------------------------")
    print("  Keep this window open while scanning.")
    print("------------------------------------------------------------")

    # Automatically launch your browser in 1 tab
    threading.Thread(target=open_browser, daemon=True).start()

    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=False)
