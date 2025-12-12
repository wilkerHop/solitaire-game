/**
 * Move scoring functions
 */

import type { Move } from '../types'

export type ScoringMode = 'standard' | 'vegas'

interface ScoreChange {
  readonly points: number
  readonly reason: string
}

export function calculateMoveScore(
  move: Move,
  wasCardFlipped: boolean,
  mode: ScoringMode = 'standard'
): ScoreChange {
  if (mode === 'vegas') {
    if (move.to.type === 'foundation') {
      return { points: 5, reason: 'Card to foundation' }
    }
    if (move.from.type === 'foundation' && move.to.type === 'tableau') {
      return { points: -5, reason: 'Card from foundation' }
    }
    return { points: 0, reason: '' }
  }
  
  const baseScore = ((): { points: number; reason: string } => {
    if (move.from.type === 'waste' && move.to.type === 'tableau') {
      return { points: 5, reason: 'Waste to Tableau' }
    }
    if (move.from.type === 'waste' && move.to.type === 'foundation') {
      return { points: 10, reason: 'Waste to Foundation' }
    }
    if (move.from.type === 'tableau' && move.to.type === 'foundation') {
      return { points: 10, reason: 'Tableau to Foundation' }
    }
    if (move.from.type === 'foundation' && move.to.type === 'tableau') {
      return { points: -15, reason: 'Foundation to Tableau (penalty)' }
    }
    return { points: 0, reason: '' }
  })()
  
  const flipBonus = wasCardFlipped && move.from.type === 'tableau' ? 5 : 0
  const flipReason = flipBonus > 0 ? (baseScore.reason ? ' + Card flip' : 'Card flip') : ''
  
  return { points: baseScore.points + flipBonus, reason: baseScore.reason + flipReason }
}
