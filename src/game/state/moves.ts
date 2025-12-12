/**
 * Apply moves to game state - Uses Strategy Pattern instead of switch
 */

import { flipCardUp } from '../card-utils'
import type { Card, CardLocation, GameState, GameStats, LocationType, Move, Result } from '../types'
import { failure, success } from '../types'
import { getCardsForMove } from './accessors'
import { validateMove } from './validation'
import { checkWinCondition } from './win'

export function applyMove(state: GameState, move: Move): Result<GameState> {
  const validation = validateMove(state, move)
  if (!validation.success) return failure(validation.error)
  
  const cardsToMove = getCardsForMove(state, move.from)
  if (cardsToMove.length === 0) return failure('No cards to move')
  
  const stateAfterRemoval = removeCardsFromSource(state, move)
  const stateAfterAdd = addCardsToDestination(stateAfterRemoval, move.to, cardsToMove)
  
  const newStats: GameStats = Object.freeze({
    ...stateAfterAdd.stats,
    moves: stateAfterAdd.stats.moves + 1,
  })
  const isWon = checkWinCondition(stateAfterAdd)
  
  return success(Object.freeze({ ...stateAfterAdd, stats: newStats, isWon }))
}

type RemoveFromSourceHandler = (state: GameState, move: Move) => GameState

const removeFromSourceHandlers: Record<LocationType, RemoveFromSourceHandler> = {
  tableau: (state, move) => {
    if (move.from.type !== 'tableau') return state
    const columns = [...state.tableau.columns]
    const column = [...columns[move.from.columnIndex]]
    column.splice(move.from.cardIndex)
    if (column.length > 0 && !column[column.length - 1].faceUp) {
      column[column.length - 1] = flipCardUp(column[column.length - 1])
    }
    columns[move.from.columnIndex] = Object.freeze(column)
    return Object.freeze({
      ...state,
      tableau: Object.freeze({ columns: Object.freeze(columns) }),
    })
  },
  waste: (state) => {
    const waste = state.stockAndWaste.waste.slice(0, -1)
    return Object.freeze({
      ...state,
      stockAndWaste: Object.freeze({ ...state.stockAndWaste, waste: Object.freeze(waste) }),
    })
  },
  foundation: (state, move) => {
    if (move.from.type !== 'foundation') return state
    const foundations = { ...state.foundations }
    const pile = foundations[move.from.suit].slice(0, -1)
    foundations[move.from.suit] = Object.freeze(pile)
    return Object.freeze({ ...state, foundations: Object.freeze(foundations) })
  },
  stock: (state) => state,
}

function removeCardsFromSource(state: GameState, move: Move): GameState {
  const handler = removeFromSourceHandlers[move.from.type]
  return handler(state, move)
}

type AddToDestinationHandler = (s: GameState, d: CardLocation, c: readonly Card[]) => GameState

const addToDestinationHandlers: Record<LocationType, AddToDestinationHandler> = {
  tableau: (state, destination, cards) => {
    if (destination.type !== 'tableau') return state
    const columns = [...state.tableau.columns]
    const column = [...columns[destination.columnIndex], ...cards]
    columns[destination.columnIndex] = Object.freeze(column)
    return Object.freeze({
      ...state,
      tableau: Object.freeze({ columns: Object.freeze(columns) }),
    })
  },
  foundation: (state, destination, cards) => {
    if (destination.type !== 'foundation') return state
    const foundations = { ...state.foundations }
    const pile = [...foundations[destination.suit], ...cards]
    foundations[destination.suit] = Object.freeze(pile)
    return Object.freeze({ ...state, foundations: Object.freeze(foundations) })
  },
  stock: (state) => state,
  waste: (state) => state,
}

function addCardsToDestination(state: GameState, destination: CardLocation, cards: readonly Card[]): GameState {
  return addToDestinationHandlers[destination.type](state, destination, cards)
}
