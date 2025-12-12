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
  readonly onDragStart?: ((card: CardType, index: number, e: React.DragEvent) => void) | undefined
  readonly onDragOver?: ((e: React.DragEvent) => void) | undefined
  readonly onDrop?: ((e: React.DragEvent) => void) | undefined
  readonly onCardDoubleClick?: ((card: CardType, index: number) => void) | undefined
}

export function Pile({
  cards, layout = 'stacked', emptyPlaceholder, onCardClick, selectedCardIndex, label,
  onDragStart, onDragOver, onDrop, onCardDoubleClick,
}: PileProps): ReactElement {
  const isEmpty = cards.length === 0
  const pileHeight = isEmpty ? 112 : 112 + (cards.length - 1) * 25
  
  return (
    <div className={`pile pile-${layout} ${isEmpty ? 'pile-empty' : ''}`}
      aria-label={label} style={{ minHeight: layout === 'stacked' ? pileHeight : undefined }}
      onDragOver={onDragOver}
      onDrop={onDrop}>
      {isEmpty && emptyPlaceholder && (
        <div className={`pile-placeholder placeholder-${emptyPlaceholder}`}>
          {emptyPlaceholder === 'foundation' && <span className="placeholder-icon">♠</span>}
          {emptyPlaceholder === 'tableau' && <span className="placeholder-icon">K</span>}
          {emptyPlaceholder === 'stock' && <span className="placeholder-icon">⟳</span>}
        </div>
      )}
      
      {layout === 'single' ? (
        cards.length > 0 && (
          <Card card={cards[cards.length - 1]}
            onClick={(): void => { onCardClick?.(cards[cards.length - 1], cards.length - 1) }}
            isSelected={selectedCardIndex === cards.length - 1}
            onDragStart={onDragStart ? (e): void => { onDragStart(cards[cards.length - 1], cards.length - 1, e) } : undefined}
            onDoubleClick={(): void => { onCardDoubleClick?.(cards[cards.length - 1], cards.length - 1) }} />
        )
      ) : (
        cards.map((card, index) => {
          const isClickable = card.faceUp
          return (
            <div key={`${card.suit}-${String(card.rank)}-${String(index)}`}
              className="pile-card-wrapper"
              style={{ '--card-index': index, zIndex: index } as React.CSSProperties}>
              <Card card={card}
                onClick={isClickable ? (): void => { onCardClick?.(card, index) } : undefined}
                isSelected={selectedCardIndex !== undefined && index >= selectedCardIndex && card.faceUp}
                stackOffset={index}
                onDragStart={isClickable && onDragStart ? (e): void => { onDragStart(card, index, e) } : undefined}
                onDoubleClick={isClickable ? (): void => { onCardDoubleClick?.(card, index) } : undefined}
              />
            </div>
          )
        })
      )}
    </div>
  )
}
