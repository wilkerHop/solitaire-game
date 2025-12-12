/**
 * Card stacking rules
 */

import type { Card, Suit } from '../types'
import { hasAlternatingColors } from './color'

export function canStackOnTableau(cardToPlace: Card, targetCard: Card): boolean {
  return (
    hasAlternatingColors(cardToPlace, targetCard) &&
    cardToPlace.rank === targetCard.rank - 1
  )
}

export function canStackOnFoundation(
  cardToPlace: Card,
  foundationTopCard: Card | undefined,
  foundationSuit: Suit
): boolean {
  if (cardToPlace.suit !== foundationSuit) {
    return false
  }
  if (foundationTopCard === undefined) {
    return cardToPlace.rank === 1
  }
  return cardToPlace.rank === foundationTopCard.rank + 1
}

export function isKing(card: Card): boolean {
  return card.rank === 13
}

export function isAce(card: Card): boolean {
  return card.rank === 1
}
