/**
 * GameBoard Component - The main game layout connecting View to State.
 * 
 * This component orchestrates the game UI by:
 * 1. Consuming state from the Zustand store
 * 2. Dispatching actions based on user interactions
 * 3. Rendering dumb components with the appropriate props
 */

import type { ReactElement } from 'react'
import { useCallback, useState } from 'react'
import type { CardLocation, Move, Suit } from '../../game'
import {
  useCanRedo,
  useCanUndo,
  useFoundations,
  useGameStore,
  useIsWon,
  useStats,
  useStockAndWaste,
  useTableau,
} from '../../store'
import { Card } from '../Card'
import { Pile } from '../Pile'
import './GameBoard.css'

// Foundation suits in display order
const FOUNDATION_SUITS: readonly Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'] as const

export function GameBoard(): ReactElement {
  const tableau = useTableau()
  const foundations = useFoundations()
  const stockAndWaste = useStockAndWaste()
  const isWon = useIsWon()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()
  const stats = useStats()
  
  const { moveCard, drawCard, undo, redo, newGame, autoComplete } = useGameStore()
  
  // Selection state for two-click move
  const [selectedLocation, setSelectedLocation] = useState<CardLocation | null>(null)
  
  // Handle card selection and moves
  const handleCardClick = useCallback((location: CardLocation): void => {
    if (selectedLocation === null) {
      // First click: select this card
      setSelectedLocation(location)
    } else {
      // Second click: attempt to move
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
  
  // Handle stock click (draw card)
  const handleStockClick = useCallback((): void => {
    setSelectedLocation(null)
    drawCard(1)
  }, [drawCard])
  
  // Handle waste click (select top card)
  const handleWasteClick = useCallback((): void => {
    if (stockAndWaste.waste.length > 0) {
      handleCardClick({ type: 'waste' })
    }
  }, [handleCardClick, stockAndWaste.waste.length])
  
  // Handle foundation click
  const handleFoundationClick = useCallback((suit: Suit): void => {
    handleCardClick({ type: 'foundation', suit })
  }, [handleCardClick])
  
  // Handle empty tableau column click
  const handleEmptyTableauClick = useCallback((columnIndex: number): void => {
    handleCardClick({ type: 'tableau', columnIndex, cardIndex: 0 })
  }, [handleCardClick])
  
  // Clear selection on Escape
  const handleKeyDown = useCallback((e: React.KeyboardEvent): void => {
    if (e.key === 'Escape') {
      setSelectedLocation(null)
    }
  }, [])
  
  return (
    <div className="game-board" onKeyDown={handleKeyDown} tabIndex={-1}>
      {/* Top row: Stock, Waste, and Foundations */}
      <div className="game-top-row">
        <div className="stock-waste-area">
          {/* Stock pile */}
          <div 
            className="stock-pile"
            onClick={handleStockClick}
            role="button"
            tabIndex={0}
            aria-label="Stock pile - click to draw"
          >
            {stockAndWaste.stock.length > 0 ? (
              <Card 
                card={{ suit: 'spades', rank: 1, faceUp: false }} 
                onClick={handleStockClick}
              />
            ) : (
              <div className="pile-placeholder placeholder-stock">
                <span className="placeholder-icon">⟳</span>
              </div>
            )}
            <span className="pile-count">{stockAndWaste.stock.length}</span>
          </div>
          
          {/* Waste pile */}
          <div 
            className="waste-pile"
            onClick={handleWasteClick}
            role="button"
            tabIndex={0}
            aria-label="Waste pile"
          >
            {stockAndWaste.waste.length > 0 ? (
              <Card
                card={stockAndWaste.waste[stockAndWaste.waste.length - 1]}
                onClick={handleWasteClick}
                isSelected={selectedLocation?.type === 'waste'}
              />
            ) : (
              <div className="pile-placeholder">
                <span className="placeholder-icon"></span>
              </div>
            )}
          </div>
        </div>
        
        {/* Spacer */}
        <div className="top-row-spacer" />
        
        {/* Foundations */}
        <div className="foundations-area">
          {FOUNDATION_SUITS.map((suit) => (
            <div
              key={suit}
              className={`foundation-pile foundation-${suit}`}
              onClick={(): void => { handleFoundationClick(suit) }}
              role="button"
              tabIndex={0}
              aria-label={`${suit} foundation`}
            >
              <Pile
                cards={foundations[suit]}
                layout="single"
                emptyPlaceholder="foundation"
                onCardClick={(): void => { handleFoundationClick(suit) }}
                label={`${suit} foundation`}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Tableau */}
      <div className="tableau-area">
        {tableau.columns.map((column, colIndex) => (
          <div 
            key={colIndex} 
            className="tableau-column"
            onClick={column.length === 0 
              ? (): void => { handleEmptyTableauClick(colIndex) }
              : undefined
            }
          >
            <Pile
              cards={column}
              layout="stacked"
              emptyPlaceholder="tableau"
              onCardClick={(_, cardIndex): void => {
                handleCardClick({ 
                  type: 'tableau', 
                  columnIndex: colIndex, 
                  cardIndex 
                })
              }}
              selectedCardIndex={
                selectedLocation?.type === 'tableau' && 
                selectedLocation.columnIndex === colIndex
                  ? selectedLocation.cardIndex
                  : undefined
              }
              label={`Tableau column ${String(colIndex + 1)}`}
            />
          </div>
        ))}
      </div>
      
      {/* Game Controls */}
      <div className="game-controls">
        <button 
          className="control-btn" 
          onClick={(): void => { undo() }}
          disabled={!canUndo}
          aria-label="Undo"
        >
          ↶ Undo
        </button>
        <button 
          className="control-btn" 
          onClick={(): void => { redo() }}
          disabled={!canRedo}
          aria-label="Redo"
        >
          ↷ Redo
        </button>
        <button 
          className="control-btn" 
          onClick={(): void => { autoComplete() }}
          aria-label="Auto Complete"
        >
          ⚡ Auto
        </button>
        <button 
          className="control-btn btn-new-game" 
          onClick={(): void => { newGame() }}
          aria-label="New Game"
        >
          🃏 New Game
        </button>
      </div>
      
      {/* Stats Bar */}
      <div className="stats-bar">
        <span className="stat">Moves: {stats.moves}</span>
        <span className="stat">Score: {stats.score}</span>
      </div>
      
      {/* Win Modal */}
      {isWon && (
        <div className="win-modal-overlay">
          <div className="win-modal">
            <h2>🎉 Congratulations!</h2>
            <p>You won in {stats.moves} moves!</p>
            <button 
              className="control-btn btn-new-game" 
              onClick={(): void => { newGame() }}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
