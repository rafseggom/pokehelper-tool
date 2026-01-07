import { useState } from 'react'
import PokemonSearch from './PokemonSearch.jsx'
import TypeIcon from './TypeIcon.jsx'
import { ES_LABELS } from '../data/types.js'
import { fetchPokemonAnalysis } from '../services/pokeapi.js'

export default function WildScanner({ team }) {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSelect = async (pokemonBasic) => {
    if (!pokemonBasic) {
      setAnalysis(null)
      return
    }
    setLoading(true)
    try {
      const data = await fetchPokemonAnalysis(pokemonBasic.name, team)
      setAnalysis(data)
    } catch {
      alert('Error analizando el Pokémon')
    } finally {
      setLoading(false)
    }
  }

  const renderLegend = () => (
    <div style={{ marginTop: 16, padding: '12px', background: '#111827', borderRadius: 12, border: '1px solid #1f2937' }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: '#e5e7eb' }}>Leyenda</div>
      <div style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.4 }}>
        <div><strong>Captura obligada</strong>: techo 600+ BST, rinde en cualquier equipo.</div>
        <div><strong>Muy recomendable</strong>: 520-599 BST finales, buena apuesta a futuro.</div>
        <div><strong>Situacional</strong>: potencial correcto, útil si cubre resistencias o roles concretos.</div>
        <div><strong>Poca prioridad</strong>: techo bajo, solo si necesitas su tipo o habilidad.</div>
      </div>
    </div>
  )

  const renderTypes = (types) => (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6, justifyContent: 'center' }}>
      {types.map((t) => (
        <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', padding: '4px 8px', background: '#374151', color: '#e5e7eb', borderRadius: 6 }}>
          <TypeIcon type={t} size={18} title={ES_LABELS[t] || t} />
          {ES_LABELS[t] || t}
        </span>
      ))}
    </div>
  )

  const renderForms = (forms) => {
    const uniqueForms = forms?.length
      ? Array.from(new Map(forms.map((f) => [f.name, f])).values())
      : []
    if (!uniqueForms.length) return null
    return (
      <div style={{ marginTop: 12, textAlign: 'left', borderTop: '1px solid #4a5568', paddingTop: 10 }}>
        <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginBottom: 8 }}>Formas especiales detectadas</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          {uniqueForms.map((f) => (
            <div key={f.name} style={{ background: '#2d3748', padding: 10, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ color: '#cbd5e1', fontWeight: 700, marginBottom: 4 }}>{f.displayName}</div>
              <div style={{ color: '#a0aec0', fontSize: '0.8rem', marginBottom: 4 }}>{f.category}</div>
              <img src={f.sprite} alt={f.displayName} style={{ width: 64, height: 64, objectFit: 'contain', margin: '0 auto' }} />
              {renderTypes(f.types)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderEvolutionPaths = (paths) => {
    if (!paths?.length) return null
    return (
      <div style={{ marginTop: 12, textAlign: 'left' }}>
        <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginBottom: 6 }}>Cadenas evolutivas</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {paths.map((p) => (
            <span key={p} style={{ color: '#e5e7eb', fontSize: '0.9rem' }}>{p}</span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="scanner-container" style={{ padding: '10px' }}>
      <p className="muted small" style={{ marginBottom: '10px' }}>
        Busca un Pokémon salvaje y evalúa rápidamente si merece capturarlo según potencial, stats y cadena evolutiva.
      </p>

      <div style={{ maxWidth: '100%', marginBottom: '16px' }}>
        <PokemonSearch value={null} onChange={handleSelect} />
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '20px' }}>Analizando...</div>}

      {analysis && (
        <div
          className="analysis-card"
          style={{
            background: '#1a202c',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #4a5568',
            textAlign: 'center',
            animation: 'fadeIn 0.3s ease-in'
          }}
        >
          <img src={analysis.sprite} alt={analysis.name} style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
          <h3 style={{ textTransform: 'capitalize', margin: '5px 0 10px 0', fontSize: '1.4rem' }}>
            {analysis.displayName}
          </h3>

          <div
            style={{
              background: analysis.captureVerdict.color,
              color: '#0f172a',
              fontWeight: 800,
              padding: '6px 16px',
              borderRadius: '20px',
              display: 'inline-block',
              marginBottom: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
              fontSize: '0.95rem'
            }}
          >
            {analysis.captureVerdict.label}
          </div>
          <div style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: 12 }}>
            {analysis.captureVerdict.explanation}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', textAlign: 'left' }}>
            <div style={{ background: '#2d3748', padding: '10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>BST actual</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e2e8f0' }}>{analysis.bst}</div>
              <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Media {analysis.avgStat} por stat</div>
            </div>

            <div style={{ background: '#2d3748', padding: '10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>Valoración de stats</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: analysis.statVerdict.color }}>
                {analysis.statVerdict.label}
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{analysis.statVerdict.explanation}</div>
            </div>

            <div style={{ background: '#2d3748', padding: '10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>Potencial final</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#e2e8f0' }}>
                {analysis.bestEvolution.displayName} · {analysis.bestEvolution.bst} BST
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                Media {analysis.bestEvolution.avgStat} por stat en su mejor etapa.
              </div>
            </div>

            <div style={{ background: '#2d3748', padding: '10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>¿Evoluciona?</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: analysis.canEvolve ? '#68d391' : '#e2e8f0' }}>
                {analysis.canEvolve ? analysis.evolutionDetails : 'No evoluciona más'}
              </div>
            </div>

            <div style={{ background: '#2d3748', padding: '10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>Stats fuertes</div>
              {analysis.topStats.slice(0, 2).map((st) => (
                <div key={st.label} style={{ marginBottom: 4 }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#e2e8f0' }}>
                    {st.label}: {st.value}
                  </div>
                  
                </div>
              ))}
            </div>

            <div style={{ background: '#2d3748', padding: '10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginBottom: 8 }}>Cubre huecos defensivos</div>
              {analysis.coverageAdvice.uncovered.length > 0 ? (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {analysis.coverageAdvice.covers.map((t) => {
                    const isNewGap = analysis.coverageAdvice.uncovered.includes(t)
                    return (
                      <div
                        key={t}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          padding: '6px 10px',
                          borderRadius: 8,
                          background: isNewGap ? '#1f2937' : '#374151',
                          border: isNewGap ? '3px solid #fbbf24' : 'none',
                          boxShadow: isNewGap ? '0 0 12px rgba(251, 191, 36, 0.5)' : 'none'
                        }}
                      >
                        <TypeIcon type={t} size={20} title={ES_LABELS[t] || t} />
                        <span style={{ fontSize: '0.75rem', color: isNewGap ? '#fbbf24' : '#e5e7eb' }}>
                          {ES_LABELS[t] || t}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>
                  {analysis.coverageAdvice.message}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 16, textAlign: 'left' }}>
            <div style={{ fontSize: '0.9rem', color: '#e5e7eb', marginBottom: 8 }}>Evoluciones y tipos</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
              {analysis.evolutionLine.map((evo) => (
                <div key={evo.name} style={{ background: '#2d3748', padding: 10, borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ color: '#cbd5e1', fontWeight: 700, marginBottom: 4 }}>{evo.displayName}</div>
                  {evo.evolutionDetails?.length > 0 && (
                    <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginBottom: 6, paddingBottom: 6, borderBottom: '1px solid #4a5568' }}>
                      {evo.evolutionDetails.map((detail, idx) => (
                        <div key={idx}>{detail}</div>
                      ))}
                    </div>
                  )}
                  <div style={{ color: '#a0aec0', fontSize: '0.8rem', marginBottom: 4 }}>Etapa {evo.stage}</div>
                  <img src={evo.sprite} alt={evo.displayName} style={{ width: 72, height: 72, objectFit: 'contain', margin: '0 auto' }} />
                  <div style={{ color: '#e2e8f0', fontSize: '0.85rem', marginTop: 4 }}>{evo.bst} BST</div>
                  {renderTypes(evo.types || [])}
                </div>
              ))}
            </div>
          </div>

          {renderEvolutionPaths(analysis.evolutionPaths)}
          {renderForms(analysis.formsDetailed)}
          {renderLegend()}
        </div>
      )}
    </div>
  )
}