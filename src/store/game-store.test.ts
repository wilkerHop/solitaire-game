import { beforeEach, describe, expect, it } from 'vitest'
import type { Move } from '../game'
import { useGameStore } from './game-store'

describe('Game Store', () => {
  // Reset the store before each test
  beforeEach(() => {
    useGameStore.getState().newGame(42) // Use fixed seed for determinism
  })

  describe('initial state', () => {
    it('should start with a dealt game', () => {
      const state = useGameStore.getState()
      expect(state.isGameStarted).toBe(true)
      expect(state.history.present.tableau.columns[0].length).toBe(1)
    })

    it('should have empty history stacks', () => {
      const state = useGameStore.getState()
      expect(state.history.past.length).toBe(0)
      expect(state.history.future.length).toBe(0)
    })

    it('should not be won', () => {
      const state = useGameStore.getState()
      expect(state.history.present.isWon).toBe(false)
    })
  })

  describe('newGame', () => {
    it('should reset the game state', () => {
      // Make some moves first
      useGameStore.getState().drawCard()
      useGameStore.getState().drawCard()
      
      // Now start a new game
      useGameStore.getState().newGame(99)
      
      const state = useGameStore.getState()
      expect(state.history.past.length).toBe(0)
      expect(state.history.future.length).toBe(0)
      expect(state.history.present.stockAndWaste.waste.length).toBe(0)
    })

    it('should produce deterministic results with same seed', () => {
      useGameStore.getState().newGame(12345)
      const state1 = useGameStore.getState().history.present
      
      useGameStore.getState().newGame(12345)
      const state2 = useGameStore.getState().history.present
      
      expect(state1.tableau.columns[0][0].suit).toBe(state2.tableau.columns[0][0].suit)
      expect(state1.tableau.columns[0][0].rank).toBe(state2.tableau.columns[0][0].rank)
    })
  })

  describe('drawCard', () => {
    it('should move cards from stock to waste', () => {
      const initialStock = useGameStore.getState().history.present.stockAndWaste.stock.length
      
      useGameStore.getState().drawCard()
      
      const state = useGameStore.getState()
      expect(state.history.present.stockAndWaste.stock.length).toBe(initialStock - 1)
      expect(state.history.present.stockAndWaste.waste.length).toBe(1)
    })

    it('should add state to history', () => {
      useGameStore.getState().drawCard()
      
      const state = useGameStore.getState()
      expect(state.history.past.length).toBe(1)
    })

    it('should clear future stack', () => {
      // Draw, then undo, then draw again
      useGameStore.getState().drawCard()
      useGameStore.getState().undo()
      
      expect(useGameStore.getState().history.future.length).toBe(1)
      
      useGameStore.getState().drawCard()
      
      expect(useGameStore.getState().history.future.length).toBe(0)
    })
  })

  describe('undo/redo', () => {
    it('should undo a draw action', () => {
      const initialState = useGameStore.getState().history.present
      
      useGameStore.getState().drawCard()
      useGameStore.getState().undo()
      
      const state = useGameStore.getState()
      expect(state.history.present.stockAndWaste.stock.length)
        .toBe(initialState.stockAndWaste.stock.length)
    })

    it('should redo an undone action', () => {
      useGameStore.getState().drawCard()
      const stateAfterDraw = useGameStore.getState().history.present
      
      useGameStore.getState().undo()
      useGameStore.getState().redo()
      
      const state = useGameStore.getState()
      expect(state.history.present.stockAndWaste.stock.length)
        .toBe(stateAfterDraw.stockAndWaste.stock.length)
    })

    it('should handle multiple undo/redo operations', () => {
      useGameStore.getState().drawCard()
      useGameStore.getState().drawCard()
      useGameStore.getState().drawCard()
      
      expect(useGameStore.getState().history.past.length).toBe(3)
      
      useGameStore.getState().undo()
      useGameStore.getState().undo()
      
      expect(useGameStore.getState().history.past.length).toBe(1)
      expect(useGameStore.getState().history.future.length).toBe(2)
      
      useGameStore.getState().redo()
      
      expect(useGameStore.getState().history.past.length).toBe(2)
      expect(useGameStore.getState().history.future.length).toBe(1)
    })

    it('should not undo when history is empty', () => {
      const initialState = useGameStore.getState().history.present
      
      useGameStore.getState().undo() // Should do nothing
      
      expect(useGameStore.getState().history.present).toBe(initialState)
    })

    it('should not redo when future is empty', () => {
      useGameStore.getState().drawCard()
      const stateAfterDraw = useGameStore.getState().history.present
      
      useGameStore.getState().redo() // Should do nothing (no undo happened)
      
      expect(useGameStore.getState().history.present).toBe(stateAfterDraw)
    })
  })

  describe('dispatch', () => {
    it('should handle NEW_GAME action', () => {
      useGameStore.getState().dispatch({ type: 'NEW_GAME', seed: 100 })
      
      const state = useGameStore.getState()
      expect(state.history.past.length).toBe(0)
    })

    it('should handle DRAW_CARD action', () => {
      useGameStore.getState().dispatch({ type: 'DRAW_CARD', count: 3 })
      
      const state = useGameStore.getState()
      expect(state.history.present.stockAndWaste.waste.length).toBe(3)
    })

    it('should handle UNDO action', () => {
      useGameStore.getState().drawCard()
      useGameStore.getState().dispatch({ type: 'UNDO' })
      
      const state = useGameStore.getState()
      expect(state.history.present.stockAndWaste.waste.length).toBe(0)
    })
  })

  describe('moveCard', () => {
    it('should reject invalid moves silently', () => {
      const initialState = useGameStore.getState().history.present
      
      // Try an invalid move (non-King to empty column)
      const invalidMove: Move = {
        from: { type: 'tableau', columnIndex: 1, cardIndex: 1 },
        to: { type: 'tableau', columnIndex: 3, cardIndex: 0 },
        cardCount: 1,
      }
      
      useGameStore.getState().moveCard(invalidMove)
      
      // State should remain unchanged
      expect(useGameStore.getState().history.past.length).toBe(0)
      expect(useGameStore.getState().history.present).toBe(initialState)
    })
  })

  describe('selector hooks', () => {
    it('canUndo should return false initially', () => {
      expect(useGameStore.getState().canUndo()).toBe(false)
    })

    it('canUndo should return true after action', () => {
      useGameStore.getState().drawCard()
      expect(useGameStore.getState().canUndo()).toBe(true)
    })

    it('canRedo should return false initially', () => {
      expect(useGameStore.getState().canRedo()).toBe(false)
    })

    it('canRedo should return true after undo', () => {
      useGameStore.getState().drawCard()
      useGameStore.getState().undo()
      expect(useGameStore.getState().canRedo()).toBe(true)
    })

    it('gameState should return current state', () => {
      const gameState = useGameStore.getState().gameState()
      const present = useGameStore.getState().history.present
      expect(gameState).toBe(present)
    })
  })
})
