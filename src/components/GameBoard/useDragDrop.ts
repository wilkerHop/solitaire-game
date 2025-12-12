import { useCallback } from 'react'
import type { CardLocation, GameState, Move } from '../../game'

export function useDragDrop(
  moveCard: (move: Move) => void, 
  tableauColumns: GameState['tableau']['columns'],
  setSelectedLocation: (loc: CardLocation | null) => void
): {
  handleDragStart: (e: React.DragEvent, location: CardLocation) => void
  handleDragOver: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent, targetLocation: CardLocation) => void
} {
  
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
      
      const cardCount = sourceLocation.type === 'tableau'
        ? tableauColumns[sourceLocation.columnIndex].length - sourceLocation.cardIndex
        : 1
      
      const move: Move = {
        from: sourceLocation,
        to: targetLocation,
        cardCount,
      }
      moveCard(move)
      setSelectedLocation(null)
    } catch (err) {
       // Ignore invalid drag data
       void err
    }
  }, [moveCard, tableauColumns, setSelectedLocation])

  return { handleDragStart, handleDragOver, handleDrop }
}
