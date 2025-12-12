/**
 * Selector hooks for performance optimization
 */

import type { GameState } from '../game'
import { useGameStore } from './game-store'

export const useGameState = (): GameState => 
  useGameStore((state) => state.history.present)

export const useIsWon = (): boolean =>
  useGameStore((state) => state.history.present.isWon)

export const useCanUndo = (): boolean =>
  useGameStore((state) => state.history.past.length > 0)

export const useCanRedo = (): boolean =>
  useGameStore((state) => state.history.future.length > 0)

export const useStats = (): GameState['stats'] =>
  useGameStore((state) => state.history.present.stats)

export const useTableau = (): GameState['tableau'] =>
  useGameStore((state) => state.history.present.tableau)

export const useFoundations = (): GameState['foundations'] =>
  useGameStore((state) => state.history.present.foundations)

export const useStockAndWaste = (): GameState['stockAndWaste'] =>
  useGameStore((state) => state.history.present.stockAndWaste)
