"""
Camera Stream Manager
Connects to IP Webcam (or local USB webcam) and streams frames in a non-blocking background thread.
"""
import cv2
import threading
import time


class CameraStream:
    def __init__(self, src=0):
        self.src = src
        self.cap = None
        self.grabbed = False
        self.frame = None
        self.running = False
        self.thread = None
        self.lock = threading.Lock()
        self.last_error = None

    def start(self):
        """Starts background frame-grabbing thread."""
        if self.running:
            return True

        source = self.src
        if isinstance(source, str) and source.strip().isdigit():
            source = int(source.strip())

        try:
            self.cap = cv2.VideoCapture(source)
            if not self.cap.isOpened():
                self.last_error = f"Cannot open video source: {self.src}"
                return False

            self.grabbed, self.frame = self.cap.read()
            if not self.grabbed:
                self.last_error = f"Cannot read initial frame from source: {self.src}"
                self.cap.release()
                return False

            self.running = True
            self.thread = threading.Thread(target=self._update, daemon=True)
            self.thread.start()
            self.last_error = None
            return True
        except Exception as e:
            self.last_error = str(e)
            if self.cap:
                self.cap.release()
            return False

    def _update(self):
        """Continuously pulls latest frames to avoid buffer lag."""
        while self.running and self.cap and self.cap.isOpened():
            grabbed, frame = self.cap.read()
            if grabbed:
                with self.lock:
                    self.grabbed = grabbed
                    self.frame = frame
            else:
                time.sleep(0.01)

    def read(self):
        """Returns (grabbed, copy_of_frame)."""
        with self.lock:
            if not self.running or self.frame is None:
                return False, None
            return self.grabbed, self.frame.copy()

    def set_source(self, new_src):
        """Switches stream source dynamically."""
        self.stop()
        self.src = new_src
        return self.start()

    def stop(self):
        """Stops background thread and releases device."""
        self.running = False
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=1.0)
        if self.cap:
            try:
                self.cap.release()
            except Exception:
                pass
            self.cap = None
        self.frame = None
        self.grabbed = False

    def is_connected(self):
        return self.running and self.grabbed
