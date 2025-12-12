/**
 * Solitaire Game Domain Types
 * 
 * All types are readonly to enforce immutability at the type level.
 * This is the foundation of our functional programming approach.
 */

// =============================================================================
// Card Types
// =============================================================================

/**
 * The four suits in a standard deck of cards.
 * Using const assertion for literal types.
 */
export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const
export type Suit = typeof SUITS[number]

/**
 * Card ranks from Ace (1) to King (13).
 * Using const assertion for literal types.
 */
export const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const
export type Rank = typeof RANKS[number]

/**
 * Color of a card, derived from suit.
 */
export type Color = 'red' | 'black'

/**
 * A single playing card with immutable properties.
 * - suit: The card's suit
 * - rank: The card's rank (1=Ace, 11=Jack, 12=Queen, 13=King)
 * - faceUp: Whether the card is visible to the player
 */
export interface Card {
  readonly suit: Suit
  readonly rank: Rank
  readonly faceUp: boolean
}

/**
 * A deck is a readonly array of cards.
 */
export type Deck = readonly Card[]

// =============================================================================
// Game State Types
// =============================================================================

/**
 * A pile of cards (used for tableau columns, foundation piles, etc.)
 */
export type Pile = readonly Card[]

/**
 * The seven tableau columns in Solitaire.
 * Index 0-6 corresponds to columns 1-7.
 */
export interface Tableau {
  readonly columns: readonly Pile[]
}

/**
 * The four foundation piles where cards are built up by suit from Ace to King.
 * Each pile is keyed by suit for type safety.
 */
export interface Foundations {
  readonly hearts: Pile
  readonly diamonds: Pile
  readonly clubs: Pile
  readonly spades: Pile
}

/**
 * The stock pile (draw pile) and waste pile (discard pile).
 */
export interface StockAndWaste {
  readonly stock: Pile
  readonly waste: Pile
}

/**
 * Location identifiers for card movements.
 */
export type LocationType = 'tableau' | 'foundation' | 'stock' | 'waste'

/**
 * A specific location on the board.
 */
export type CardLocation =
  | { readonly type: 'tableau'; readonly columnIndex: number; readonly cardIndex: number }
  | { readonly type: 'foundation'; readonly suit: Suit }
  | { readonly type: 'stock' }
  | { readonly type: 'waste' }

/**
 * A move from one location to another.
 */
export interface Move {
  readonly from: CardLocation
  readonly to: CardLocation
  readonly cardCount: number  // Number of cards being moved (for tableau stacks)
}

/**
 * Game statistics for scoring.
 */
export interface GameStats {
  readonly moves: number
  readonly score: number
  readonly startTime: number  // Unix timestamp
  readonly elapsedSeconds: number
}

/**
 * The complete immutable game state.
 * This is the single source of truth for the UI.
 */
export interface GameState {
  readonly tableau: Tableau
  readonly foundations: Foundations
  readonly stockAndWaste: StockAndWaste
  readonly stats: GameStats
  readonly isWon: boolean
}

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Result type for operations that can fail.
 * Follows functional programming's Either pattern.
 */
export type Result<T, E = string> =
  | { readonly success: true; readonly value: T }
  | { readonly success: false; readonly error: E }

/**
 * Create a success result.
 */
export function success<T>(value: T): Result<T, never> {
  return { success: true, value }
}

/**
 * Create a failure result.
 */
export function failure<E>(error: E): Result<never, E> {
  return { success: false, error }
}
