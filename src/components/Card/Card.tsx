/**
 * Card Component - A pure/dumb component that renders a playing card.
 * 
 * This component only receives props and renders - no state or side effects.
 */

import type { ReactElement } from 'react'
import type { Card as CardType } from '../../game'
import { getCardColor, getRankDisplayName, getSuitSymbol } from '../../game'
import './Card.css'

interface CardProps {
  readonly card: CardType
  readonly onClick?: (() => void) | undefined
  readonly isSelected?: boolean | undefined
  readonly isDragging?: boolean | undefined
  readonly stackOffset?: number | undefined
}

export function Card({
  card,
  onClick,
  isSelected = false,
  isDragging = false,
  stackOffset = 0,
}: CardProps): ReactElement {
  const color = getCardColor(card)
  const rankDisplay = getRankDisplayName(card.rank)
  const suitSymbol = getSuitSymbol(card.suit)
  
  if (!card.faceUp) {
    return (
      <div
        className={`card card-back ${isSelected ? 'selected' : ''}`}
        style={{ '--stack-offset': stackOffset } as React.CSSProperties}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e): void => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick?.()
          }
        }}
        aria-label="Face-down card"
      >
        <div className="card-back-pattern" />
      </div>
    )
  }

  return (
    <div
      className={`card card-face ${color} ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{ '--stack-offset': stackOffset } as React.CSSProperties}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e): void => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.()
        }
      }}
      aria-label={`${rankDisplay} of ${card.suit}`}
    >
      <div className="card-corner top-left">
        <span className="card-rank">{rankDisplay}</span>
        <span className="card-suit">{suitSymbol}</span>
      </div>
      
      <div className="card-center">
        <span className="card-suit-large">{suitSymbol}</span>
      </div>
      
      <div className="card-corner bottom-right">
        <span className="card-rank">{rankDisplay}</span>
        <span className="card-suit">{suitSymbol}</span>
      </div>
    </div>
  )
}
