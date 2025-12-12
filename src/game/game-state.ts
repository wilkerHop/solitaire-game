/**
 * Pure functions for managing game state.
 * All functions are pure - they take state and return new state without mutation.
 */

import {
  canStackOnFoundation,
  canStackOnTableau,
  createDeck,
  flipCardUp,
  isKing,
  shuffleDeck,
} from './card-utils'
import type {
  Card,
  CardLocation,
  Foundations,
  GameState,
  GameStats,
  Move,
  Pile,
  Result,
  StockAndWaste,
  Suit,
  Tableau
} from './types'
import { failure, success } from './types'

// =============================================================================
// Initial State Creation
// =============================================================================

/**
 * Create empty foundations.
 */
function createEmptyFoundations(): Foundations {
  return Object.freeze({
    hearts: Object.freeze([]),
    diamonds: Object.freeze([]),
    clubs: Object.freeze([]),
    spades: Object.freeze([]),
  })
}


/**
 * Create initial game statistics.
 */
function createInitialStats(): GameStats {
  return Object.freeze({
    moves: 0,
    score: 0,
    startTime: Date.now(),
    elapsedSeconds: 0,
  })
}

/**
 * Deal a new game of Solitaire.
 * 
 * @param seed - Optional seed for deterministic dealing (for testing/replay)
 * @returns A new, fully dealt game state
 */
