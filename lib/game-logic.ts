import type { Difficulty, PlayerDifficulty } from "@prisma/client";

/**
 * Maps player difficulty to the LeetCode question difficulty they will face.
 * Hard player → Medium LeetCode questions
 * Easy/Medium player → Easy LeetCode questions
 */
export function getTargetDifficulty(playerDifficulty: PlayerDifficulty): Difficulty {
  if (playerDifficulty === "HARD") return "MEDIUM";
  return "EASY";
}

/**
 * Returns the difficulties a player can see based on their level.
 * We show all questions in a module ordered by difficulty, starting from the
 * player's assessed level.
 */
export function getVisibleDifficulties(playerDifficulty: PlayerDifficulty): Difficulty[] {
  if (playerDifficulty === "HARD") return ["MEDIUM", "HARD", "EASY"];
  if (playerDifficulty === "MEDIUM") return ["EASY", "MEDIUM", "HARD"];
  return ["EASY", "MEDIUM", "HARD"];
}

/**
 * Determines starting player difficulty based on preliminary quiz score.
 */
export function assessPlayerDifficulty(quizScore: number): PlayerDifficulty {
  if (quizScore > 75) return "HARD";
  if (quizScore >= 40) return "MEDIUM";
  return "EASY";
}

/**
 * Computes the coding round score for a question attempt.
 * Base 100, deducted for hints used and time taken.
 */
export function computeCodingScore(hintsUsed: number, timeSeconds?: number): number {
  let score = 100;
  score -= hintsUsed * 20;
  if (timeSeconds) {
    const penaltyMinutes = Math.max(0, timeSeconds / 60 - 15);
    score -= Math.min(20, penaltyMinutes * 1.5);
  }
  return Math.max(0, Math.round(score));
}

/**
 * Checks if the player qualifies for a difficulty upgrade after completing a module round.
 */
export function shouldUpgradeDifficulty(avgScore: number, currentDifficulty: PlayerDifficulty): boolean {
  if (currentDifficulty === "HARD") return false;
  return avgScore >= 90;
}

/**
 * Determines next player difficulty.
 */
export function getUpgradedDifficulty(current: PlayerDifficulty): PlayerDifficulty {
  if (current === "EASY") return "MEDIUM";
  if (current === "MEDIUM") return "HARD";
  return "HARD";
}

/**
 * Checks if a module is unlocked based on previous module's mediumScore.
 */
export function isModuleUnlocked(moduleOrder: number, previousMediumScore: number | null | undefined): boolean {
  if (moduleOrder === 1) return true;
  return (previousMediumScore ?? 0) >= 80;
}

/**
 * Computes interview difficulty modifier label.
 */
export function getInterviewDifficultyLabel(modifier: number): string {
  if (modifier === 0) return "Standard";
  if (modifier === 1) return "Elevated";
  return "Challenging";
}

/**
 * Computes aggregate score for a completed module.
 */
export function computeModuleScore(attempts: { totalScore: number | null }[]): number {
  const completed = attempts.filter((a) => a.totalScore !== null);
  if (completed.length === 0) return 0;
  const sum = completed.reduce((acc, a) => acc + (a.totalScore ?? 0), 0);
  return Math.round(sum / completed.length);
}
