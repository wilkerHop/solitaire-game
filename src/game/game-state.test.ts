import { describe, expect, it } from 'vitest'
import {
  applyMove,
  canAutoComplete,
  checkWinCondition,
  createCard,
  dealGame,
  drawFromStock,
  getTopCard,
  validateMove,
  type GameState,
  type Move,
} from '../game'

describe('Game State', () => {
  describe('dealGame', () => {
    it('should create a valid initial game state', () => {
      const state = dealGame(42)
      
      expect(state.tableau).toBeDefined()
      expect(state.foundations).toBeDefined()
      expect(state.stockAndWaste).toBeDefined()
      expect(state.stats).toBeDefined()
      expect(state.isWon).toBe(false)
    })

    it('should deal correct number of cards to each tableau column', () => {
      const state = dealGame(42)
      
      // Column 0: 1 card, Column 1: 2 cards, ..., Column 6: 7 cards
      expect(state.tableau.columns[0].length).toBe(1)
      expect(state.tableau.columns[1].length).toBe(2)
      expect(state.tableau.columns[2].length).toBe(3)
      expect(state.tableau.columns[3].length).toBe(4)
      expect(state.tableau.columns[4].length).toBe(5)
      expect(state.tableau.columns[5].length).toBe(6)
      expect(state.tableau.columns[6].length).toBe(7)
    })

    it('should have top card of each tableau column face up', () => {
      const state = dealGame(42)
      
      for (const column of state.tableau.columns) {
        const topCard = column[column.length - 1]
        expect(topCard.faceUp).toBe(true)
      }
    })

    it('should have non-top cards face down', () => {
      const state = dealGame(42)
      
      for (const column of state.tableau.columns) {
        for (let i = 0; i < column.length - 1; i++) {
          expect(column[i].faceUp).toBe(false)
        }
      }
    })

    it('should have 24 cards in stock (52 - 28 dealt)', () => {
      const state = dealGame(42)
      expect(state.stockAndWaste.stock.length).toBe(24)
    })

    it('should have empty waste pile', () => {
      const state = dealGame(42)
      expect(state.stockAndWaste.waste.length).toBe(0)
    })

    it('should have empty foundation piles', () => {
      const state = dealGame(42)
      expect(state.foundations.hearts.length).toBe(0)
      expect(state.foundations.diamonds.length).toBe(0)
      expect(state.foundations.clubs.length).toBe(0)
      expect(state.foundations.spades.length).toBe(0)
    })

    it('should produce deterministic results with same seed', () => {
      const state1 = dealGame(12345)
      const state2 = dealGame(12345)
      
      // Compare first column
      expect(state1.tableau.columns[0][0].suit).toBe(state2.tableau.columns[0][0].suit)
      expect(state1.tableau.columns[0][0].rank).toBe(state2.tableau.columns[0][0].rank)
      
      // Compare stock
      expect(state1.stockAndWaste.stock[0].suit).toBe(state2.stockAndWaste.stock[0].suit)
      expect(state1.stockAndWaste.stock[0].rank).toBe(state2.stockAndWaste.stock[0].rank)
    })

    it('should initialize stats correctly', () => {
      const state = dealGame(42)
      expect(state.stats.moves).toBe(0)
      expect(state.stats.score).toBe(0)
      expect(state.stats.startTime).toBeGreaterThan(0)
    })
  })

  describe('getTopCard', () => {
    it('should return the last card in a pile', () => {
      const pile = [
        createCard('hearts', 5),
        createCard('spades', 10),
        createCard('diamonds', 13),
      ]
      const top = getTopCard(pile)
      expect(top?.suit).toBe('diamonds')
      expect(top?.rank).toBe(13)
    })

    it('should return undefined for empty pile', () => {
      const pile: readonly ReturnType<typeof createCard>[] = []
      expect(getTopCard(pile)).toBeUndefined()
    })
  })

  describe('drawFromStock', () => {
    it('should move one card from stock to waste', () => {
      const state = dealGame(42)
      const newState = drawFromStock(state, 1)
      
      expect(newState.stockAndWaste.stock.length).toBe(23)
      expect(newState.stockAndWaste.waste.length).toBe(1)
    })

    it('should flip drawn card face up', () => {
      const state = dealGame(42)
      const newState = drawFromStock(state, 1)
      
      const drawnCard = newState.stockAndWaste.waste[0]
      expect(drawnCard.faceUp).toBe(true)
    })

    it('should draw multiple cards when specified', () => {
      const state = dealGame(42)
      const newState = drawFromStock(state, 3)
      
      expect(newState.stockAndWaste.stock.length).toBe(21)
      expect(newState.stockAndWaste.waste.length).toBe(3)
    })

    it('should recycle waste to stock when stock is empty', () => {
      // Helper to draw N cards using recursion
      const drawNCards = (s: ReturnType<typeof dealGame>, n: number): ReturnType<typeof dealGame> =>
        n <= 0 ? s : drawNCards(drawFromStock(s, 1), n - 1)
      
      const state = drawNCards(dealGame(42), 24)
      
      expect(state.stockAndWaste.stock.length).toBe(0)
      expect(state.stockAndWaste.waste.length).toBe(24)
      
      // Now draw again - should recycle
      const recycledState = drawFromStock(state, 1)
      expect(recycledState.stockAndWaste.stock.length).toBe(24)
      expect(recycledState.stockAndWaste.waste.length).toBe(0)
    })

    it('should not mutate original state', () => {
      const state = dealGame(42)
      const originalStockLength = state.stockAndWaste.stock.length
      
      drawFromStock(state, 1)
      
      expect(state.stockAndWaste.stock.length).toBe(originalStockLength)
    })
  })

  describe('validateMove', () => {
    it('should allow moving King to empty tableau column', () => {
      // Create a state with an empty column and a King available
      const state = createStateWithEmptyColumnAndKing()
      
      const move: Move = {
        from: { type: 'waste' },
        to: { type: 'tableau', columnIndex: 0, cardIndex: 0 },
        cardCount: 1,
      }
      
      const result = validateMove(state, move)
      expect(result.success).toBe(true)
    })

    it('should reject moving non-King to empty tableau column', () => {
      const state = createStateWithEmptyColumnAndQueen()
      
      const move: Move = {
        from: { type: 'waste' },
        to: { type: 'tableau', columnIndex: 0, cardIndex: 0 },
        cardCount: 1,
      }
      
      const result = validateMove(state, move)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('King')
      }
    })

    it('should allow moving Ace to empty foundation', () => {
      const state = createStateWithAceInWaste()
      
      const move: Move = {
        from: { type: 'waste' },
        to: { type: 'foundation', suit: 'hearts' },
        cardCount: 1,
      }
      
      const result = validateMove(state, move)
      expect(result.success).toBe(true)
    })

    it('should reject moving non-Ace to empty foundation', () => {
      const state = createStateWithTwoInWaste()
      
      const move: Move = {
        from: { type: 'waste' },
        to: { type: 'foundation', suit: 'hearts' },
        cardCount: 1,
      }
      
      const result = validateMove(state, move)
      expect(result.success).toBe(false)
    })

    it('should reject moving multiple cards to foundation', () => {
      const state = createStateWithAceInWaste()
      
      const move: Move = {
        from: { type: 'tableau', columnIndex: 0, cardIndex: 0 },
        to: { type: 'foundation', suit: 'hearts' },
        cardCount: 2,
      }
      
      const result = validateMove(state, move)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('single')
      }
    })
  })

  describe('applyMove', () => {
    it('should increment move counter', () => {
      const state = createStateWithValidTableauMove()
      
      const move: Move = {
        from: { type: 'tableau', columnIndex: 1, cardIndex: 1 },
        to: { type: 'tableau', columnIndex: 2, cardIndex: 2 },
        cardCount: 1,
      }
      
      const result = applyMove(state, move)
      if (result.success) {
        expect(result.value.stats.moves).toBe(1)
      }
    })

    it('should flip new top card face up after moving from tableau', () => {
      const state = createStateWithMultipleCardsInColumn()
      
      const move: Move = {
        from: { type: 'tableau', columnIndex: 0, cardIndex: 1 },
        to: { type: 'tableau', columnIndex: 1, cardIndex: 0 },
        cardCount: 1,
      }
      
      const result = applyMove(state, move)
      if (result.success) {
        const newTopCard = result.value.tableau.columns[0][0]
        expect(newTopCard.faceUp).toBe(true)
      }
    })
  })

  describe('checkWinCondition', () => {
    it('should return false for new game', () => {
      const state = dealGame(42)
      expect(checkWinCondition(state)).toBe(false)
    })

    it('should return true when all foundations are complete', () => {
      const state = createWinningState()
      expect(checkWinCondition(state)).toBe(true)
    })
  })

  describe('canAutoComplete', () => {
    it('should return false when stock has cards', () => {
      const state = dealGame(42)
      expect(canAutoComplete(state)).toBe(false)
    })

    it('should return false when tableau has face-down cards', () => {
      // Helper to draw N cards using recursion
      const drawNCards = (s: ReturnType<typeof dealGame>, n: number): ReturnType<typeof dealGame> =>
        n <= 0 ? s : drawNCards(drawFromStock(s, 1), n - 1)
      
      const state = drawNCards(dealGame(42), 24)
      // Tableau still has face-down cards
      expect(canAutoComplete(state)).toBe(false)
    })
  })
})

