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
}

export function TableauArea({
  tableau, selectedLocation, onCardClick, onEmptyColumnClick
}: TableauAreaProps): ReactElement {
  return (
    <div className="tableau-area">
      {tableau.columns.map((column, colIndex) => (
        <div key={colIndex} className="tableau-column"
          onClick={column.length === 0 ? (): void => { onEmptyColumnClick(colIndex) } : undefined}>
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
          />
        </div>
      ))}
    </div>
  )
}
