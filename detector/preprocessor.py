"""
Image Preprocessing Utilities for AutoTally Checkbox Detection.
"""
import cv2


def preprocess_frame(image):
    """
    Converts frame to grayscale and applies adaptive thresholding.
    Ink marks and lines become white (255), white paper becomes black (0).
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    thresh = cv2.adaptiveThreshold(
        blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 25, 10
    )
    return gray, thresh


def get_roi_density(thresh, x1, y1, x2, y2):
    """Calculates the proportion of dark ink pixels inside the specified region."""
    roi = thresh[y1:y2, x1:x2]
    if roi.size == 0:
        return 0.0
    return float(cv2.countNonZero(roi)) / float(roi.size)
