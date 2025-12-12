/**
 * Stock and waste pile operations
 */

import { flipCardUp } from '../card-utils'
import type { GameState } from '../types'

export function drawFromStock(state: GameState, count = 1): GameState {
  const { stock, waste } = state.stockAndWaste
  
  if (stock.length === 0) {
    if (waste.length === 0) return state
    
    const newStock = waste.map(card => 
      card.faceUp ? { ...card, faceUp: false } : card
    ).reverse()
    
    return Object.freeze({
      ...state,
      stockAndWaste: Object.freeze({
        stock: Object.freeze(newStock),
        waste: Object.freeze([]),
      }),
    })
  }
  
  const drawCount = Math.min(count, stock.length)
  const drawnCards = stock.slice(-drawCount).map(flipCardUp).reverse()
  const newStock = stock.slice(0, -drawCount)
  const newWaste = [...waste, ...drawnCards]
  
  return Object.freeze({
    ...state,
    stockAndWaste: Object.freeze({
      stock: Object.freeze(newStock),
      waste: Object.freeze(newWaste),
    }),
  })
}
