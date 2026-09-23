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

if __name__ == "__main__":
    local_ip = get_local_ip()
    print("=" * 60)
    print("🚀 AutoTally Backend API Starting...")
    print(f"👉 Local Access:   http://localhost:8000")
    print(f"👉 Hotspot/Phone:  http://{local_ip}:8000")
    print("=" * 60)
    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=False)
