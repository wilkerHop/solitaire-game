/**
 * GameBoard Component - The main game layout connecting View to State.
 */

import type { ReactElement } from 'react'
import { useCallback, useState } from 'react'
import type { CardLocation, Move } from '../../game'
import { findBestMove } from '../../game'
import {
    useCanRedo, useCanUndo, useFoundations, useGameState,
    useGameStore, useIsWon, useStats, useStockAndWaste, useTableau
} from '../../store'
import { Controls } from './Controls'
import './GameBoard.css'
import { TableauArea } from './TableauArea'
import { TopRow } from './TopRow'

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

  const handleDoubleClick = useCallback((location: CardLocation): void => {
    const bestMove = findBestMove(gameState, location)
    if (bestMove) {
      moveCard(bestMove)
      setSelectedLocation(null)
    }
  }, [gameState, moveCard])

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

  const handleFoundationClick = useCallback((pileIndex: number): void => {
    handleCardClick({ type: 'foundation', pileIndex })
  }, [handleCardClick])

  const handleEmptyTableauClick = useCallback((columnIndex: number): void => {
    handleCardClick({ type: 'tableau', columnIndex, cardIndex: 0 })
  }, [handleCardClick])

  const handleDragStart = useCallback((e: React.DragEvent, location: CardLocation): void => {
    e.dataTransfer.setData('application/json', JSON.stringify(location))
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent): void => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, targetLocation: CardLocation): void => {
    e.preventDefault()
    try {
      const sourceData = e.dataTransfer.getData('application/json')
      if (!sourceData) return
      
      const sourceLocation = JSON.parse(sourceData) as CardLocation
      
      let cardCount = 1
      if (sourceLocation.type === 'tableau') {
        const column = tableau.columns[sourceLocation.columnIndex]
        cardCount = column.length - sourceLocation.cardIndex
      }
      
      const move: Move = {
        from: sourceLocation,
        to: targetLocation,
        cardCount,
      }
      moveCard(move)
      setSelectedLocation(null)
    } catch (err) {
      console.error('Failed to parse dropped data', err)
    }
  }, [moveCard, tableau.columns])

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
