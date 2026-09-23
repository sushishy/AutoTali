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
        if isinstance(source, str):
            source_str = source.strip()
            if source_str.isdigit():
                source = int(source_str)
            elif source_str.lower().startswith("scrcpy"):
                # Direct hardware camera via scrcpy & ffmpeg pipe (No Android app needed!)
                return self._start_scrcpy_stream(source_str)
            elif "localhost" in source_str or "127.0.0.1" in source_str:
                # Ensure ADB forwards USB traffic to phone IP Webcam server
                import subprocess
                try:
                    subprocess.run(["adb", "forward", "tcp:8080", "tcp:8080"], capture_output=True, timeout=3)
                except Exception:
                    pass

        try:
            if isinstance(source, int):
                # On Windows, DirectShow backend opens hardware webcams instantly with high FPS
                self.cap = cv2.VideoCapture(source, cv2.CAP_DSHOW)
            else:
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

    def _start_scrcpy_stream(self, src_str):
        """Streams directly from phone back camera via scrcpy and rawvideo pipe."""
        import subprocess
        import numpy as np

        cam_id = "0"
        if ":" in src_str:
            parts = src_str.split(":")
            if len(parts) > 1 and parts[1].strip():
                cam_id = parts[1].strip()

        # Resolution for phone camera stream
        w, h = 1280, 720
        self.scrcpy_w, self.scrcpy_h = w, h

        # Pipeline: scrcpy raw camera -> stdout -> ffmpeg rawvideo -> python pipe
        scrcpy_cmd = [
            "scrcpy",
            "--video-source=camera",
            f"--camera-id={cam_id}",
            f"--camera-size={w}x{h}",
            "--camera-fps=30",
            "--no-audio",
            "--no-window",
            "--no-control",
            "--video-codec=h264",
            "--raw-stream=-"
        ]

        ffmpeg_cmd = [
            "ffmpeg",
            "-loglevel", "error",
            "-f", "h264",
            "-i", "pipe:0",
            "-f", "rawvideo",
            "-pix_fmt", "bgr24",
            "pipe:1"
        ]

        try:
            self.scrcpy_proc = subprocess.Popen(
                scrcpy_cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL
            )
            self.ffmpeg_proc = subprocess.Popen(
                ffmpeg_cmd,
                stdin=self.scrcpy_proc.stdout,
                stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL,
                bufsize=w * h * 3
            )
            self.scrcpy_proc.stdout.close()  # Allow ffmpeg to receive SIGPIPE

            self.running = True
            self.thread = threading.Thread(target=self._update_scrcpy, daemon=True)
            self.thread.start()
            self.last_error = None
            return True
        except Exception as e:
            self.last_error = f"scrcpy camera error: {e}"
            self.running = False
            return False

    def _update_scrcpy(self):
        """Continuously reads uncompressed BGR frames from ffmpeg stdout."""
        import numpy as np
        frame_size = self.scrcpy_w * self.scrcpy_h * 3

        while self.running and self.ffmpeg_proc and self.ffmpeg_proc.poll() is None:
            raw_bytes = self.ffmpeg_proc.stdout.read(frame_size)
            if len(raw_bytes) == frame_size:
                frame = np.frombuffer(raw_bytes, dtype=np.uint8).reshape((self.scrcpy_h, self.scrcpy_w, 3))
                with self.lock:
                    self.grabbed = True
                    self.frame = frame
            else:
                time.sleep(0.01)

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

        # Terminate scrcpy & ffmpeg if running
        for proc_name in ("ffmpeg_proc", "scrcpy_proc"):
            proc = getattr(self, proc_name, None)
            if proc:
                try:
                    proc.kill()
                    proc.wait(timeout=0.5)
                except Exception:
                    pass
                setattr(self, proc_name, None)

        self.frame = None
        self.grabbed = False

    def is_connected(self):
        return self.running and self.grabbed
