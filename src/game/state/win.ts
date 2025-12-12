/**
 * Win condition and auto-complete checks
 */

import type { GameState } from '../types'

export function checkWinCondition(state: GameState): boolean {
  const { foundations } = state
  return (
    foundations.hearts.length === 13 &&
    foundations.diamonds.length === 13 &&
    foundations.clubs.length === 13 &&
    foundations.spades.length === 13
  )
}

export function canAutoComplete(state: GameState): boolean {
  if (state.stockAndWaste.stock.length > 0 || state.stockAndWaste.waste.length > 0) {
    return false
  }
  
  return state.tableau.columns.every(column =>
    column.every(card => card.faceUp)
  )
}
