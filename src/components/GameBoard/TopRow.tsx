/**
 * Top row component: Stock, Waste, and Foundations
 */

import type { ReactElement } from 'react'
import type { CardLocation, Foundations, StockAndWaste, Suit } from '../../game'
import { Card } from '../Card'
import { Pile } from '../Pile'

interface TopRowProps {
  readonly stockAndWaste: StockAndWaste
  readonly foundations: Foundations
  readonly selectedLocation: CardLocation | null
  readonly onStockClick: () => void
  readonly onWasteClick: () => void
  readonly onFoundationClick: (suit: Suit) => void
}

const FOUNDATION_SUITS: readonly Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']

export function TopRow({
  stockAndWaste, foundations, selectedLocation, onStockClick, onWasteClick, onFoundationClick
}: TopRowProps): ReactElement {
  return (
    <div className="game-top-row">
      <div className="stock-waste-area">
        <div className="stock-pile" onClick={onStockClick} role="button" tabIndex={0} aria-label="Stock pile">
          {stockAndWaste.stock.length > 0 ? (
            <Card card={{ suit: 'spades', rank: 1, faceUp: false }} onClick={onStockClick} />
          ) : (
            <div className="pile-placeholder placeholder-stock"><span className="placeholder-icon">⟳</span></div>
          )}
          <span className="pile-count">{stockAndWaste.stock.length}</span>
        </div>
        <div className="waste-pile" onClick={onWasteClick} role="button" tabIndex={0} aria-label="Waste pile">
          {stockAndWaste.waste.length > 0 ? (
            <Card
              card={stockAndWaste.waste[stockAndWaste.waste.length - 1]}
              onClick={onWasteClick}
              isSelected={selectedLocation?.type === 'waste'}
            />
          ) : (
            <div className="pile-placeholder"><span className="placeholder-icon"></span></div>
          )}
        </div>
      </div>
      <div className="top-row-spacer" />
      <div className="foundations-area">
        {FOUNDATION_SUITS.map((suit) => (
          <div key={suit} className={`foundation-pile foundation-${suit}`}
            onClick={(): void => { onFoundationClick(suit) }} role="button" tabIndex={0} aria-label={`${suit} foundation`}>
            <Pile cards={foundations[suit]} layout="single" emptyPlaceholder="foundation"
              onCardClick={(): void => { onFoundationClick(suit) }} label={`${suit} foundation`} />
          </div>
        ))}
      </div>
    </div>
  )
}
