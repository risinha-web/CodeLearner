import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number): string {
  return `${Math.round(score)}%`;
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  return "text-red-400";
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "EASY":
      return "text-green-400 border-green-400/50 bg-green-400/10";
    case "MEDIUM":
      return "text-yellow-400 border-yellow-400/50 bg-yellow-400/10";
    case "HARD":
      return "text-red-400 border-red-400/50 bg-red-400/10";
    default:
      return "text-gray-400";
  }
}

export function getPlayerDifficultyLabel(difficulty: string): string {
  switch (difficulty) {
    case "EASY":
      return "Beginner";
    case "MEDIUM":
      return "Intermediate";
    case "HARD":
      return "Advanced";
    default:
      return "Beginner";
  }
}
