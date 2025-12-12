/**
 * Scoring System for Solitaire Game
 * 
 * Standard Scoring Rules:
 * - Move from Waste to Tableau: +5 points
 * - Move from Waste to Foundation: +10 points
 * - Move from Tableau to Foundation: +10 points
 * - Turn over Tableau card: +5 points
 * - Move from Foundation to Tableau: -15 points
 * - Time bonus: 700,000 / seconds (if won in under 30 seconds, max bonus)
 * 
 * Vegas Scoring Rules:
 * - Start with -$52 (cost of deck)
 * - Each card to Foundation: +$5
 * - No undo allowed in Vegas mode
 */

import type { GameState, Move } from './types'

export type ScoringMode = 'standard' | 'vegas'

interface ScoreChange {
  readonly points: number
  readonly reason: string
}

/**
 * Calculate the score change for a move in standard scoring mode.
 */
export function calculateMoveScore(
  move: Move,
  wasCardFlipped: boolean,
  mode: ScoringMode = 'standard'
): ScoreChange {
  if (mode === 'vegas') {
    // Vegas mode: only score foundation moves
    if (move.to.type === 'foundation') {
      return { points: 5, reason: 'Card to foundation' }
    }
    if (move.from.type === 'foundation' && move.to.type === 'tableau') {
      return { points: -5, reason: 'Card from foundation' }
    }
    return { points: 0, reason: '' }
  }
  
  // Standard scoring mode
  let points = 0
  let reason = ''
  
  // From Waste to Tableau
  if (move.from.type === 'waste' && move.to.type === 'tableau') {
    points = 5
    reason = 'Waste to Tableau'
  }
  // From Waste to Foundation
  else if (move.from.type === 'waste' && move.to.type === 'foundation') {
    points = 10
    reason = 'Waste to Foundation'
  }
  // From Tableau to Foundation
  else if (move.from.type === 'tableau' && move.to.type === 'foundation') {
    points = 10
    reason = 'Tableau to Foundation'
  }
  // From Foundation to Tableau (penalty)
  else if (move.from.type === 'foundation' && move.to.type === 'tableau') {
    points = -15
    reason = 'Foundation to Tableau (penalty)'
  }
  
  // Bonus for flipping a card
  if (wasCardFlipped && move.from.type === 'tableau') {
    points += 5
    if (reason) {
      reason += ' + Card flip'
    } else {
      reason = 'Card flip'
    }
  }
  
  return { points, reason }
}

/**
 * Calculate the time bonus for winning a game.
 * Only applied in standard scoring mode.
 */
export function calculateTimeBonus(
  elapsedSeconds: number,
  mode: ScoringMode = 'standard'
): number {
  if (mode === 'vegas') {
    return 0
  }
  
  if (elapsedSeconds <= 30) {
    // Maximum bonus for very fast wins
    return 700000 / 30
  }
  
  // No bonus after 10 minutes
  if (elapsedSeconds >= 600) {
    return 0
  }
  
  // Standard time bonus
  return Math.floor(700000 / elapsedSeconds)
}

/**
 * Calculate the final score including time bonus.
 */
export function calculateFinalScore(
  currentScore: number,
  elapsedSeconds: number,
  mode: ScoringMode = 'standard'
): number {
  return currentScore + calculateTimeBonus(elapsedSeconds, mode)
}

/**
 * Calculate the initial score for a new game.
 */
export function getInitialScore(mode: ScoringMode = 'standard'): number {
  return mode === 'vegas' ? -52 : 0
}

/**
 * Check if undo is allowed in the current scoring mode.
 */
export function isUndoAllowed(mode: ScoringMode = 'standard'): boolean {
  return mode === 'standard'
}

/**
 * Get a formatted score string.
 */
export function formatScore(score: number, mode: ScoringMode = 'standard'): string {
  if (mode === 'vegas') {
    return score >= 0 ? `$${String(score)}` : `-$${String(Math.abs(score))}`
  }
  return String(score)
}

/**
 * Calculate overall game progress (0-100%).
 */
export function calculateProgress(state: GameState): number {
  const totalCards = 52
  const cardsInFoundation = 
    state.foundations.hearts.length +
    state.foundations.diamonds.length +
    state.foundations.clubs.length +
    state.foundations.spades.length
  
  return Math.round((cardsInFoundation / totalCards) * 100)
}
