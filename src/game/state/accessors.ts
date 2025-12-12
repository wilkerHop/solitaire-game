/**
 * State accessor functions - Uses Strategy Pattern instead of switch
 */

import type { Card, CardLocation, Foundations, GameState, LocationType, Pile, Suit } from '../types'

export function getTopCard(pile: Pile): Card | undefined {
  return pile.length > 0 ? pile[pile.length - 1] : undefined
}

/** Strategy handlers for getCardAtLocation - lazy evaluation with arrow functions */
type CardLocationHandler = (state: GameState, location: CardLocation) => Card | undefined

const cardAtLocationHandlers: Record<LocationType, CardLocationHandler> = {
  tableau: (state, location) => {
    if (location.type !== 'tableau') return undefined
    const column = state.tableau.columns[location.columnIndex]
    return column[location.cardIndex]
  },
  foundation: (state, location) => {
    if (location.type !== 'foundation') return undefined
    const pile = state.foundations[location.suit]
    return getTopCard(pile)
  },
  waste: (state) => getTopCard(state.stockAndWaste.waste),
  stock: (state) => getTopCard(state.stockAndWaste.stock),
}

export function getCardAtLocation(state: GameState, location: CardLocation): Card | undefined {
  const handler = cardAtLocationHandlers[location.type]
  return handler(state, location)
}

export function getFoundationPile(foundations: Foundations, suit: Suit): Pile {
  return foundations[suit]
}

/** Strategy handlers for getCardsForMove - lazy evaluation with arrow functions */
type CardsForMoveHandler = (state: GameState, from: CardLocation) => readonly Card[]

const cardsForMoveHandlers: Record<LocationType, CardsForMoveHandler> = {
  tableau: (state, from) => {
    if (from.type !== 'tableau') return []
    const column = state.tableau.columns[from.columnIndex]
    if (from.cardIndex >= column.length) return []
    return column.slice(from.cardIndex)
  },
  waste: (state) => {
    const topCard = getTopCard(state.stockAndWaste.waste)
    return topCard ? [topCard] : []
  },
  foundation: (state, from) => {
    if (from.type !== 'foundation') return []
    const pile = state.foundations[from.suit]
    const topCard = getTopCard(pile)
    return topCard ? [topCard] : []
  },
  stock: () => [],
}

export function getCardsForMove(state: GameState, from: CardLocation): readonly Card[] {
  const handler = cardsForMoveHandlers[from.type]
  return handler(state, from)
}
