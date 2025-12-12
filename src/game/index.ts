/**
 * Solitaire Game Engine
 * 
 * A pure functional implementation of Klondike Solitaire.
 * All game logic is side-effect free and deterministically testable.
 */

// Types
export type {
    Card, CardLocation, Color, Deck, Foundations, GameState, GameStats, LocationType, Move, Pile, Rank, Result, StockAndWaste, Suit, Tableau
} from './types'

export { RANKS, SUITS, failure, success } from './types'

// Card Utilities
export {
    canStackOnFoundation, canStackOnTableau, createCard, createDeck,
    createSeededRandom, flipCardDown, flipCardUp, getCardColor, getCardDisplayString, getRankDisplayName, getSuitColor, getSuitSymbol, hasAlternatingColors, isAce, isKing, shuffleDeck
} from './card-utils'

// Game State
export {
    applyMove, canAutoComplete, checkWinCondition, dealGame, drawFromStock, getCardAtLocation,
    getFoundationPile, getTopCard, validateMove
} from './game-state'

