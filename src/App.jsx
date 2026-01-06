import { useEffect, useMemo, useState } from 'react'
import TeamEditor from './components/TeamEditor.jsx'
import DefensiveSummary from './components/DefensiveSummary.jsx'
import OffensiveCoverage from './components/OffensiveCoverage.jsx'
import Legend from './components/Legend.jsx'
import { preloadAllMoves, areMovesPreloaded, getCachedMovesCount } from './services/pokeapi.js'
import { TYPES } from './data/types.js'
import './App.css'

const EMPTY_TEAM = Array.from({ length: 6 }, () => ({ pokemon: null, moves: [] }))

function App() {
  const [team, setTeam] = useState(() => {
    const stored = localStorage.getItem('team')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        return parsed.map(slot => {
          if (slot.pokemon || !slot.types) {
            return slot 
          }
          return { pokemon: null, moves: [] }
        })
      } catch {
        return EMPTY_TEAM
      }
    }
    return EMPTY_TEAM
  })

  const [loadingMoves, setLoadingMoves] = useState(false)
  const [movesProgress, setMovesProgress] = useState({ current: 0, total: 0 })

  useEffect(() => {
    localStorage.setItem('team', JSON.stringify(team))
  }, [team])

  const filledTeam = useMemo(() => team.map((s) => ({ pokemon: s.pokemon || null, moves: s.moves || [] })), [team])

  const base = import.meta.env.BASE_URL || '/'

  const resetAll = () => setTeam(EMPTY_TEAM)

  const handlePreloadMoves = async () => {
    if (loadingMoves) return
    
    setLoadingMoves(true)
    setMovesProgress({ current: 0, total: 920 })
    
    try {
      await preloadAllMoves((current, total) => {
        setMovesProgress({ current, total })
      })
      alert(`✅ ${getCachedMovesCount()} movimientos cargados en caché`)
    } catch (error) {
      alert(`❌ Error al cargar movimientos: ${error.message}`)
    } finally {
      setLoadingMoves(false)
      setMovesProgress({ current: 0, total: 0 })
    }
  }

  const movesPreloaded = areMovesPreloaded()

  return (
    <div className="layout">
      <header>
        <div className="hero">
          <img className="hero-logo" src={`${base}logo.png`} alt="logo izquierdo" />
          <h1 className="hero-title">Type Coverage</h1>
          <img className="hero-logo" src={`${base}logo.png`} alt="logo derecho" />
        </div>
        <p className="hero-sub">Analiza defensas y cobertura ofensiva de tu equipo (Gen9, inmunidades y STAB).</p>
      </header>

      <main className="content">
        <section>
          <h2>Equipo</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8 }}>
            <button 
              className="ghost-btn" 
              onClick={handlePreloadMoves}
              disabled={loadingMoves}
              title={movesPreloaded ? `${getCachedMovesCount()} movimientos en caché` : 'Cargar todos los movimientos para búsqueda más rápida'}
            >
              {loadingMoves 
                ? `Cargando ${movesProgress.current}/${movesProgress.total}...` 
                : movesPreloaded 
                  ? `✓ Ataques en caché (${getCachedMovesCount()})` 
                  : 'Cachear ataques'}
            </button>
            <button className="ghost-btn" onClick={resetAll}>Resetear todo</button>
          </div>
          <TeamEditor team={filledTeam} onChange={setTeam} />
        </section>

        <section>
          <div className="summary-layout">
            <div className="summaries">
              <DefensiveSummary team={filledTeam} />
              <OffensiveCoverage team={filledTeam} />
            </div>
            <Legend />
          </div>
        </section>
      </main>

      <footer>
        <span>Tipos: {TYPES.length} | Sin habilidades ni items | Datos Gen9</span>
      </footer>
    </div>
  )
}

export default App
