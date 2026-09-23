"""
Part I — SHS Strand Checkbox Detector.
Detects 3 vertical choices: 1=STEM, 2=TVL-ICT, 3=Non-Aligned.
"""
import cv2
import numpy as np
from detector.preprocessor import preprocess_frame, get_roi_density


class StrandDetector:
    LABELS = ["1: STEM", "2: TVL-ICT", "3: Non-Aligned"]

    def detect(self, frame):
        """
        Detects selected strand from camera frame.
        Returns: (detected_choice, annotated_frame, scores)
        """
        overlay = frame.copy()
        h, w = frame.shape[:2]
        _, thresh = preprocess_frame(frame)

        # Morphological filter to isolate boxes
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        dilated = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        contours, _ = cv2.findContours(dilated, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

        candidates = []
        for c in contours:
            x, y, bw, bh = cv2.boundingRect(c)
            aspect = float(bw) / bh if bh > 0 else 0
            min_s, max_s = int(min(h, w) * 0.02), int(min(h, w) * 0.15)
            if 0.75 <= aspect <= 1.35 and min_s <= bw <= max_s and min_s <= bh <= max_s:
                candidates.append((x, y, bw, bh))

        # Filter overlapping boxes and group vertically
        selected_boxes, boxes_found = self._select_vertical_boxes(candidates, h, w)

        # Calculate ink density in each box
        scores = []
        for bx, by, bw, bh in selected_boxes:
            px, py = int(bw * 0.18), int(bh * 0.18)
            density = get_roi_density(thresh, bx + px, by + py, bx + bw - px, by + bh - py)
            scores.append(density)

        best_idx = int(np.argmax(scores)) if scores else 0
        max_score = scores[best_idx] if scores else 0.0
        detected_choice = (best_idx + 1) if max_score > 0.04 else None

        sorted_scores = sorted(scores, reverse=True)
        top_score = sorted_scores[0] if sorted_scores else 0.0
        second_score = sorted_scores[1] if len(sorted_scores) > 1 else 0.0
        contrast = top_score - second_score

        is_valid = bool(detected_choice is not None and top_score >= 0.045 and contrast >= 0.012)
        confidence = float(min(1.0, max(0.0, contrast * 12.0 + (0.3 if boxes_found else 0.0))))

        meta = {
            "boxes_found": bool(boxes_found),
            "confidence": round(confidence, 3),
            "is_valid": is_valid,
        }

        # Draw overlays
        for idx, (bx, by, bw, bh) in enumerate(selected_boxes):
            is_checked = (idx == best_idx and max_score > 0.04)
            color = (255, 150, 0) if is_checked else (160, 160, 160)
            cv2.rectangle(overlay, (bx, by), (bx + bw, by + bh), color, 3 if is_checked else 1)

            label = self.LABELS[idx] if idx < len(self.LABELS) else f"Opt {idx + 1}"
            cv2.putText(
                overlay, f"{label} ({scores[idx]:.2f})",
                (bx + bw + 10, by + int(bh * 0.7)),
                cv2.FONT_HERSHEY_SIMPLEX, 0.55, color, 2 if is_checked else 1, cv2.LINE_AA
            )
            if is_checked:
                cv2.circle(overlay, (bx + bw // 2, by + bh // 2), int(bw * 0.25), (255, 150, 0), -1)

        return detected_choice, overlay, scores, meta

    def _select_vertical_boxes(self, candidates, h, w):
        """Finds 3 vertically aligned boxes or falls back to template positions."""
        unique = []
        for b in sorted(candidates, key=lambda b: b[1]):
            if not any(abs(b[0] - u[0]) < 20 and abs(b[1] - u[1]) < 20 for u in unique):
                unique.append(b)

        if len(unique) >= 3:
            by_x = {}
            for b in unique:
                key = round(b[0] / 40.0) * 40
                by_x.setdefault(key, []).append(b)
            best_group = sorted(max(by_x.values(), key=len), key=lambda b: b[1])
            if len(best_group) >= 3:
                return best_group[:3], True

        # Template fallback if lighting/angle prevents contour detection
        box_s = int(min(h, w) * 0.06)
        start_x, start_y = int(w * 0.15), int(h * 0.35)
        spacing = int(box_s * 2.2)
        return [(start_x, start_y + i * spacing, box_s, box_s) for i in range(3)], False