// =============================================================================
// Helper functions to create specific game states for testing
// =============================================================================

function createStateWithEmptyColumnAndKing(): GameState {
  return {
    tableau: {
      columns: [
        [], // Empty column
        [createCard('hearts', 5, true)],
        [createCard('diamonds', 10, true)],
        [createCard('clubs', 3, true)],
        [createCard('spades', 7, true)],
        [createCard('hearts', 2, true)],
        [createCard('diamonds', 9, true)],
      ],
    },
    foundations: {
      hearts: [],
      diamonds: [],
      clubs: [],
      spades: [],
    },
    stockAndWaste: {
      stock: [],
      waste: [createCard('spades', 13, true)], // King in waste
    },
    stats: { moves: 0, score: 0, startTime: Date.now(), elapsedSeconds: 0 },
    isWon: false,
  }
}

function createStateWithEmptyColumnAndQueen(): GameState {
  return {
    tableau: {
      columns: [
        [], // Empty column
        [createCard('hearts', 5, true)],
        [createCard('diamonds', 10, true)],
        [createCard('clubs', 3, true)],
        [createCard('spades', 7, true)],
        [createCard('hearts', 2, true)],
        [createCard('diamonds', 9, true)],
      ],
    },
    foundations: {
      hearts: [],
      diamonds: [],
      clubs: [],
      spades: [],
    },
    stockAndWaste: {
      stock: [],
      waste: [createCard('spades', 12, true)], // Queen in waste (not King)
    },
    stats: { moves: 0, score: 0, startTime: Date.now(), elapsedSeconds: 0 },
    isWon: false,
  }
}

