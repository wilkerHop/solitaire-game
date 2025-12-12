/**
 * Card-related types for Solitaire
 */

export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const
export type Suit = typeof SUITS[number]

export const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const
export type Rank = typeof RANKS[number]

export type Color = 'red' | 'black'

export interface Card {
  readonly suit: Suit
  readonly rank: Rank
  readonly faceUp: boolean
}

export type Deck = readonly Card[]
export type Pile = readonly Card[]
