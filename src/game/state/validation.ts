/**
 * Move validation functions - Uses Strategy Pattern instead of switch
 */

import { canStackOnFoundation, canStackOnTableau, isKing } from '../card-utils'
import type { Card, GameState, LocationType, Move, Result } from '../types'
import { failure, success } from '../types'
import { getCardsForMove, getTopCard } from './accessors'

/** Strategy handlers for move validation - lazy evaluation with arrow functions */
type MoveValidationHandler = (state: GameState, move: Move, cardToMove: Card) => Result<boolean>

const moveValidationHandlers: Record<LocationType, MoveValidationHandler> = {
  tableau: (state, move, cardToMove) => {
    if (move.to.type !== 'tableau') return failure('Invalid destination')
    const targetColumn = state.tableau.columns[move.to.columnIndex]
    const targetCard = getTopCard(targetColumn)
    
    if (targetCard === undefined) {
      return isKing(cardToMove) 
        ? success(true) 
        : failure('Only Kings can be placed on empty tableau columns')
    }
    
    return canStackOnTableau(cardToMove, targetCard)
      ? success(true)
      : failure('Card must be opposite color and one rank lower')
  },
  
  foundation: (state, move, cardToMove) => {
    if (move.to.type !== 'foundation') return failure('Invalid destination')
    if (move.cardCount > 1) return failure('Can only move single cards to foundation')
    
    const foundationPile = state.foundations[move.to.suit]
    const topCard = getTopCard(foundationPile)
    
    return canStackOnFoundation(cardToMove, topCard, move.to.suit)
      ? success(true)
      : failure('Card must be same suit and next rank up')
  },
  
  stock: () => failure('Cannot move cards to stock'),
  waste: () => failure('Cannot move cards directly to waste'),
}

export function validateMove(state: GameState, move: Move): Result<boolean> {
  const sourceCards = getCardsForMove(state, move.from)
  if (sourceCards.length === 0) {
    return failure('No cards at source location')
  }
  
  const cardToMove = sourceCards[0]
  const handler = moveValidationHandlers[move.to.type]
  return handler(state, move, cardToMove)
}
