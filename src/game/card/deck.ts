/**
 * Deck and card creation utilities
 */

import type { Card, Deck, Rank, Suit } from '../types'
import { RANKS, SUITS } from '../types'

export function createCard(suit: Suit, rank: Rank, faceUp = false): Card {
  return Object.freeze({ suit, rank, faceUp })
}

export function flipCardUp(card: Card): Card {
  if (card.faceUp) return card
  return createCard(card.suit, card.rank, true)
}

export function flipCardDown(card: Card): Card {
  if (!card.faceUp) return card
  return createCard(card.suit, card.rank, false)
}

export function createDeck(): Deck {
  const cards: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push(createCard(suit, rank, false))
    }
  }
  return Object.freeze(cards)
}

export function createSeededRandom(seed: number): () => number {
  const rng = { state: seed }
  return (): number => {
    rng.state = (rng.state * 1103515245 + 12345) & 0x7fffffff
    return rng.state / 0x7fffffff
  }
}

export function shuffleDeck(deck: Deck, seed?: number): Deck {
  const cards = [...deck]
  const random = seed !== undefined 
    ? createSeededRandom(seed) 
    : (): number => Math.random()
  
  for (const i of Array.from({ length: cards.length - 1 }, (_, k) => cards.length - 1 - k)) {
    const j = Math.floor(random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]]
  }
  return Object.freeze(cards)
}
