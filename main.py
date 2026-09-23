"""
AutoTally — Questionnaire OMR Scanner
Main Application Entry Point
"""
import sys
from ui import run_app


def main():
    print("Starting AutoTally Questionnaire Scanner...")
    try:
        run_app()
    except KeyboardInterrupt:
        print("\nAutoTally exited by user.")
        sys.exit(0)


if __name__ == "__main__":
    main()
