/**
 * Game state types for Solitaire
 */

import type { Pile, Suit } from './card'

export interface Tableau {
  readonly columns: readonly Pile[]
}

export interface Foundations {
  readonly hearts: Pile
  readonly diamonds: Pile
  readonly clubs: Pile
  readonly spades: Pile
}

export interface StockAndWaste {
  readonly stock: Pile
  readonly waste: Pile
}

export interface GameStats {
  readonly moves: number
  readonly score: number
  readonly startTime: number
  readonly elapsedSeconds: number
}

export interface GameState {
  readonly tableau: Tableau
  readonly foundations: Foundations
  readonly stockAndWaste: StockAndWaste
  readonly stats: GameStats
  readonly isWon: boolean
}

export type LocationType = 'tableau' | 'foundation' | 'stock' | 'waste'

export type CardLocation =
  | { readonly type: 'tableau'; readonly columnIndex: number; readonly cardIndex: number }
  | { readonly type: 'foundation'; readonly suit: Suit }
  | { readonly type: 'stock' }
  | { readonly type: 'waste' }
