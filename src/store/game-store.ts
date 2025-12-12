/**
 * Game Store - Zustand-based state management for the Solitaire game.
 * 
 * Implements undo/redo functionality using a functional history pattern.
 * Uses vanilla Zustand (no Immer) to maintain consistency with our
 * already-immutable game state types.
 */

import { create } from 'zustand';
import type { GameState, Move } from '../game';
import {
  applyMove,
  canAutoComplete,
  checkWinCondition,
  dealGame,
  drawFromStock,
} from '../game';

// =============================================================================
// Action Types
// =============================================================================

/**
 * All possible game actions that can be dispatched.
 */
export type GameAction =
  | { type: 'NEW_GAME'; seed?: number }
  | { type: 'MOVE_CARD'; move: Move }
  | { type: 'DRAW_CARD'; count?: number }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'AUTO_COMPLETE' }

// =============================================================================
// History State for Undo/Redo
// =============================================================================

interface HistoryState {
  /** Stack of past game states (most recent last) */
  readonly past: readonly GameState[]
  /** Current game state */
  readonly present: GameState
  /** Stack of future game states (for redo, most recent first) */
  readonly future: readonly GameState[]
}

// =============================================================================
// Store State & Actions
// =============================================================================

interface GameStore {
  // State
  history: HistoryState
  isGameStarted: boolean
  
  // Derived state accessors
  gameState: () => GameState
  canUndo: () => boolean
  canRedo: () => boolean
  
  // Actions
  dispatch: (action: GameAction) => void
  newGame: (seed?: number) => void
  moveCard: (move: Move) => void
  drawCard: (count?: number) => void
  undo: () => void
  redo: () => void
  autoComplete: () => void
}

// =============================================================================
// Store Configuration
// =============================================================================

/** Maximum number of states to keep in history (memory optimization) */
const MAX_HISTORY_LENGTH = 100

/**
 * Push a new state to history, clearing the future stack.
 */
function pushToHistory(history: HistoryState, newState: GameState): HistoryState {
  const newPast = [...history.past, history.present]
  
  // Trim history if it exceeds max length
  const trimmedPast = newPast.length > MAX_HISTORY_LENGTH
    ? newPast.slice(-MAX_HISTORY_LENGTH)
    : newPast
  
  return {
    past: trimmedPast,
    present: newState,
    future: [], // Clear redo stack on new action
  }
}

/**
 * Undo: Move present to future, pop from past to present.
 */
function undoHistory(history: HistoryState): HistoryState | null {
  if (history.past.length === 0) {
    return null
  }
  
  const newPast = history.past.slice(0, -1)
  const previousState = history.past[history.past.length - 1]
  
  return {
    past: newPast,
    present: previousState,
    future: [history.present, ...history.future],
  }
}

/**
 * Redo: Move present to past, pop from future to present.
 */
function redoHistory(history: HistoryState): HistoryState | null {
  if (history.future.length === 0) {
    return null
  }
  
  const nextState = history.future[0]
  const newFuture = history.future.slice(1)
  
  return {
    past: [...history.past, history.present],
    present: nextState,
    future: newFuture,
  }
}

// =============================================================================
// Initial State
// =============================================================================

function createInitialHistory(seed?: number): HistoryState {
  return {
    past: [],
    present: dealGame(seed),
    future: [],
  }
}

// =============================================================================
// Store Creation
// =============================================================================

export const useGameStore = create<GameStore>()((set, get) => ({
  // Initial state
  history: createInitialHistory(),
  isGameStarted: true,
  
  // Derived state accessors
  gameState: (): GameState => get().history.present,
  canUndo: (): boolean => get().history.past.length > 0,
  canRedo: (): boolean => get().history.future.length > 0,
  
  // Unified dispatcher
  dispatch: (action: GameAction): void => {
    const store = get()
    
    switch (action.type) {
      case 'NEW_GAME':
        store.newGame(action.seed)
        break
      case 'MOVE_CARD':
        store.moveCard(action.move)
        break
      case 'DRAW_CARD':
        store.drawCard(action.count)
        break
      case 'UNDO':
        store.undo()
        break
      case 'REDO':
        store.redo()
        break
      case 'AUTO_COMPLETE':
        store.autoComplete()
        break
    }
  },
  
  // Individual action implementations
  newGame: (seed?: number): void => {
    set({
      history: createInitialHistory(seed),
      isGameStarted: true,
    })
  },
  
  moveCard: (move: Move): void => {
    const { history } = get()
    const result = applyMove(history.present, move)
    if (result.success) {
      set({ history: pushToHistory(history, result.value) })
    }
    // If move fails, state remains unchanged
  },
  
  drawCard: (count = 1): void => {
    const { history } = get()
    const newState = drawFromStock(history.present, count)
    // Only push to history if state actually changed
    if (newState !== history.present) {
      set({ history: pushToHistory(history, newState) })
    }
  },
  
  undo: (): void => {
    const { history } = get()
    const newHistory = undoHistory(history)
    if (newHistory) {
      set({ history: newHistory })
    }
  },
  
  redo: (): void => {
    const { history } = get()
    const newHistory = redoHistory(history)
    if (newHistory) {
      set({ history: newHistory })
    }
  },
  
  autoComplete: (): void => {
    const { history } = get()
    const currentState = history.present
    
    // Can only auto-complete when conditions are met
    if (!canAutoComplete(currentState)) {
      return
    }
    
    // Recursive auto-complete: try to move cards to foundations until no progress
    const tryAutoMove = (state: GameState): GameState => {
      if (checkWinCondition(state)) {
        return state
      }
      
      // Find first valid move to foundation
      const findMove = (colIndex: number): GameState | null => {
        if (colIndex >= 7) return null
        
        const column = state.tableau.columns[colIndex]
        if (column.length === 0) return findMove(colIndex + 1)
        
        const topCard = column[column.length - 1]
        const move: Move = {
          from: { type: 'tableau', columnIndex: colIndex, cardIndex: column.length - 1 },
          to: { type: 'foundation', suit: topCard.suit },
          cardCount: 1,
        }
        
        const result = applyMove(state, move)
        return result.success ? result.value : findMove(colIndex + 1)
      }
      
      const newState = findMove(0)
      return newState ? tryAutoMove(newState) : state
    }
    
    const finalState = tryAutoMove(currentState)
    
    // Push final state to history
    if (finalState !== currentState) {
      set({ history: pushToHistory(history, finalState) })
    }
  },
}))

// =============================================================================
// Selector Hooks for Performance Optimization
// =============================================================================

/**
 * Select specific parts of state to avoid unnecessary re-renders.
 */
export const useGameState = (): GameState => 
  useGameStore((state) => state.history.present)

export const useIsWon = (): boolean =>
  useGameStore((state) => state.history.present.isWon)

export const useCanUndo = (): boolean =>
  useGameStore((state) => state.history.past.length > 0)

export const useCanRedo = (): boolean =>
  useGameStore((state) => state.history.future.length > 0)

export const useStats = (): GameState['stats'] =>
  useGameStore((state) => state.history.present.stats)

export const useTableau = (): GameState['tableau'] =>
  useGameStore((state) => state.history.present.tableau)

export const useFoundations = (): GameState['foundations'] =>
  useGameStore((state) => state.history.present.foundations)

export const useStockAndWaste = (): GameState['stockAndWaste'] =>
  useGameStore((state) => state.history.present.stockAndWaste)
