import { describe, expect, it } from 'vitest'
import {
  calculateFinalScore,
  calculateMoveScore,
  calculateProgress,
  calculateTimeBonus,
  createCard,
  dealGame,
  formatScore,
  getInitialScore,
  isUndoAllowed,
  type GameState,
  type Move,
} from '../game'

function createWinningStateForProgress(): GameState {
  type CardArray = ReturnType<typeof createCard>[]
  const createPile = (suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'): CardArray =>
    Array.from({ length: 13 }, (_, i) => 
      createCard(suit, (i + 1) as 1|2|3|4|5|6|7|8|9|10|11|12|13, true)
    )
  
  return {
    tableau: { columns: [[], [], [], [], [], [], []] },
    foundations: {
      hearts: createPile('hearts'),
      diamonds: createPile('diamonds'),
      clubs: createPile('clubs'),
      spades: createPile('spades'),
    },
    stockAndWaste: { stock: [], waste: [] },
    stats: { moves: 0, score: 0, startTime: 0, elapsedSeconds: 0 },
    isWon: true,
  }
}

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

    it('should penalize -15 for foundation to tableau move', () => {
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
    })
  })

  describe('Vegas mode', () => {
    it('should give $5 for foundation move', () => {
      const move: Move = {
        from: { type: 'tableau', columnIndex: 0, cardIndex: 0 },
        to: { type: 'foundation', suit: 'hearts' },
        cardCount: 1,
      }
      expect(calculateMoveScore(move, false, 'vegas').points).toBe(5)
    })

    it('should give 0 for tableau moves', () => {
      const move: Move = {
        from: { type: 'waste' },
        to: { type: 'tableau', columnIndex: 0, cardIndex: 0 },
        cardCount: 1,
      }
      expect(calculateMoveScore(move, false, 'vegas').points).toBe(0)
    })
  })

  describe('calculateTimeBonus', () => {
    it('should give max bonus for fast wins', () => {
      expect(calculateTimeBonus(20, 'standard')).toBeGreaterThan(20000)
    })
    it('should give no bonus for slow games', () => {
      expect(calculateTimeBonus(700, 'standard')).toBe(0)
    })
    it('should give proportional bonus', () => {
      expect(calculateTimeBonus(100, 'standard')).toBe(7000)
    })
    it('should give no bonus in Vegas mode', () => {
      expect(calculateTimeBonus(30, 'vegas')).toBe(0)
    })
  })

  describe('calculateFinalScore', () => {
    it('should add time bonus to current score', () => {
      expect(calculateFinalScore(100, 100, 'standard')).toBe(7100)
    })
  })

  describe('getInitialScore', () => {
    it('returns 0 for standard', () => { expect(getInitialScore('standard')).toBe(0) })
    it('returns -52 for vegas', () => { expect(getInitialScore('vegas')).toBe(-52) })
  })

  describe('isUndoAllowed', () => {
    it('allows undo in standard', () => { expect(isUndoAllowed('standard')).toBe(true) })
    it('disallows undo in vegas', () => { expect(isUndoAllowed('vegas')).toBe(false) })
  })

  describe('formatScore', () => {
    it('formats standard score', () => { expect(formatScore(150, 'standard')).toBe('150') })
    it('formats positive vegas', () => { expect(formatScore(25, 'vegas')).toBe('$25') })
    it('formats negative vegas', () => { expect(formatScore(-15, 'vegas')).toBe('-$15') })
  })

  describe('calculateProgress', () => {
    it('returns 0% for new game', () => {
      expect(calculateProgress(dealGame(42))).toBe(0)
    })
    it('returns 100% when all cards in foundation', () => {
      expect(calculateProgress(createWinningStateForProgress())).toBe(100)
    })
  })
})

