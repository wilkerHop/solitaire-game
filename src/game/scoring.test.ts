import { describe, expect, it } from 'vitest'
import {
    calculateFinalScore,
    calculateMoveScore,
    calculateProgress,
    calculateTimeBonus,
    dealGame,
    formatScore,
    getInitialScore,
    isUndoAllowed,
    type Move,
} from '../game'

describe('Scoring System', () => {
  describe('calculateMoveScore', () => {
    it('should give 5 points for waste to tableau move', () => {
      const move: Move = {
        from: { type: 'waste' },
        to: { type: 'tableau', columnIndex: 0, cardIndex: 0 },
        cardCount: 1,
      }
      const result = calculateMoveScore(move, false, 'standard')
      expect(result.points).toBe(5)
      expect(result.reason).toContain('Waste to Tableau')
    })

    it('should give 10 points for waste to foundation move', () => {
      const move: Move = {
        from: { type: 'waste' },
        to: { type: 'foundation', suit: 'hearts' },
        cardCount: 1,
      }
      const result = calculateMoveScore(move, false, 'standard')
      expect(result.points).toBe(10)
      expect(result.reason).toContain('Waste to Foundation')
    })

    it('should give 10 points for tableau to foundation move', () => {
      const move: Move = {
        from: { type: 'tableau', columnIndex: 0, cardIndex: 0 },
        to: { type: 'foundation', suit: 'spades' },
        cardCount: 1,
      }
      const result = calculateMoveScore(move, false, 'standard')
      expect(result.points).toBe(10)
      expect(result.reason).toContain('Tableau to Foundation')
    })

    it('should penalize -15 points for foundation to tableau move', () => {
      const move: Move = {
        from: { type: 'foundation', suit: 'hearts' },
        to: { type: 'tableau', columnIndex: 0, cardIndex: 0 },
        cardCount: 1,
      }
      const result = calculateMoveScore(move, false, 'standard')
      expect(result.points).toBe(-15)
      expect(result.reason).toContain('penalty')
    })

    it('should add 5 points for flipping a card', () => {
      const move: Move = {
        from: { type: 'tableau', columnIndex: 0, cardIndex: 1 },
        to: { type: 'tableau', columnIndex: 1, cardIndex: 0 },
        cardCount: 1,
      }
      const result = calculateMoveScore(move, true, 'standard')
      expect(result.points).toBe(5)
      expect(result.reason).toContain('Card flip')
    })

    describe('Vegas mode', () => {
      it('should give $5 for foundation move in Vegas', () => {
        const move: Move = {
          from: { type: 'tableau', columnIndex: 0, cardIndex: 0 },
          to: { type: 'foundation', suit: 'hearts' },
          cardCount: 1,
        }
        const result = calculateMoveScore(move, false, 'vegas')
        expect(result.points).toBe(5)
      })

      it('should give 0 points for tableau moves in Vegas', () => {
        const move: Move = {
          from: { type: 'waste' },
          to: { type: 'tableau', columnIndex: 0, cardIndex: 0 },
          cardCount: 1,
        }
        const result = calculateMoveScore(move, false, 'vegas')
        expect(result.points).toBe(0)
      })
    })
  })

  describe('calculateTimeBonus', () => {
    it('should give max bonus for fast wins (<30s)', () => {
      const bonus = calculateTimeBonus(20, 'standard')
      expect(bonus).toBeGreaterThan(20000)
    })

    it('should give no bonus for slow games (>10min)', () => {
      const bonus = calculateTimeBonus(700, 'standard')
      expect(bonus).toBe(0)
    })

    it('should give proportional bonus for normal times', () => {
      const bonus = calculateTimeBonus(100, 'standard')
      expect(bonus).toBe(7000)
    })

    it('should give no time bonus in Vegas mode', () => {
      const bonus = calculateTimeBonus(30, 'vegas')
      expect(bonus).toBe(0)
    })
  })

  describe('calculateFinalScore', () => {
    it('should add time bonus to current score', () => {
      const finalScore = calculateFinalScore(100, 100, 'standard')
      expect(finalScore).toBe(100 + 7000)
    })
  })

  describe('getInitialScore', () => {
    it('should return 0 for standard mode', () => {
      expect(getInitialScore('standard')).toBe(0)
    })

    it('should return -52 for Vegas mode', () => {
      expect(getInitialScore('vegas')).toBe(-52)
    })
  })

  describe('isUndoAllowed', () => {
    it('should allow undo in standard mode', () => {
      expect(isUndoAllowed('standard')).toBe(true)
    })

    it('should not allow undo in Vegas mode', () => {
      expect(isUndoAllowed('vegas')).toBe(false)
    })
  })

  describe('formatScore', () => {
    it('should format standard score as number', () => {
      expect(formatScore(150, 'standard')).toBe('150')
    })

    it('should format positive Vegas score with $', () => {
      expect(formatScore(25, 'vegas')).toBe('$25')
    })

    it('should format negative Vegas score with -$', () => {
      expect(formatScore(-15, 'vegas')).toBe('-$15')
    })
  })

  describe('calculateProgress', () => {
    it('should return 0% for new game', () => {
      const state = dealGame(42)
      expect(calculateProgress(state)).toBe(0)
    })

    it('should return 100% when all cards in foundation', () => {
      // Create a winning state
      const winState = {
        tableau: { columns: [[], [], [], [], [], [], []] },
        foundations: {
          hearts: Array.from({ length: 13 }, () => ({ suit: 'hearts', rank: 1, faceUp: true })),
          diamonds: Array.from({ length: 13 }, () => ({ suit: 'diamonds', rank: 1, faceUp: true })),
          clubs: Array.from({ length: 13 }, () => ({ suit: 'clubs', rank: 1, faceUp: true })),
          spades: Array.from({ length: 13 }, () => ({ suit: 'spades', rank: 1, faceUp: true })),
        },
        stockAndWaste: { stock: [], waste: [] },
        stats: { moves: 0, score: 0, startTime: 0, elapsedSeconds: 0 },
        isWon: true,
      }
      // @ts-expect-error - Simplified state for testing
      expect(calculateProgress(winState)).toBe(100)
    })
  })
})
