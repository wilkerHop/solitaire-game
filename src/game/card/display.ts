/**
 * Card display utilities
 */

import type { Card, Rank, Suit } from '../types'

export function getRankDisplayName(rank: Rank): string {
  switch (rank) {
    case 1: return 'A'
    case 11: return 'J'
    case 12: return 'Q'
    case 13: return 'K'
    default: return String(rank)
  }
}

export function getSuitSymbol(suit: Suit): string {
  switch (suit) {
    case 'hearts': return '♥'
    case 'diamonds': return '♦'
    case 'clubs': return '♣'
    case 'spades': return '♠'
  }
}

export function getCardDisplayString(card: Card): string {
  return `${getRankDisplayName(card.rank)}${getSuitSymbol(card.suit)}`
}
