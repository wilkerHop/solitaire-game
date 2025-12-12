/**
 * Move validation functions
 */

import { canStackOnFoundation, canStackOnTableau, isKing } from '../card-utils'
import type { GameState, Move, Result } from '../types'
import { failure, success } from '../types'
import { getCardsForMove, getTopCard } from './accessors'

export function validateMove(state: GameState, move: Move): Result<boolean> {
  const sourceCards = getCardsForMove(state, move.from)
  if (sourceCards.length === 0) {
    return failure('No cards at source location')
  }
  
  const cardToMove = sourceCards[0]
  
  switch (move.to.type) {
    case 'tableau': {
      const targetColumn = state.tableau.columns[move.to.columnIndex]
      const targetCard = getTopCard(targetColumn)
      
      if (targetCard === undefined) {
        if (!isKing(cardToMove)) {
          return failure('Only Kings can be placed on empty tableau columns')
        }
        return success(true)
      }
      
      if (!canStackOnTableau(cardToMove, targetCard)) {
        return failure('Card must be opposite color and one rank lower')
      }
      return success(true)
    }
    
    case 'foundation': {
      if (move.cardCount > 1) {
        return failure('Can only move single cards to foundation')
      }
      const foundationPile = state.foundations[move.to.suit]
      const topCard = getTopCard(foundationPile)
      if (!canStackOnFoundation(cardToMove, topCard, move.to.suit)) {
        return failure('Card must be same suit and next rank up')
      }
      return success(true)
    }
    
    case 'stock':
      return failure('Cannot move cards to stock')
    
    case 'waste':
      return failure('Cannot move cards directly to waste')
  }
}
