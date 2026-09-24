"""
AutoTali
Main Application Entry Point (Unified Web App)
"""
import sys
import subprocess
import os

def main():
    backend_run = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend", "run.py")
    try:
        subprocess.run([sys.executable, backend_run])
    except KeyboardInterrupt:
        print("\nAutoTally exited by user.")
        sys.exit(0)

if __name__ == "__main__":
    main()
