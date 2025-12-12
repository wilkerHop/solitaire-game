/**
 * Move and Result types for Solitaire
 */

import type { CardLocation } from './game-state'

export interface Move {
  readonly from: CardLocation
  readonly to: CardLocation
  readonly cardCount: number
}

export type Result<T, E = string> =
  | { readonly success: true; readonly value: T }
  | { readonly success: false; readonly error: E }

export function success<T>(value: T): Result<T, never> {
  return { success: true, value }
}

export function failure<E>(error: E): Result<never, E> {
  return { success: false, error }
}
