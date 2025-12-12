/**
 * Tableau area component
 */

import type { ReactElement } from 'react'
import type { CardLocation, Tableau } from '../../game'
import { Pile } from '../Pile'

interface TableauAreaProps {
  readonly tableau: Tableau
  readonly selectedLocation: CardLocation | null
  readonly onCardClick: (location: CardLocation) => void
  readonly onEmptyColumnClick: (columnIndex: number) => void
  readonly onColumnDragStart?: (columnIndex: number, cardIndex: number, e: React.DragEvent) => void
  readonly onColumnDrop?: (columnIndex: number, e: React.DragEvent) => void
  readonly onDragOver?: (e: React.DragEvent) => void
  readonly onCardDoubleClick?: (location: CardLocation) => void
}

export function TableauArea({
  tableau, selectedLocation, onCardClick, onEmptyColumnClick,
  onColumnDragStart, onColumnDrop, onDragOver, onCardDoubleClick,
}: TableauAreaProps): ReactElement {
  return (
    <div className="tableau-area">
      {tableau.columns.map((column, colIndex) => (
        <div key={colIndex} className="tableau-column"
          onClick={column.length === 0 ? (): void => { onEmptyColumnClick(colIndex) } : undefined}
          onDragOver={onDragOver}
          onDrop={onColumnDrop ? (e): void => { onColumnDrop(colIndex, e) } : undefined}
          >
          <Pile
            cards={column}
            layout="stacked"
            emptyPlaceholder="tableau"
            onCardClick={(_, cardIndex): void => {
              onCardClick({ type: 'tableau', columnIndex: colIndex, cardIndex })
            }}
            selectedCardIndex={
              selectedLocation?.type === 'tableau' && selectedLocation.columnIndex === colIndex
                ? selectedLocation.cardIndex
                : undefined
            }
            label={`Tableau column ${String(colIndex + 1)}`}
            onDragStart={onColumnDragStart ? (_, cardIndex, e): void => {
              onColumnDragStart(colIndex, cardIndex, e)
            } : undefined}
            onCardDoubleClick={(_, cardIndex): void => {
              onCardDoubleClick?.({ type: 'tableau', columnIndex: colIndex, cardIndex })
            }}
          />
        </div>
      ))}
    </div>
  )
}
