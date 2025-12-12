import { useCallback } from 'react'
import type { CardLocation, GameState, Move } from '../../game'
import { findBestMove } from '../../game'

export function useGameHandlers(
  gameState: GameState,
  moveCard: (move: Move) => void,
  drawCard: (count: number) => void,
  selectedLocation: CardLocation | null,
  setSelectedLocation: (loc: CardLocation | null) => void,
  stockAndWaste: GameState['stockAndWaste'],
  tableau: GameState['tableau']
): {
    handleDoubleClick: (location: CardLocation) => void
    handleCardClick: (location: CardLocation) => void
    handleStockClick: () => void
    handleWasteClick: () => void
    handleFoundationClick: (pileIndex: number) => void
    handleEmptyTableauClick: (columnIndex: number) => void
} {

  const handleDoubleClick = useCallback((location: CardLocation): void => {
    const bestMove = findBestMove(gameState, location)
    if (bestMove) {
      moveCard(bestMove)
      setSelectedLocation(null)
    }
  }, [gameState, moveCard, setSelectedLocation])

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
  }, [selectedLocation, moveCard, tableau.columns, setSelectedLocation])

  const handleStockClick = useCallback((): void => {
    setSelectedLocation(null)
    drawCard(1)
  }, [drawCard, setSelectedLocation])

  const handleWasteClick = useCallback((): void => {
    if (stockAndWaste.waste.length > 0) handleCardClick({ type: 'waste' })
  }, [handleCardClick, stockAndWaste.waste.length])

  const handleFoundationClick = useCallback((pileIndex: number): void => {
    handleCardClick({ type: 'foundation', pileIndex })
  }, [handleCardClick])

  const handleEmptyTableauClick = useCallback((columnIndex: number): void => {
    handleCardClick({ type: 'tableau', columnIndex, cardIndex: 0 })
  }, [handleCardClick])

  return {
    handleDoubleClick,
    handleCardClick,
    handleStockClick,
    handleWasteClick,
    handleFoundationClick,
    handleEmptyTableauClick
  }
}
