/**
 * Top row component: Stock, Waste, and Foundations
 */

import type { ReactElement } from 'react'
import type { CardLocation, Foundations, StockAndWaste } from '../../game'
import { Card } from '../Card'
import { Pile } from '../Pile'

interface TopRowProps {
  readonly stockAndWaste: StockAndWaste
  readonly foundations: Foundations
  readonly selectedLocation: CardLocation | null
  readonly onStockClick: () => void
  readonly onWasteClick: () => void
  readonly onFoundationClick: (pileIndex: number) => void
  readonly onWasteDragStart?: (e: React.DragEvent) => void
  readonly onFoundationDragStart?: (pileIndex: number, e: React.DragEvent) => void
  readonly onFoundationDrop?: (pileIndex: number, e: React.DragEvent) => void
  readonly onDragOver?: (e: React.DragEvent) => void
  readonly onWasteDoubleClick?: () => void
}

export function TopRow({
  stockAndWaste, foundations, selectedLocation, onStockClick, onWasteClick, onFoundationClick,
  onWasteDragStart, onFoundationDragStart, onFoundationDrop, onDragOver, onWasteDoubleClick,
}: TopRowProps): ReactElement {
  return (
    <div className="game-top-row">
      <div className="stock-waste-area">
        <div className="stock-pile" onClick={onStockClick} role="button" tabIndex={0} aria-label="Stock pile">
          {stockAndWaste.stock.length > 0 ? (
            <Card card={{ suit: 'spades', rank: 1, faceUp: false }} />
          ) : (
            <div className="pile-placeholder placeholder-stock"><span className="placeholder-icon">⟳</span></div>
          )}
          <span className="pile-count">{stockAndWaste.stock.length}</span>
        </div>
        <div className="waste-pile" onClick={onWasteClick} role="button" tabIndex={0} aria-label="Waste pile">
          {stockAndWaste.waste.length > 0 ? (
            <Card
              card={stockAndWaste.waste[stockAndWaste.waste.length - 1]}
              isSelected={selectedLocation?.type === 'waste'}
              onDragStart={onWasteDragStart}
              onDoubleClick={onWasteDoubleClick}
            />
          ) : (
            <div className="pile-placeholder"><span className="placeholder-icon"></span></div>
          )}
        </div>
      </div>
      <div className="top-row-spacer" />
      <div className="foundations-area">
        {foundations.piles.map((pile, index) => (
          <div key={index} className="foundation-pile"
            onClick={(): void => { onFoundationClick(index) }} role="button" tabIndex={0} aria-label={`Foundation pile ${String(index + 1)}`}>
            <Pile cards={pile} layout="single" emptyPlaceholder="foundation"
              onCardClick={(): void => { onFoundationClick(index) }} label={`Foundation pile ${String(index + 1)}`}
              onDragStart={onFoundationDragStart ? (_, __, e): void => { onFoundationDragStart(index, e) } : undefined}
              onDragOver={onDragOver}
              onDrop={onFoundationDrop ? (e): void => { onFoundationDrop(index, e) } : undefined} />
          </div>
        ))}
      </div>
    </div>
  )
}
