/**
 * Game scoring utilities
 */

import type { GameState } from '../types'
import type { ScoringMode } from './move-score'

export function calculateTimeBonus(
  elapsedSeconds: number,
  mode: ScoringMode = 'standard'
): number {
  if (mode === 'vegas') return 0
  if (elapsedSeconds <= 30) return 700000 / 30
  if (elapsedSeconds >= 600) return 0
  return Math.floor(700000 / elapsedSeconds)
}

export function calculateFinalScore(
  currentScore: number,
  elapsedSeconds: number,
  mode: ScoringMode = 'standard'
): number {
  return currentScore + calculateTimeBonus(elapsedSeconds, mode)
}

export function getInitialScore(mode: ScoringMode = 'standard'): number {
  return mode === 'vegas' ? -52 : 0
}

export function isUndoAllowed(mode: ScoringMode = 'standard'): boolean {
  return mode === 'standard'
}

export function formatScore(score: number, mode: ScoringMode = 'standard'): string {
  if (mode === 'vegas') {
    return score >= 0 ? `$${String(score)}` : `-$${String(Math.abs(score))}`
  }
  return String(score)
}

export function calculateProgress(state: GameState): number {
  const totalCards = 52
  const cardsInFoundation = 
    state.foundations.hearts.length +
    state.foundations.diamonds.length +
    state.foundations.clubs.length +
    state.foundations.spades.length
  return Math.round((cardsInFoundation / totalCards) * 100)
}
