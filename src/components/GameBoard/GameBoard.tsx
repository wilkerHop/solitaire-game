/**
 * GameBoard Component - The main game layout connecting View to State.
 */

import type { ReactElement } from 'react'
import { useCallback, useState } from 'react'
import type { CardLocation } from '../../game'
import {
  useCanRedo, useCanUndo, useFoundations, useGameState,
  useGameStore, useIsWon, useStats, useStockAndWaste, useTableau
} from '../../store'
import { Controls } from './Controls'
import './GameBoard.css'
import { TableauArea } from './TableauArea'
import { TopRow } from './TopRow'
import { useDragDrop } from './useDragDrop'
import { useGameHandlers } from './useGameHandlers'

export function GameBoard(): ReactElement {
  const gameState = useGameState()
  const tableau = useTableau()
  const foundations = useFoundations()
  const stockAndWaste = useStockAndWaste()
  const isWon = useIsWon()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()
  const stats = useStats()
  const { moveCard, drawCard, undo, redo, newGame, autoComplete } = useGameStore()
  const [selectedLocation, setSelectedLocation] = useState<CardLocation | null>(null)

  const {
      handleDoubleClick,
      handleCardClick,
      handleStockClick,
      handleWasteClick,
      handleFoundationClick,
      handleEmptyTableauClick
  } = useGameHandlers(
      gameState, moveCard, drawCard, selectedLocation, setSelectedLocation, stockAndWaste, tableau
  )

  const { handleDragStart, handleDragOver, handleDrop } = useDragDrop(moveCard, tableau.columns, setSelectedLocation)

  const handleKeyDown = useCallback((e: React.KeyboardEvent): void => {
    if (e.key === 'Escape') setSelectedLocation(null)
  }, [])

  return (
    <div className="game-board" onKeyDown={handleKeyDown} tabIndex={-1}>
      <TopRow
        stockAndWaste={stockAndWaste}
        foundations={foundations}
        selectedLocation={selectedLocation}
        onStockClick={handleStockClick}
        onWasteClick={handleWasteClick}
        onFoundationClick={handleFoundationClick}
        onWasteDragStart={(e): void => { handleDragStart(e, { type: 'waste' }) }}
        onFoundationDragStart={(index, e): void => { handleDragStart(e, { type: 'foundation', pileIndex: index }) }}
        onFoundationDrop={(index, e): void => { handleDrop(e, { type: 'foundation', pileIndex: index }) }}
        onDragOver={handleDragOver}
        onWasteDoubleClick={(): void => { handleDoubleClick({ type: 'waste' }) }}
      />
      <TableauArea
        tableau={tableau}
        selectedLocation={selectedLocation}
        onCardClick={handleCardClick}
        onEmptyColumnClick={handleEmptyTableauClick}
        onColumnDragStart={(col, cardIdx, e): void => { 
          handleDragStart(e, { type: 'tableau', columnIndex: col, cardIndex: cardIdx })
        }}
        onColumnDrop={(col, e): void => { 
          handleDrop(e, { type: 'tableau', columnIndex: col, cardIndex: 0 }) 
        }}
        onDragOver={handleDragOver}
        onCardDoubleClick={handleDoubleClick}
      />
      <Controls
        stats={stats}
        canUndo={canUndo}
        canRedo={canRedo}
        isWon={isWon}
        onUndo={(): void => { undo() }}
        onRedo={(): void => { redo() }}
        onAutoComplete={(): void => { autoComplete() }}
        onNewGame={(): void => { newGame() }}
      />
    </div>
  )
}
