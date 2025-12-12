/**
 * Deal a new game of Solitaire
 */

import { createDeck, flipCardUp, shuffleDeck } from '../card-utils'
import type { Card, Foundations, GameState, GameStats, StockAndWaste, Tableau } from '../types'

function createEmptyFoundations(): Foundations {
  return Object.freeze({
    hearts: Object.freeze([]),
    diamonds: Object.freeze([]),
    clubs: Object.freeze([]),
    spades: Object.freeze([]),
  })
}

function createInitialStats(): GameStats {
  return Object.freeze({
    moves: 0,
    score: 0,
    startTime: Date.now(),
    elapsedSeconds: 0,
  })
}

export function dealGame(seed?: number): GameState {
  const deck = createDeck()
  const shuffled = shuffleDeck(deck, seed)
  
  const dealResult = Array.from({ length: 7 }).reduce<{
    columns: Card[][]
    deckIdx: number
  }>(
    (acc, _, col) => {
      const cards = Array.from({ length: col + 1 }).map((__, row) => {
        const card = shuffled[acc.deckIdx + row]
        const isFaceUp = row === col
        return isFaceUp ? flipCardUp(card) : card
      })
      return { columns: [...acc.columns, cards], deckIdx: acc.deckIdx + col + 1 }
    },
    { columns: [], deckIdx: 0 }
  )
  
  const stockCards = shuffled.slice(dealResult.deckIdx)
  
  const tableau: Tableau = Object.freeze({
    columns: Object.freeze(dealResult.columns.map(col => Object.freeze(col))),
  })
  
  const stockAndWaste: StockAndWaste = Object.freeze({
    stock: Object.freeze(stockCards),
    waste: Object.freeze([]),
  })
  
  return Object.freeze({
    tableau,
    foundations: createEmptyFoundations(),
    stockAndWaste,
    stats: createInitialStats(),
    isWon: false,
  })
}
