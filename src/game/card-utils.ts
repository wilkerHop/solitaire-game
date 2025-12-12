/**
 * Pure utility functions for card operations.
 * All functions are pure - no side effects, deterministic outputs.
 */

import type { Card, Color, Deck, Rank, Suit } from './types'
import { RANKS, SUITS } from './types'

// =============================================================================
// Card Utilities
// =============================================================================

/**
 * Get the color of a suit.
 * Hearts and Diamonds are red; Clubs and Spades are black.
 */
export function getSuitColor(suit: Suit): Color {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black'
}

/**
 * Get the color of a card.
 */
export function getCardColor(card: Card): Color {
  return getSuitColor(card.suit)
}

/**
 * Check if two cards have alternating colors.
 * Used for tableau building rules.
 */
export function hasAlternatingColors(card1: Card, card2: Card): boolean {
  return getCardColor(card1) !== getCardColor(card2)
}

/**
 * Check if card1 can be placed on card2 in a tableau column.
 * Rules: Must be alternating colors and card1.rank = card2.rank - 1
 */
export function canStackOnTableau(cardToPlace: Card, targetCard: Card): boolean {
  return (
    hasAlternatingColors(cardToPlace, targetCard) &&
    cardToPlace.rank === targetCard.rank - 1
  )
}

/**
 * Check if a card can be placed on a foundation pile.
 * Rules: Same suit and card.rank = topCard.rank + 1 (or Ace on empty)
 */
export function canStackOnFoundation(
  cardToPlace: Card,
  foundationTopCard: Card | undefined,
  foundationSuit: Suit
): boolean {
  // Card must match foundation suit
  if (cardToPlace.suit !== foundationSuit) {
    return false
  }

  // If foundation is empty, only Ace can be placed
  if (foundationTopCard === undefined) {
    return cardToPlace.rank === 1
  }

  // Otherwise, must be next rank up
  return cardToPlace.rank === foundationTopCard.rank + 1
}

/**
 * Check if a card is a King (can be placed on empty tableau column).
 */
export function isKing(card: Card): boolean {
  return card.rank === 13
}

/**
 * Check if a card is an Ace (can start a foundation pile).
 */
export function isAce(card: Card): boolean {
  return card.rank === 1
}

// =============================================================================
// Card Creation (Pure)
// =============================================================================

/**
 * Create a new card with specified properties.
 * Pure factory function.
 */
export function createCard(suit: Suit, rank: Rank, faceUp = false): Card {
  return Object.freeze({ suit, rank, faceUp })
}

/**
 * Create a card with face up.
 * Returns a new card object (immutable).
 */
export function flipCardUp(card: Card): Card {
  if (card.faceUp) {
    return card // Already face up, return same reference
  }
  return createCard(card.suit, card.rank, true)
}

/**
 * Create a card with face down.
 * Returns a new card object (immutable).
 */
export function flipCardDown(card: Card): Card {
  if (!card.faceUp) {
    return card // Already face down, return same reference
  }
  return createCard(card.suit, card.rank, false)
}

// =============================================================================
// Deck Creation
// =============================================================================

/**
 * Create a standard 52-card deck with all cards face down.
 * Pure function - always returns the same deck.
 */
export function createDeck(): Deck {
  const cards: Card[] = []
  
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push(createCard(suit, rank, false))
    }
  }
  
  return Object.freeze(cards)
}

// =============================================================================
// Seeded Random Number Generator (for deterministic shuffling)
// =============================================================================

/**
 * A simple seeded random number generator using Linear Congruential Generator.
 * This allows deterministic shuffling for testing and replay.
 * 
 * Returns a function that generates the next random number [0, 1).
 */
export function createSeededRandom(seed: number): () => number {
  let state = seed
  
  return (): number => {
    // LCG parameters (same as glibc)
    state = (state * 1103515245 + 12345) & 0x7fffffff
    return state / 0x7fffffff
  }
}

/**
 * Shuffle a deck using Fisher-Yates algorithm with optional seed.
 * 
 * @param deck - The deck to shuffle
 * @param seed - Optional seed for deterministic shuffling (for testing)
 * @returns A new shuffled deck (original is not modified)
 */
export function shuffleDeck(deck: Deck, seed?: number): Deck {
  // Create a mutable copy for shuffling
  const cards = [...deck]
  
  // Use seeded random if seed provided, otherwise use Math.random
  const random = seed !== undefined 
    ? createSeededRandom(seed) 
    : (): number => Math.random()
  
  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    // Swap elements
    [cards[i], cards[j]] = [cards[j], cards[i]]
  }
  
  return Object.freeze(cards)
}

/**
 * Get the display name for a rank.
 */
export function getRankDisplayName(rank: Rank): string {
  switch (rank) {
    case 1: return 'A'
    case 11: return 'J'
    case 12: return 'Q'
    case 13: return 'K'
    default: return String(rank)
  }
}

/**
 * Get the unicode symbol for a suit.
 */
export function getSuitSymbol(suit: Suit): string {
  switch (suit) {
    case 'hearts': return '♥'
    case 'diamonds': return '♦'
    case 'clubs': return '♣'
    case 'spades': return '♠'
  }
}

/**
 * Get a human-readable string for a card.
 */
export function getCardDisplayString(card: Card): string {
  return `${getRankDisplayName(card.rank)}${getSuitSymbol(card.suit)}`
}
