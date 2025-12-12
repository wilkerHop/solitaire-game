/**
 * Game controls and stats component
 */

import type { ReactElement } from 'react'
import type { GameStats } from '../../game'

interface ControlsProps {
  readonly stats: GameStats
  readonly canUndo: boolean
  readonly canRedo: boolean
  readonly isWon: boolean
  readonly onUndo: () => void
  readonly onRedo: () => void
  readonly onAutoComplete: () => void
  readonly onNewGame: () => void
}

export function Controls({
  stats, canUndo, canRedo, isWon, onUndo, onRedo, onAutoComplete, onNewGame
}: ControlsProps): ReactElement {
  return (
    <>
      <div className="game-controls">
        <button className="control-btn" onClick={onUndo} disabled={!canUndo} aria-label="Undo">↶ Undo</button>
        <button className="control-btn" onClick={onRedo} disabled={!canRedo} aria-label="Redo">↷ Redo</button>
        <button className="control-btn" onClick={onAutoComplete} aria-label="Auto Complete">⚡ Auto</button>
        <button className="control-btn btn-new-game" onClick={onNewGame} aria-label="New Game">🃏 New Game</button>
      </div>
      <div className="stats-bar">
        <span className="stat">Moves: {stats.moves}</span>
        <span className="stat">Score: {stats.score}</span>
      </div>
      {isWon && (
        <div className="win-modal-overlay">
          <div className="win-modal">
            <h2>🎉 Congratulations!</h2>
            <p>You won in {stats.moves} moves!</p>
            <button className="control-btn btn-new-game" onClick={onNewGame}>Play Again</button>
          </div>
        </div>
      )}
    </>
  )
}
