"""
AutoTally Detector Package.
Provides unified SectionDetector combining Strand and Grid detection.
"""
from detector.strand_detector import StrandDetector
from detector.grid_detector import GridDetector


class SectionDetector:
    def __init__(self):
        self.strand_detector = StrandDetector()
        self.grid_detector = GridDetector()

    def detect_part1_strand(self, frame):
        return self.strand_detector.detect(frame)

    def detect_grid_section(self, frame, num_rows=5, num_cols=5):
        return self.grid_detector.detect(frame, num_rows, num_cols)


__all__ = ["SectionDetector", "StrandDetector", "GridDetector"]
