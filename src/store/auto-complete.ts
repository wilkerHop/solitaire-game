/**
 * Auto-complete functionality for the game
 */

import type { GameState, Move } from '../game'
import { applyMove, checkWinCondition } from '../game'

export function performAutoComplete(currentState: GameState): GameState {
  const tryAutoMove = (state: GameState): GameState => {
    if (checkWinCondition(state)) return state
    const findMove = (colIndex: number): GameState | null => {
      if (colIndex >= 7) return null
      const column = state.tableau.columns[colIndex]
      if (column.length === 0) return findMove(colIndex + 1)

      // Try all foundation indices since they are no longer suit-specific
      for (let i = 0; i < 4; i++) {
        const move: Move = {
          from: { type: 'tableau', columnIndex: colIndex, cardIndex: column.length - 1 },
          to: { type: 'foundation', pileIndex: i },
          cardCount: 1,
        }
        const result = applyMove(state, move)
        if (result.success) return result.value
      }
      return findMove(colIndex + 1)
    }
    const newState = findMove(0)
    return newState ? tryAutoMove(newState) : state
  }
  return tryAutoMove(currentState)
}
