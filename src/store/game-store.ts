/**
 * Game Store - Zustand-based state management for Solitaire
 * Uses Mapped Object Literals instead of switch for dispatch
 */

import { create } from 'zustand'
import type { GameState, Move } from '../game'
import { applyMove, canAutoComplete, drawFromStock } from '../game'
import { performAutoComplete } from './auto-complete'
import { createInitialHistory, type HistoryState, pushToHistory, redoHistory, undoHistory } from './history'

export type GameAction =
  | { type: 'NEW_GAME'; seed?: number }
  | { type: 'MOVE_CARD'; move: Move }
  | { type: 'DRAW_CARD'; count?: number }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'AUTO_COMPLETE' }

type GameActionType = GameAction['type']

interface GameStore {
  history: HistoryState
  isGameStarted: boolean
  gameState: () => GameState
  canUndo: () => boolean
  canRedo: () => boolean
  dispatch: (action: GameAction) => void
  newGame: (seed?: number) => void
  moveCard: (move: Move) => void
  drawCard: (count?: number) => void
  undo: () => void
  redo: () => void
  autoComplete: () => void
}

/** Action dispatcher map - ensures exhaustive handling of all action types */
type ActionHandler = (store: GameStore, action: GameAction) => void

const actionHandlers: Record<GameActionType, ActionHandler> = {
  NEW_GAME: (store, action) => { if (action.type === 'NEW_GAME') store.newGame(action.seed) },
  MOVE_CARD: (store, action) => { if (action.type === 'MOVE_CARD') store.moveCard(action.move) },
  DRAW_CARD: (store, action) => { if (action.type === 'DRAW_CARD') store.drawCard(action.count) },
  UNDO: (store) => { store.undo() },
  REDO: (store) => { store.redo() },
  AUTO_COMPLETE: (store) => { store.autoComplete() },
}

export const useGameStore = create<GameStore>()((set, get) => ({
  history: createInitialHistory(),
  isGameStarted: true,
  gameState: (): GameState => get().history.present,
  canUndo: (): boolean => get().history.past.length > 0,
  canRedo: (): boolean => get().history.future.length > 0,
  
  dispatch: (action: GameAction): void => {
    const store = get()
    const handler = actionHandlers[action.type]
    handler(store, action)
  },
  
  newGame: (seed?: number): void => {
    set({ history: createInitialHistory(seed), isGameStarted: true })
  },
  moveCard: (move: Move): void => {
    const { history } = get()
    const result = applyMove(history.present, move)
    if (result.success) set({ history: pushToHistory(history, result.value) })
  },
  drawCard: (count = 1): void => {
    const { history } = get()
    const newState = drawFromStock(history.present, count)
    if (newState !== history.present) set({ history: pushToHistory(history, newState) })
  },
  undo: (): void => {
    const newHistory = undoHistory(get().history)
    if (newHistory) set({ history: newHistory })
  },
  redo: (): void => {
    const newHistory = redoHistory(get().history)
    if (newHistory) set({ history: newHistory })
  },
  autoComplete: (): void => {
    const { history } = get()
    const currentState = history.present
    if (!canAutoComplete(currentState)) return
    const finalState = performAutoComplete(currentState)
    if (finalState !== currentState) set({ history: pushToHistory(history, finalState) })
  },
}))
