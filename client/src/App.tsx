import { useState } from 'react'
import LunchForm from './components/LunchForm'
import PantryPage from './components/PantryPage'
import './App.css'

type Page = 'lunches' | 'pantry'

function App() {
  const [page, setPage] = useState<Page>('lunches')

  return (
    <>
      <nav className="app-nav">
        <button
          type="button"
          className={`app-nav-button${page === 'lunches' ? ' app-nav-button--active' : ''}`}
          onClick={() => setPage('lunches')}
        >
          🍱 Lunch Planner
        </button>
        <button
          type="button"
          className={`app-nav-button${page === 'pantry' ? ' app-nav-button--active' : ''}`}
          onClick={() => setPage('pantry')}
        >
          🥫 Pantry
        </button>
      </nav>
      {page === 'lunches' ? <LunchForm /> : <PantryPage />}
    </>
  )
}

export default App