export function dealGame(seed?: number): GameState {
  // Create and shuffle deck
  const deck = createDeck()
  const shuffled = shuffleDeck(deck, seed)
  
  // Deal to tableau
  // Column 0: 1 card, Column 1: 2 cards, ..., Column 6: 7 cards
  // Top card of each column is face up
  const tableauColumns: Card[][] = Array.from({ length: 7 }, () => [])
  let deckIndex = 0
  
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = shuffled[deckIndex]
      // Last card in column is face up
      const isFaceUp = row === col
      tableauColumns[col].push(
        isFaceUp ? flipCardUp(card) : card
      )
      deckIndex++
    }
  }
  
  // Remaining cards go to stock (face down)
  const stockCards = shuffled.slice(deckIndex)
  
  const tableau: Tableau = Object.freeze({
    columns: Object.freeze(tableauColumns.map(col => Object.freeze(col))),
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

// =============================================================================
// State Accessors (Pure)
// =============================================================================

/**
 * Get the top card of a pile, or undefined if empty.
 */
export function getTopCard(pile: Pile): Card | undefined {
  return pile.length > 0 ? pile[pile.length - 1] : undefined
}

/**
 * Get a card from a specific location.
 */
export function getCardAtLocation(
  state: GameState,
  location: CardLocation
): Card | undefined {
  switch (location.type) {
    case 'tableau': {
      const column = state.tableau.columns[location.columnIndex]
      return column[location.cardIndex]
    }
    case 'foundation': {
      const pile = state.foundations[location.suit]
      return getTopCard(pile)
    }
    case 'waste': {
      return getTopCard(state.stockAndWaste.waste)
    }
    case 'stock': {
      return getTopCard(state.stockAndWaste.stock)
    }
  }
}

/**
 * Get the foundation pile for a suit.
 */
export function getFoundationPile(foundations: Foundations, suit: Suit): Pile {
  return foundations[suit]
}

// =============================================================================
// Move Validation (Pure)
// =============================================================================

/**
 * Validate if a move is legal according to Solitaire rules.
 * 
 * @param state - Current game state
 * @param move - The proposed move
 * @returns Result with either true or an error message
 */
export function validateMove(state: GameState, move: Move): Result<boolean> {
  // Get the cards being moved
  const sourceCards = getCardsForMove(state, move)
  if (sourceCards.length === 0) {
    return failure('No cards at source location')
  }
  
  const cardToMove = sourceCards[0]
  
  // Validate based on destination type
  switch (move.to.type) {
    case 'tableau': {
      const targetColumn = state.tableau.columns[move.to.columnIndex]
      const targetCard = getTopCard(targetColumn)
      
      // Empty column: only Kings allowed
      if (targetCard === undefined) {
        if (!isKing(cardToMove)) {
          return failure('Only Kings can be placed on empty tableau columns')
        }
        return success(true)
      }
      
      // Non-empty column: check stacking rules
      if (!canStackOnTableau(cardToMove, targetCard)) {
        return failure('Card must be opposite color and one rank lower')
      }
      return success(true)
    }
    
    case 'foundation': {
      // Can only move single cards to foundation
      if (move.cardCount > 1) {
        return failure('Can only move single cards to foundation')
      }
      
      const foundationPile = state.foundations[move.to.suit]
      const topCard = getTopCard(foundationPile)
      
      if (!canStackOnFoundation(cardToMove, topCard, move.to.suit)) {
        return failure('Card must be same suit and next rank up')
      }
      return success(true)
    }
    
    case 'stock':
      return failure('Cannot move cards to stock')
    
    case 'waste':
      return failure('Cannot move cards directly to waste')
  }
}

/**
 * Get the cards that would be moved for a given move.
 */
function getCardsForMove(state: GameState, move: Move): readonly Card[] {
  switch (move.from.type) {
    case 'tableau': {
      const column = state.tableau.columns[move.from.columnIndex]
      if (move.from.cardIndex >= column.length) {
        return []
      }
      // Return cards from cardIndex to end of column
      return column.slice(move.from.cardIndex)
    }
    
    case 'waste': {
      const topCard = getTopCard(state.stockAndWaste.waste)
      return topCard ? [topCard] : []
    }
    
    case 'foundation': {
      const pile = state.foundations[move.from.suit]
      const topCard = getTopCard(pile)
      return topCard ? [topCard] : []
    }
    
    case 'stock':
      return [] // Cannot move directly from stock
  }
}

// =============================================================================
// State Mutations (Pure - Return New State)
// =============================================================================

/**
 * Apply a move to the game state.
 * Returns a new state with the move applied, or an error.
 */
export function applyMove(state: GameState, move: Move): Result<GameState> {
  // Validate the move first
  const validation = validateMove(state, move)
  if (!validation.success) {
    return failure(validation.error)
  }
  
  // Get cards being moved
  const cardsToMove = getCardsForMove(state, move)
  if (cardsToMove.length === 0) {
    return failure('No cards to move')
  }
  
  // Remove cards from source
  const stateAfterRemoval = removeCardsFromSource(state, move)
  
  // Add cards to destination
  const stateAfterAdd = addCardsToDestination(stateAfterRemoval, move.to, cardsToMove)
  
  // Update stats
  const newStats: GameStats = Object.freeze({
    ...stateAfterAdd.stats,
    moves: stateAfterAdd.stats.moves + 1,
  })
  
  // Check for win
  const isWon = checkWinCondition(stateAfterAdd)
  
  return success(Object.freeze({
    ...stateAfterAdd,
    stats: newStats,
    isWon,
  }))
}

/**
 * Remove cards from the source location.
 */
function removeCardsFromSource(state: GameState, move: Move): GameState {
  switch (move.from.type) {
    case 'tableau': {
      const columns = [...state.tableau.columns]
      const column = [...columns[move.from.columnIndex]]
      
      // Remove cards from cardIndex onwards
      column.splice(move.from.cardIndex)
      
      // Flip the new top card if it's face down
      if (column.length > 0 && !column[column.length - 1].faceUp) {
        column[column.length - 1] = flipCardUp(column[column.length - 1])
      }
      
      columns[move.from.columnIndex] = Object.freeze(column)
      
      return Object.freeze({
        ...state,
        tableau: Object.freeze({ columns: Object.freeze(columns) }),
      })
    }
    
    case 'waste': {
      const waste = state.stockAndWaste.waste.slice(0, -1)
      return Object.freeze({
        ...state,
        stockAndWaste: Object.freeze({
          ...state.stockAndWaste,
          waste: Object.freeze(waste),
        }),
      })
    }
    
    case 'foundation': {
      const foundations = { ...state.foundations }
      const pile = foundations[move.from.suit].slice(0, -1)
      foundations[move.from.suit] = Object.freeze(pile)
      
      return Object.freeze({
        ...state,
        foundations: Object.freeze(foundations),
      })
    }
    
    case 'stock':
      return state // Should not happen
  }
}

/**
 * Add cards to the destination location.
 */
function addCardsToDestination(
  state: GameState,
  destination: CardLocation,
  cards: readonly Card[]
): GameState {
  switch (destination.type) {
    case 'tableau': {
      const columns = [...state.tableau.columns]
      const column = [...columns[destination.columnIndex], ...cards]
      columns[destination.columnIndex] = Object.freeze(column)
      
      return Object.freeze({
        ...state,
        tableau: Object.freeze({ columns: Object.freeze(columns) }),
      })
    }
    
    case 'foundation': {
      const foundations = { ...state.foundations }
      const pile = [...foundations[destination.suit], ...cards]
      foundations[destination.suit] = Object.freeze(pile)
      
      return Object.freeze({
        ...state,
        foundations: Object.freeze(foundations),
      })
    }
    
    case 'stock':
    case 'waste':
      return state // Should not happen
  }
}

/**
 * Draw cards from stock to waste.
 * In standard Solitaire, draws 1 or 3 cards.
 */
export function drawFromStock(state: GameState, count = 1): GameState {
  const { stock, waste } = state.stockAndWaste
  
  // If stock is empty, recycle waste back to stock
  if (stock.length === 0) {
    if (waste.length === 0) {
      return state // Nothing to do
    }
    
    // Flip waste pile over to become new stock (face down, reversed order)
    const newStock = waste.map(card => 
      card.faceUp ? { ...card, faceUp: false } : card
    ).reverse()
    
    return Object.freeze({
      ...state,
      stockAndWaste: Object.freeze({
        stock: Object.freeze(newStock),
        waste: Object.freeze([]),
      }),
    })
  }
  
  // Draw cards from stock to waste
  const drawCount = Math.min(count, stock.length)
  const drawnCards = stock.slice(-drawCount).map(flipCardUp).reverse()
  const newStock = stock.slice(0, -drawCount)
  const newWaste = [...waste, ...drawnCards]
  
  return Object.freeze({
    ...state,
    stockAndWaste: Object.freeze({
      stock: Object.freeze(newStock),
      waste: Object.freeze(newWaste),
    }),
  })
}

// =============================================================================
// Win Condition
// =============================================================================

/**
 * Check if the game has been won.
 * Win condition: All four foundation piles have 13 cards (Ace through King).
 */
export function checkWinCondition(state: GameState): boolean {
  const { foundations } = state
  return (
    foundations.hearts.length === 13 &&
    foundations.diamonds.length === 13 &&
    foundations.clubs.length === 13 &&
    foundations.spades.length === 13
  )
}

/**
 * Check if auto-complete is possible.
 * Auto-complete is possible when all cards are face up and
 * there are no more cards in stock/waste.
 */
export function canAutoComplete(state: GameState): boolean {
  // Check stock and waste are empty
  if (state.stockAndWaste.stock.length > 0 || state.stockAndWaste.waste.length > 0) {
    return false
  }
  
  // Check all tableau cards are face up
  for (const column of state.tableau.columns) {
    for (const card of column) {
      if (!card.faceUp) {
        return false
      }
    }
  }
  
  return true
}
