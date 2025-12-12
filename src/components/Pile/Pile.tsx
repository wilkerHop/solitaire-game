/**
 * Pile Component - Renders a stack of cards.
 * 
 * Supports different layouts: stacked (tableau), spread, or single (foundation/stock).
 */

import type { ReactElement } from 'react'
import type { Card as CardType, Pile as PileType } from '../../game'
import { Card } from '../Card'
import './Pile.css'

type PileLayout = 'stacked' | 'spread' | 'single'

interface PileProps {
  readonly cards: PileType
  readonly layout?: PileLayout | undefined
  readonly emptyPlaceholder?: 'foundation' | 'tableau' | 'stock' | undefined
  readonly onCardClick?: ((card: CardType, index: number) => void) | undefined
  readonly selectedCardIndex?: number | undefined
  readonly label?: string | undefined
}

export function Pile({
  cards,
  layout = 'stacked',
  emptyPlaceholder,
  onCardClick,
  selectedCardIndex,
  label,
}: PileProps): ReactElement {
  const isEmpty = cards.length === 0
  
  return (
    <div 
      className={`pile pile-${layout} ${isEmpty ? 'pile-empty' : ''}`}
      aria-label={label}
    >
      {isEmpty && emptyPlaceholder && (
        <div className={`pile-placeholder placeholder-${emptyPlaceholder}`}>
          {emptyPlaceholder === 'foundation' && (
            <span className="placeholder-icon">♠</span>
          )}
          {emptyPlaceholder === 'tableau' && (
            <span className="placeholder-icon">K</span>
          )}
          {emptyPlaceholder === 'stock' && (
            <span className="placeholder-icon">⟳</span>
          )}
        </div>
      )}
      
      {layout === 'single' ? (
        // Only show top card
        cards.length > 0 && (
          <Card
            card={cards[cards.length - 1]}
            onClick={(): void => {
              onCardClick?.(cards[cards.length - 1], cards.length - 1)
            }}
            isSelected={selectedCardIndex === cards.length - 1}
          />
        )
      ) : (
        // Show all cards with offset
        cards.map((card, index) => (
          <div
            key={`${card.suit}-${String(card.rank)}-${String(index)}`}
            className="pile-card-wrapper"
            style={{
              '--card-index': index,
              zIndex: index,
            } as React.CSSProperties}
          >
            <Card
              card={card}
              onClick={(): void => {
                onCardClick?.(card, index)
              }}
              isSelected={selectedCardIndex !== undefined && index >= selectedCardIndex}
              stackOffset={index}
            />
          </div>
        ))
      )}
    </div>
  )
}
