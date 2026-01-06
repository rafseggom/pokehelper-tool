import { useEffect, useMemo, useState } from 'react'
import TeamEditor from './components/TeamEditor.jsx'
import DefensiveSummary from './components/DefensiveSummary.jsx'
import OffensiveCoverage from './components/OffensiveCoverage.jsx'
import Legend from './components/Legend.jsx'
import { TYPES } from './data/types.js'
import './App.css'

const EMPTY_TEAM = Array.from({ length: 6 }, () => ({ types: [], moves: [] }))

function App() {
  const [team, setTeam] = useState(() => {
    const stored = localStorage.getItem('team')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        return EMPTY_TEAM
      }
    }
    return EMPTY_TEAM
  })

  useEffect(() => {
    localStorage.setItem('team', JSON.stringify(team))
  }, [team])

  const filledTeam = useMemo(() => team.map((s) => ({ types: s.types || [], moves: s.moves || [] })), [team])

  const base = import.meta.env.BASE_URL || '/'

  const resetAll = () => setTeam(EMPTY_TEAM)

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
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
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
