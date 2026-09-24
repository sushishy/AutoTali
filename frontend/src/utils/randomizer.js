/**
 * Randomize answers for an unanswered survey section.
 * - Section 1 (Strand): Randomly picks 1 (STEM), 2 (TVL-ICT), or 3 (Non-Aligned).
 * - Sections 2-7 (Likert Grid): Generates favorable/best-possible responses (weighted 4s and 5s, with occasional 3s)
 *   for the 5 questions in the active section.
 */
export function generateRandomSectionAnswer(section) {
  const isStrand = section?.type === 'strand' || section?.id === 1;

  if (isStrand) {
    // Return random strand: 1, 2, or 3
    return Math.floor(Math.random() * 3) + 1;
  }

  // Best possible answers pool (heavily weighted towards Agree / Strongly Agree)
  const pool = [5, 5, 5, 4, 4, 4, 3];
  return Array.from({ length: 5 }, () => {
    return pool[Math.floor(Math.random() * pool.length)];
  });
}
