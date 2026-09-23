"""
Grid Sections Detector (Sections A-C).
Detects 5 rows (Q1-Q5) x 5 columns (Scale 5, 4, 3, 2, 1).
"""
import cv2
import numpy as np
from detector.preprocessor import preprocess_frame, get_roi_density


class GridDetector:
    COLUMN_VALUES = [5, 4, 3, 2, 1]

    def detect(self, frame, num_rows=5, num_cols=5):
        """
        Detects selected options across a 5x5 grid.
        Returns: (detected_values, annotated_frame, all_row_scores)
        """
        overlay = frame.copy()
        h, w = frame.shape[:2]
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # CLAHE (Contrast Limited Adaptive Histogram Equalization) to balance shadows and uneven phone lighting
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)

        blurred = cv2.GaussianBlur(enhanced, (5, 5), 0)
        thresh = cv2.adaptiveThreshold(
            blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 31, 8
        )

        table_box = self._find_table_roi(thresh, w, h)
        tx, ty, tw, th = table_box
        cv2.rectangle(overlay, (tx, ty), (tx + tw, ty + th), (255, 200, 0), 2)

        # The right 52% of the table holds the 5 checkbox columns; top 16% is header
        grid_start_x = tx + int(tw * 0.48)
        grid_w = (tx + tw) - grid_start_x
        grid_start_y = ty + int(th * 0.16)
        grid_h = (ty + th) - grid_start_y

        cell_w = grid_w / float(num_cols)
        cell_h = grid_h / float(num_rows)

        detected_values, all_row_scores = [], []
        for r in range(num_rows):
            ry1, ry2 = int(grid_start_y + r * cell_h), int(grid_start_y + (r + 1) * cell_h)
            col_scores, col_boxes = [], []

            for c in range(num_cols):
                cx1, cx2 = int(grid_start_x + c * cell_w), int(grid_start_x + (c + 1) * cell_w)
                # Sample centered 60% of cell to eliminate surrounding table border lines
                mx, my = int(cell_w * 0.22), int(cell_h * 0.22)
                bx1, by1, bx2, by2 = cx1 + mx, ry1 + my, cx2 - mx, ry2 - my
                col_scores.append(get_roi_density(thresh, bx1, by1, bx2, by2))
                col_boxes.append((bx1, by1, bx2, by2))

            all_row_scores.append(col_scores)
            best_c = int(np.argmax(col_scores))
            val = self.COLUMN_VALUES[best_c]
            detected_values.append(val)

            # Draw cell boxes and markers
            for c in range(num_cols):
                bx1, by1, bx2, by2 = col_boxes[c]
                is_sel = (c == best_c)
                cv2.rectangle(overlay, (bx1, by1), (bx2, by2), (0, 230, 0) if is_sel else (140, 140, 140), 2 if is_sel else 1)
                if is_sel:
                    cv2.circle(overlay, ((bx1 + bx2) // 2, (by1 + by2) // 2), max(4, int(cell_h * 0.15)), (0, 230, 0), -1)

            cv2.putText(overlay, f"Q{r+1}: {val}", (tx + 10, ry1 + int(cell_h * 0.65)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2, cv2.LINE_AA)

        # Draw header scale numbers
        for c, v in enumerate(self.COLUMN_VALUES):
            cx = int(grid_start_x + c * cell_w + cell_w / 2 - 8)
            cv2.putText(overlay, str(v), (cx, max(20, grid_start_y - 8)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2, cv2.LINE_AA)

        return detected_values, overlay, all_row_scores

    def _find_table_roi(self, thresh, w, h):
        """Locates table boundary via grid morphology, or returns center guide ROI."""
        # Detect horizontal and vertical lines of the grid
        horiz_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (max(15, int(w / 35)), 1))
        vert_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, max(15, int(h / 35))))
        horiz = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, horiz_kernel)
        vert = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, vert_kernel)
        table_mask = cv2.add(horiz, vert)

        contours, _ = cv2.findContours(table_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        min_area = (w * h) * 0.10
        max_area = (w * h) * 0.95
        best_box = None
        best_area = 0

        for c in contours:
            area = cv2.contourArea(c)
            if min_area <= area <= max_area:
                x, y, tw, th = cv2.boundingRect(c)
                # Table typically has aspect ratio between 1.0 and 2.5
                aspect = float(tw) / th if th > 0 else 0
                if 0.8 <= aspect <= 3.0 and area > best_area:
                    best_area = area
                    best_box = (x, y, tw, th)

        if best_box:
            return best_box

        # Fallback centered box (viewfinder framing)
        gw, gh = int(w * 0.78), int(h * 0.68)
        return (int((w - gw) / 2), int((h - gh) / 2), gw, gh)
