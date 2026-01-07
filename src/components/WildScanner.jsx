import { useState } from 'react'
import PokemonSearch from './PokemonSearch.jsx'
import { fetchPokemonAnalysis } from '../services/pokeapi.js'

export default function WildScanner() {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSelect = async (pokemonBasic) => {
    if (!pokemonBasic) {
      setAnalysis(null)
      return
    }
    setLoading(true)
    try {
      // Usamos la nueva función del servicio
      const data = await fetchPokemonAnalysis(pokemonBasic.name)
      setAnalysis(data)
    } catch {
      alert("Error analizando el Pokémon")
    } finally {
      setLoading(false)
    }
  }

  // Lógica de colores y texto según BST (Suma de Estadísticas)
  const getVerdict = (bst, canEvolve) => {
    if (bst < 320 && !canEvolve) return { text: "BASURA 🗑️", color: "#ff4d4d" }; // Rojo
    if (bst < 320 && canEvolve) return { text: "DÉBIL (Evoluciona) 🌱", color: "#f9ca24" }; // Amarillo
    if (bst >= 320 && bst < 450) return { text: "DECENTE 😐", color: "#f0932b" }; // Naranja
    if (bst >= 450 && bst < 550) return { text: "MUY BUENO 💪", color: "#6ab04c" }; // Verde
    if (bst >= 550 && bst < 670) return { text: "EXCELENTE 🔥", color: "#2ecc71" }; // Verde fuerte
    return { text: "DIOS / LEGENDARIO 👑", color: "#be2edd" }; // Morado
  }

  return (
    <div className="scanner-container" style={{ padding: '10px' }}>
      <p className="muted small" style={{ marginBottom: '10px' }}>
        Busca un Pokémon salvaje para ver si merece la pena capturarlo para tu equipo.
      </p>

      <div style={{ maxWidth: '100%', marginBottom: '16px' }}>
        <PokemonSearch value={null} onChange={handleSelect} />
      </div>

      {loading && <div style={{textAlign: 'center', padding: '20px'}}>Analizando ... 🧬</div>}

      {analysis && (
        <div className="analysis-card" style={{ 
          background: '#1a202c', 
          padding: '16px', 
          borderRadius: '12px',
          border: '1px solid #4a5568',
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease-in'
        }}>
          {/* Cabecera con Sprite y Nombre */}
          <img src={analysis.sprite} alt={analysis.name} style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
          <h3 style={{ textTransform: 'capitalize', margin: '5px 0 10px 0', fontSize: '1.4rem' }}>
            {analysis.displayName}
          </h3>
          
          {/* Etiqueta de Veredicto */}
          <div style={{ 
            background: getVerdict(analysis.bst, analysis.canEvolve).color, 
            color: '#1a202c',
            fontWeight: '800',
            padding: '6px 16px',
            borderRadius: '20px',
            display: 'inline-block',
            marginBottom: '16px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            fontSize: '0.9rem'
          }}>
            {getVerdict(analysis.bst, analysis.canEvolve).text}
          </div>

          {/* Grid de Datos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', textAlign: 'left' }}>
            
            {/* Caja de Stats */}
            <div style={{ background: '#2d3748', padding: '10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: '#a0aec0' }}>Suma Stats (BST)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e2e8f0' }}>{analysis.bst}</div>
            </div>

            {/* Caja de Evolución */}
            <div style={{ background: '#2d3748', padding: '10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: '#a0aec0' }}>¿Evoluciona?</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: analysis.canEvolve ? '#68d391' : '#fc8181' }}>
                {analysis.canEvolve ? '✅ SÍ' : '❌ NO'}
              </div>
            </div>
          </div>

          {/* Detalles de Evolución */}
          {analysis.canEvolve && (
            <div style={{ marginTop: '12px', background: 'rgba(66, 153, 225, 0.15)', padding: '8px', borderRadius: '6px', fontSize: '0.85rem', color: '#90cdf4' }}>
              🔜 {analysis.evolutionDetails}
            </div>
          )}

          {/* Formas Especiales */}
          {analysis.forms.length > 0 && (
            <div style={{ marginTop: '16px', textAlign: 'left', borderTop: '1px solid #4a5568', paddingTop: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginBottom: '6px' }}>Variedades disponibles:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {analysis.forms.map(f => (
                  <span key={f} style={{ 
                    fontSize: '0.7rem', 
                    padding: '3px 8px', 
                    background: '#4a5568', 
                    color: '#e2e8f0',
                    borderRadius: '4px' 
                  }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}