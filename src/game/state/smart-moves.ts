/**
 * Smart move logic for double-click actions
 */

import type { CardLocation, GameState, Move } from '../types'
import { getCardAtLocation } from './accessors'
import { validateMove } from './validation'

export function findBestMove(state: GameState, from: CardLocation): Move | null {
  const card = getCardAtLocation(state, from)
  if (!card) return null

  // Determine card count for the move
  const cardCount = from.type === 'tableau'
    ? state.tableau.columns[from.columnIndex].length - from.cardIndex
    : 1

  // 1. Try Foundations (only if moving single card)
  if (cardCount === 1) {
    for (let i = 0; i < 4; i++) {
      const to: CardLocation = { type: 'foundation', pileIndex: i }
      const move: Move = { from, to, cardCount: 1 }
      if (validateMove(state, move).success) {
        return move
      }
    }
  }

  // 2. Try Tableau Columns
  for (let i = 0; i < 7; i++) {
    // Don't move to same column
    if (from.type === 'tableau' && from.columnIndex === i) continue

    const to: CardLocation = { type: 'tableau', columnIndex: i, cardIndex: 0 }
    const move: Move = { from, to, cardCount }
    
    if (validateMove(state, move).success) {
      return move
    }
  }

  return null
}
