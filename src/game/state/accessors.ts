/**
 * State accessor functions
 */

import type { Card, CardLocation, Foundations, GameState, Pile, Suit } from '../types'

export function getTopCard(pile: Pile): Card | undefined {
  return pile.length > 0 ? pile[pile.length - 1] : undefined
}

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
    case 'waste':
      return getTopCard(state.stockAndWaste.waste)
    case 'stock':
      return getTopCard(state.stockAndWaste.stock)
  }
}

export function getFoundationPile(foundations: Foundations, suit: Suit): Pile {
  return foundations[suit]
}

export function getCardsForMove(
  state: GameState,
  from: CardLocation
): readonly Card[] {
  switch (from.type) {
    case 'tableau': {
      const column = state.tableau.columns[from.columnIndex]
      if (from.cardIndex >= column.length) return []
      return column.slice(from.cardIndex)
    }
    case 'waste': {
      const topCard = getTopCard(state.stockAndWaste.waste)
      return topCard ? [topCard] : []
    }
    case 'foundation': {
      const pile = state.foundations[from.suit]
      const topCard = getTopCard(pile)
      return topCard ? [topCard] : []
    }
    case 'stock':
      return []
  }
}
