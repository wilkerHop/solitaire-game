/**
 * GameBoard Component - The main game layout connecting View to State.
 */

import type { ReactElement } from 'react'
import { useCallback, useState } from 'react'
import type { CardLocation, Move, Suit } from '../../game'
import {
  useCanRedo, useCanUndo, useFoundations, useGameStore, useIsWon, useStats, useStockAndWaste, useTableau,
} from '../../store'
import { Controls } from './Controls'
import './GameBoard.css'
import { TableauArea } from './TableauArea'
import { TopRow } from './TopRow'

export function GameBoard(): ReactElement {
  const tableau = useTableau()
  const foundations = useFoundations()
  const stockAndWaste = useStockAndWaste()
  const isWon = useIsWon()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()
  const stats = useStats()
  const { moveCard, drawCard, undo, redo, newGame, autoComplete } = useGameStore()
  const [selectedLocation, setSelectedLocation] = useState<CardLocation | null>(null)

  const handleCardClick = useCallback((location: CardLocation): void => {
    if (selectedLocation === null) {
      setSelectedLocation(location)
    } else {
      const move: Move = {
        from: selectedLocation,
        to: location,
        cardCount: selectedLocation.type === 'tableau' 
          ? tableau.columns[selectedLocation.columnIndex].length - selectedLocation.cardIndex
          : 1,
      }
      moveCard(move)
      setSelectedLocation(null)
    }
  }, [selectedLocation, moveCard, tableau.columns])

  const handleStockClick = useCallback((): void => {
    setSelectedLocation(null)
    drawCard(1)
  }, [drawCard])

  const handleWasteClick = useCallback((): void => {
    if (stockAndWaste.waste.length > 0) handleCardClick({ type: 'waste' })
  }, [handleCardClick, stockAndWaste.waste.length])

  const handleFoundationClick = useCallback((suit: Suit): void => {
    handleCardClick({ type: 'foundation', suit })
  }, [handleCardClick])

  const handleEmptyTableauClick = useCallback((columnIndex: number): void => {
    handleCardClick({ type: 'tableau', columnIndex, cardIndex: 0 })
  }, [handleCardClick])

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
      />
      <TableauArea
        tableau={tableau}
        selectedLocation={selectedLocation}
        onCardClick={handleCardClick}
        onEmptyColumnClick={handleEmptyTableauClick}
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
