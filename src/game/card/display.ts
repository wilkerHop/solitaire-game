/**
 * Card display utilities - Uses Mapped Object Literals instead of switch
 */

import type { Card, Rank, Suit } from '../types'

/** Rank display names - static mapping */
const RANK_DISPLAY_NAMES: Record<Rank, string> = {
  1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7',
  8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K',
} as const

/** Suit symbols - static mapping */
const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
} as const

export function getRankDisplayName(rank: Rank): string {
  return RANK_DISPLAY_NAMES[rank]
}

export function getSuitSymbol(suit: Suit): string {
  return SUIT_SYMBOLS[suit]
}

export function getCardDisplayString(card: Card): string {
  return `${getRankDisplayName(card.rank)}${getSuitSymbol(card.suit)}`
}
