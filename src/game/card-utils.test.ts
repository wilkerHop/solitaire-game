import { describe, expect, it } from 'vitest'
import {
    canStackOnFoundation,
    canStackOnTableau,
    createCard,
    createDeck,
    createSeededRandom,
    flipCardDown,
    flipCardUp,
    getCardColor,
    getCardDisplayString,
    getSuitColor,
    hasAlternatingColors,
    isAce,
    isKing,
    shuffleDeck,
} from '../game'

describe('Card Utilities', () => {
  describe('getSuitColor', () => {
    it('should return red for hearts', () => {
      expect(getSuitColor('hearts')).toBe('red')
    })

    it('should return red for diamonds', () => {
      expect(getSuitColor('diamonds')).toBe('red')
    })

    it('should return black for clubs', () => {
      expect(getSuitColor('clubs')).toBe('black')
    })

    it('should return black for spades', () => {
      expect(getSuitColor('spades')).toBe('black')
    })
  })

  describe('getCardColor', () => {
    it('should return red for a heart card', () => {
      const card = createCard('hearts', 5)
      expect(getCardColor(card)).toBe('red')
    })

    it('should return black for a spade card', () => {
      const card = createCard('spades', 10)
      expect(getCardColor(card)).toBe('black')
    })
  })

  describe('hasAlternatingColors', () => {
    it('should return true for red and black cards', () => {
      const redCard = createCard('hearts', 5)
      const blackCard = createCard('spades', 6)
      expect(hasAlternatingColors(redCard, blackCard)).toBe(true)
    })

    it('should return false for two red cards', () => {
      const redCard1 = createCard('hearts', 5)
      const redCard2 = createCard('diamonds', 6)
      expect(hasAlternatingColors(redCard1, redCard2)).toBe(false)
    })

    it('should return false for two black cards', () => {
      const blackCard1 = createCard('clubs', 5)
      const blackCard2 = createCard('spades', 6)
      expect(hasAlternatingColors(blackCard1, blackCard2)).toBe(false)
    })
  })

  describe('canStackOnTableau', () => {
    it('should allow placing red 5 on black 6', () => {
      const red5 = createCard('hearts', 5)
      const black6 = createCard('spades', 6)
      expect(canStackOnTableau(red5, black6)).toBe(true)
    })

    it('should not allow placing card of same color', () => {
      const red5 = createCard('hearts', 5)
      const red6 = createCard('diamonds', 6)
      expect(canStackOnTableau(red5, red6)).toBe(false)
    })

    it('should not allow placing card of wrong rank', () => {
      const red4 = createCard('hearts', 4)
      const black6 = createCard('spades', 6)
      expect(canStackOnTableau(red4, black6)).toBe(false)
    })

    it('should allow placing Queen on King with alternating colors', () => {
      const blackQueen = createCard('spades', 12)
      const redKing = createCard('hearts', 13)
      expect(canStackOnTableau(blackQueen, redKing)).toBe(true)
    })
  })

  describe('canStackOnFoundation', () => {
    it('should allow placing Ace on empty foundation of same suit', () => {
      const aceOfHearts = createCard('hearts', 1)
      expect(canStackOnFoundation(aceOfHearts, undefined, 'hearts')).toBe(true)
    })

    it('should not allow placing non-Ace on empty foundation', () => {
      const twoOfHearts = createCard('hearts', 2)
      expect(canStackOnFoundation(twoOfHearts, undefined, 'hearts')).toBe(false)
    })

    it('should allow placing 2 on Ace of same suit', () => {
      const twoOfHearts = createCard('hearts', 2)
      const aceOfHearts = createCard('hearts', 1)
      expect(canStackOnFoundation(twoOfHearts, aceOfHearts, 'hearts')).toBe(true)
    })

    it('should not allow placing card of different suit', () => {
      const aceOfDiamonds = createCard('diamonds', 1)
      expect(canStackOnFoundation(aceOfDiamonds, undefined, 'hearts')).toBe(false)
    })

    it('should not allow placing card of wrong rank', () => {
      const threeOfHearts = createCard('hearts', 3)
      const aceOfHearts = createCard('hearts', 1)
      expect(canStackOnFoundation(threeOfHearts, aceOfHearts, 'hearts')).toBe(false)
    })
  })

  describe('isKing and isAce', () => {
    it('should identify King correctly', () => {
      const king = createCard('hearts', 13)
      expect(isKing(king)).toBe(true)
      expect(isAce(king)).toBe(false)
    })

    it('should identify Ace correctly', () => {
      const ace = createCard('spades', 1)
      expect(isAce(ace)).toBe(true)
      expect(isKing(ace)).toBe(false)
    })

    it('should identify non-special cards correctly', () => {
      const five = createCard('clubs', 5)
      expect(isKing(five)).toBe(false)
      expect(isAce(five)).toBe(false)
    })
  })

  describe('createCard', () => {
    it('should create a card with correct properties', () => {
      const card = createCard('hearts', 7, true)
      expect(card.suit).toBe('hearts')
      expect(card.rank).toBe(7)
      expect(card.faceUp).toBe(true)
    })

    it('should default to face down', () => {
      const card = createCard('diamonds', 3)
      expect(card.faceUp).toBe(false)
    })

    it('should create frozen (immutable) cards', () => {
      const card = createCard('clubs', 10)
      expect(Object.isFrozen(card)).toBe(true)
    })
  })

  describe('flipCardUp and flipCardDown', () => {
    it('should flip a face-down card up', () => {
      const faceDown = createCard('hearts', 5, false)
      const faceUp = flipCardUp(faceDown)
      expect(faceUp.faceUp).toBe(true)
      expect(faceUp.suit).toBe('hearts')
      expect(faceUp.rank).toBe(5)
    })

    it('should return same card if already face up', () => {
      const faceUp = createCard('hearts', 5, true)
      const result = flipCardUp(faceUp)
      expect(result).toBe(faceUp) // Same reference
    })

    it('should flip a face-up card down', () => {
      const faceUp = createCard('spades', 10, true)
      const faceDown = flipCardDown(faceUp)
      expect(faceDown.faceUp).toBe(false)
    })

    it('should return same card if already face down', () => {
      const faceDown = createCard('spades', 10, false)
      const result = flipCardDown(faceDown)
      expect(result).toBe(faceDown) // Same reference
    })
  })
})

