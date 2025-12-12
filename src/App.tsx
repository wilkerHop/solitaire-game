import type { ReactElement } from 'react'
import './App.css'
import { GameBoard } from './components'

function App(): ReactElement {
  return (
    <div className="app">
      <header className="app-header">
        <h1>♠️ Solitaire</h1>
      </header>
      <main className="app-main">
        <GameBoard />
      </main>
    </div>
  )
}

export default App
