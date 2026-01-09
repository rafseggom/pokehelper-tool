import { useEffect, useMemo, useState } from 'react'
import TeamEditor from './components/TeamEditor.jsx'
import DefensiveSummary from './components/DefensiveSummary.jsx'
import OffensiveCoverage from './components/OffensiveCoverage.jsx'
import MatchupAnalyzer from './components/MatchupAnalyzer.jsx'
import Legend from './components/Legend.jsx'
import WildScanner from './components/WildScanner.jsx'
import Collapsible from './components/Collapsible.jsx'
import Modal from './components/Modal.jsx'
import { preloadAllMoves, areMovesPreloaded, getCachedMovesCount, searchPokemon, fetchPokemon, fetchMove } from './services/pokeapi.js'
import { parsePokepaste } from './lib/pokepaste.js'
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
  const [showPasteModal, setShowPasteModal] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [importingPaste, setImportingPaste] = useState(false)

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

  const handleImportPokepaste = async () => {
    if (!pasteText.trim()) {
      alert('Por favor, pega un pokepaste válido')
      return
    }

    setImportingPaste(true)
    try {
      const parsedPokemon = parsePokepaste(pasteText)
      
      if (parsedPokemon.length === 0) {
        alert('No se encontraron Pokémon en el texto pegado')
        return
      }

      if (parsedPokemon.length > 6) {
        alert('El pokepaste contiene más de 6 Pokémon. Solo se importarán los primeros 6.')
      }

      const newTeam = []
      
      for (let i = 0; i < Math.min(6, parsedPokemon.length); i++) {
        const { name, moves: moveNames } = parsedPokemon[i]
        
        // Buscar el Pokémon
        const pokemonResults = await searchPokemon(name, 1)
        if (pokemonResults.length === 0) {
          console.warn(`No se encontró el Pokémon: ${name}`)
          newTeam.push({ pokemon: null, moves: [] })
          continue
        }

        // Obtener los datos completos del Pokémon (incluye types, sprite, etc.)
        let pokemonData = null
        try {
          pokemonData = await fetchPokemon(pokemonResults[0].name)
        } catch (error) {
          console.warn(`Error al cargar datos del Pokémon ${name}:`, error)
          newTeam.push({ pokemon: null, moves: [] })
          continue
        }
        
        // Buscar los movimientos
        const movesData = []
        for (const moveName of moveNames) {
          try {
            // Intentar buscar el movimiento directamente
            const normalizedMoveName = moveName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
            const moveData = await fetchMove(normalizedMoveName)
            movesData.push({
              name: moveData.name,
              displayName: moveData.displayName,
              type: moveData.type,
              defensive: moveData.defensive
            })
          } catch {
            console.warn(`No se encontró el movimiento: ${moveName}`)
          }
        }

        newTeam.push({
          pokemon: pokemonData,
          moves: movesData
        })
      }

      // Rellenar con espacios vacíos hasta 6
      while (newTeam.length < 6) {
        newTeam.push({ pokemon: null, moves: [] })
      }

      setTeam(newTeam)
      setShowPasteModal(false)
      setPasteText('')
      alert(`✅ Equipo importado: ${parsedPokemon.slice(0, 6).map(p => p.name).join(', ')}`)
    } catch (error) {
      console.error('Error al importar pokepaste:', error)
      alert(`❌ Error al importar: ${error.message}`)
    } finally {
      setImportingPaste(false)
    }
  }

  return (
    <div className="layout">
      <header>
        <div className="hero">
          <img className="hero-logo" src={`${base}logo.png`} alt="logo izquierdo" />
          <h1 className="hero-title">Poke Helper Tool</h1>
          <img className="hero-logo" src={`${base}logo.png`} alt="logo derecho" />
        </div>
        <p className="hero-sub">Analiza defensas y cobertura ofensiva de tu equipo (Gen9, inmunidades y STAB).</p>
      </header>

      <main className="content">
        <section>
          <h2>Equipo</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
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
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="ghost-btn" onClick={() => setShowPasteModal(true)}>Importar Pokepaste</button>
              <button className="ghost-btn" onClick={resetAll}>Resetear todo</button>
            </div>
          </div>
          <TeamEditor team={filledTeam} onChange={setTeam} />
        </section>

        <section>
          <MatchupAnalyzer team={filledTeam} />
        </section>

        <section style={{ marginTop: '16px', marginBottom: '20px' }}>
          <Collapsible title=" Analizador de captura">
            <WildScanner team={filledTeam} />
          </Collapsible>
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

      <Modal 
        open={showPasteModal} 
        onClose={() => {
          setShowPasteModal(false)
          setPasteText('')
        }} 
        title="Importar Pokepaste"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            Pega aquí tu equipo en formato pokepaste. Solo se importarán los nombres de Pokémon y sus movimientos.
          </p>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Annihilape (M) @ Black Belt&#10;Ability: Storm Drain&#10;- Flying Press&#10;- Lunge&#10;&#10;Tatsugiri (M) @ Focus Sash&#10;- Swift&#10;- Scald&#10;..."
            rows={12}
            style={{
              width: '100%',
              padding: '8px',
              fontFamily: 'monospace',
              fontSize: '13px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              resize: 'vertical'
            }}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button 
              className="ghost-btn" 
              onClick={() => {
                setShowPasteModal(false)
                setPasteText('')
              }}
              disabled={importingPaste}
            >
              Cancelar
            </button>
            <button 
              className="ghost-btn" 
              onClick={handleImportPokepaste}
              disabled={importingPaste || !pasteText.trim()}
              style={{ fontWeight: 'bold' }}
            >
              {importingPaste ? 'Importando...' : 'Importar'}
            </button>
          </div>
        </div>
      </Modal>

      <footer>
        <div className="footer-info">
          <span>Tipos: {TYPES.length} | Sin habilidades ni items | Datos Gen9</span>
        </div>
        <div className="footer-links">
          <a 
            href="https://github.com/rafseggom" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
            title="GitHub de rafseggom"
          >
            <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            <span>rafseggom</span>
          </a>
          <a 
            href="https://github.com/rafseggom/type-covering" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
            title="Repositorio en GitHub"
          >
            <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            <span>Repositorio</span>
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App