describe('Deck Operations', () => {
  describe('createDeck', () => {
    it('should create a deck with 52 cards', () => {
      const deck = createDeck()
      expect(deck.length).toBe(52)
    })

    it('should have 13 cards of each suit', () => {
      const deck = createDeck()
      const hearts = deck.filter(c => c.suit === 'hearts')
      const diamonds = deck.filter(c => c.suit === 'diamonds')
      const clubs = deck.filter(c => c.suit === 'clubs')
      const spades = deck.filter(c => c.suit === 'spades')
      
      expect(hearts.length).toBe(13)
      expect(diamonds.length).toBe(13)
      expect(clubs.length).toBe(13)
      expect(spades.length).toBe(13)
    })

    it('should have all cards face down', () => {
      const deck = createDeck()
      expect(deck.every(c => !c.faceUp)).toBe(true)
    })

    it('should be frozen (immutable)', () => {
      const deck = createDeck()
      expect(Object.isFrozen(deck)).toBe(true)
    })
  })

  describe('shuffleDeck', () => {
    it('should return a deck with 52 cards', () => {
      const deck = createDeck()
      const shuffled = shuffleDeck(deck)
      expect(shuffled.length).toBe(52)
    })

    it('should not mutate the original deck', () => {
      const deck = createDeck()
      const originalFirst = deck[0]
      shuffleDeck(deck, 12345)
      expect(deck[0]).toBe(originalFirst)
    })

    it('should produce deterministic results with same seed', () => {
      const deck = createDeck()
      const shuffled1 = shuffleDeck(deck, 42)
      const shuffled2 = shuffleDeck(deck, 42)
      
      expect(shuffled1.length).toBe(shuffled2.length)
      const allMatch = shuffled1.every((card, i) =>
        card.suit === shuffled2[i].suit && card.rank === shuffled2[i].rank
      )
      expect(allMatch).toBe(true)
    })

    it('should produce different results with different seeds', () => {
      const deck = createDeck()
      const shuffled1 = shuffleDeck(deck, 42)
      const shuffled2 = shuffleDeck(deck, 43)
      
      // At least some cards should be in different positions
      const differences = shuffled1.filter((card, i) =>
        card.suit !== shuffled2[i].suit || card.rank !== shuffled2[i].rank
      ).length
      expect(differences).toBeGreaterThan(0)
    })

    it('should be frozen (immutable)', () => {
      const deck = createDeck()
      const shuffled = shuffleDeck(deck, 42)
      expect(Object.isFrozen(shuffled)).toBe(true)
    })
  })

  describe('createSeededRandom', () => {
    it('should produce deterministic sequence', () => {
      const random1 = createSeededRandom(12345)
      const random2 = createSeededRandom(12345)
      
      const allMatch = Array.from({ length: 10 }).every(() =>
        random1() === random2()
      )
      expect(allMatch).toBe(true)
    })

    it('should produce values in [0, 1) range', () => {
      const random = createSeededRandom(99999)
      
      const allInRange = Array.from({ length: 100 }).every(() => {
        const value = random()
        return value >= 0 && value < 1
      })
      expect(allInRange).toBe(true)
    })
  })
})

describe('Display Functions', () => {
  describe('getCardDisplayString', () => {
    it('should format Ace of Spades correctly', () => {
      const ace = createCard('spades', 1)
      expect(getCardDisplayString(ace)).toBe('A♠')
    })

    it('should format 10 of Hearts correctly', () => {
      const ten = createCard('hearts', 10)
      expect(getCardDisplayString(ten)).toBe('10♥')
    })

    it('should format Jack of Diamonds correctly', () => {
      const jack = createCard('diamonds', 11)
      expect(getCardDisplayString(jack)).toBe('J♦')
    })

    it('should format Queen of Clubs correctly', () => {
      const queen = createCard('clubs', 12)
      expect(getCardDisplayString(queen)).toBe('Q♣')
    })

    it('should format King of Hearts correctly', () => {
      const king = createCard('hearts', 13)
      expect(getCardDisplayString(king)).toBe('K♥')
    })
  })
})
