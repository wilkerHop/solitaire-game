/**
 * History state management for undo/redo
 */

import type { GameState } from '../game'
import { dealGame } from '../game'

const MAX_HISTORY_LENGTH = 100

export interface HistoryState {
  readonly past: readonly GameState[]
  readonly present: GameState
  readonly future: readonly GameState[]
}

export function pushToHistory(history: HistoryState, newState: GameState): HistoryState {
  const newPast = [...history.past, history.present]
  const trimmedPast = newPast.length > MAX_HISTORY_LENGTH
    ? newPast.slice(-MAX_HISTORY_LENGTH)
    : newPast
  return { past: trimmedPast, present: newState, future: [] }
}

export function undoHistory(history: HistoryState): HistoryState | null {
  if (history.past.length === 0) return null
  const newPast = history.past.slice(0, -1)
  const previousState = history.past[history.past.length - 1]
  return {
    past: newPast,
    present: previousState,
    future: [history.present, ...history.future],
  }
}

export function redoHistory(history: HistoryState): HistoryState | null {
  if (history.future.length === 0) return null
  const nextState = history.future[0]
  const newFuture = history.future.slice(1)
  return {
    past: [...history.past, history.present],
    present: nextState,
    future: newFuture,
  }
}

export function createInitialHistory(seed?: number): HistoryState {
  return { past: [], present: dealGame(seed), future: [] }
}
