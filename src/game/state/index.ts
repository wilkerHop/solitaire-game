/**
 * Game state barrel export
 */

export { getCardAtLocation, getCardsForMove, getFoundationPile, getTopCard } from './accessors'
export { dealGame } from './deal'
export { applyMove } from './moves'
export { findBestMove } from './smart-moves'
export { drawFromStock } from './stock'
export { validateMove } from './validation'
export { canAutoComplete, checkWinCondition } from './win'