function createStateWithAceInWaste(): GameState {
  return {
    tableau: {
      columns: [
        [createCard('clubs', 5, true)],
        [createCard('hearts', 5, true)],
        [createCard('diamonds', 10, true)],
        [createCard('clubs', 3, true)],
        [createCard('spades', 7, true)],
        [createCard('hearts', 2, true)],
        [createCard('diamonds', 9, true)],
      ],
    },
    foundations: {
      hearts: [],
      diamonds: [],
      clubs: [],
      spades: [],
    },
    stockAndWaste: {
      stock: [],
      waste: [createCard('hearts', 1, true)], // Ace of hearts
    },
    stats: { moves: 0, score: 0, startTime: Date.now(), elapsedSeconds: 0 },
    isWon: false,
  }
}

function createStateWithTwoInWaste(): GameState {
  return {
    tableau: {
      columns: [
        [createCard('clubs', 5, true)],
        [createCard('hearts', 5, true)],
        [createCard('diamonds', 10, true)],
        [createCard('clubs', 3, true)],
        [createCard('spades', 7, true)],
        [createCard('hearts', 2, true)],
        [createCard('diamonds', 9, true)],
      ],
    },
    foundations: {
      hearts: [],
      diamonds: [],
      clubs: [],
      spades: [],
    },
    stockAndWaste: {
      stock: [],
      waste: [createCard('hearts', 2, true)], // Two of hearts (not Ace)
    },
    stats: { moves: 0, score: 0, startTime: Date.now(), elapsedSeconds: 0 },
    isWon: false,
  }
}

function createStateWithValidTableauMove(): GameState {
  return {
    tableau: {
      columns: [
        [createCard('clubs', 5, true)],
        [
          createCard('hearts', 8, false),
          createCard('spades', 6, true), // Black 6
        ],
        [
          createCard('diamonds', 3, false),
          createCard('clubs', 9, false),
          createCard('hearts', 7, true), // Red 7 - can receive black 6
        ],
        [createCard('clubs', 3, true)],
        [createCard('spades', 7, true)],
        [createCard('hearts', 2, true)],
        [createCard('diamonds', 9, true)],
      ],
    },
    foundations: {
      hearts: [],
      diamonds: [],
      clubs: [],
      spades: [],
    },
    stockAndWaste: {
      stock: [],
      waste: [],
    },
    stats: { moves: 0, score: 0, startTime: Date.now(), elapsedSeconds: 0 },
    isWon: false,
  }
}

function createStateWithMultipleCardsInColumn(): GameState {
  return {
    tableau: {
      columns: [
        [
          createCard('hearts', 8, false), // Face down
          createCard('spades', 6, true),  // Face up - will be moved
        ],
        [createCard('hearts', 7, true)], // Red 7 - can receive black 6
        [createCard('diamonds', 10, true)],
        [createCard('clubs', 3, true)],
        [createCard('spades', 7, true)],
        [createCard('hearts', 2, true)],
        [createCard('diamonds', 9, true)],
      ],
    },
    foundations: {
      hearts: [],
      diamonds: [],
      clubs: [],
      spades: [],
    },
    stockAndWaste: {
      stock: [],
      waste: [],
    },
    stats: { moves: 0, score: 0, startTime: Date.now(), elapsedSeconds: 0 },
    isWon: false,
  }
}

function createWinningState(): GameState {
  // Create a state where all 13 cards are in each foundation
  type FullPile = ReturnType<typeof createCard>[]
  const createFullFoundation = (suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'): FullPile => {
    const cards: FullPile = []
    for (let rank = 1; rank <= 13; rank++) {
      cards.push(createCard(suit, rank as 1|2|3|4|5|6|7|8|9|10|11|12|13, true))
    }
    return cards
  }

  return {
    tableau: {
      columns: [[], [], [], [], [], [], []],
    },
    foundations: {
      hearts: createFullFoundation('hearts'),
      diamonds: createFullFoundation('diamonds'),
      clubs: createFullFoundation('clubs'),
      spades: createFullFoundation('spades'),
    },
    stockAndWaste: {
      stock: [],
      waste: [],
    },
    stats: { moves: 100, score: 500, startTime: Date.now(), elapsedSeconds: 300 },
    isWon: true,
  }
}
