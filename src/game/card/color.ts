/**
 * Card color utilities
 */

import type { Card, Color, Suit } from '../types'

export function getSuitColor(suit: Suit): Color {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black'
}

export function getCardColor(card: Card): Color {
  return getSuitColor(card.suit)
}

export function hasAlternatingColors(card1: Card, card2: Card): boolean {
  return getCardColor(card1) !== getCardColor(card2)
}
