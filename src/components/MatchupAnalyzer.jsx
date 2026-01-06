import { useState } from 'react'
import PokemonSearch from './PokemonSearch.jsx'
import TypeIcon from './TypeIcon.jsx'
import { ES_LABELS } from '../data/types.js'
import { suggestCounters, formatDefensiveRating } from '../lib/counters.js'
import { formatMultiplier } from '../lib/coverage.js'

export default function MatchupAnalyzer({ team }) {
  const [doubleMode, setDoubleMode] = useState(false)
  const [enemy, setEnemy] = useState(null)
  const [enemy2, setEnemy2] = useState(null)

  const suggestions = enemy ? suggestCounters(team, enemy) : { defensive: [], offensive: [] }
  const suggestions2 = enemy2 ? suggestCounters(team, enemy2) : { defensive: [], offensive: [] }

  return (
    <div className="matchup-analyzer">
      <div className="matchup-header">
        <div>
          <h2>Análisis de Enfrentamiento</h2>
          <p className="section-desc">Busca un Pokémon rival para ver con cuál de tu equipo enfrentarte</p>
        </div>
        <label className="double-mode-toggle">
          <input 
            type="checkbox" 
            checked={doubleMode} 
            onChange={(e) => setDoubleMode(e.target.checked)}
          />
          <span>Combate Doble</span>
        </label>
      </div>
      
      <div className={`enemy-selectors ${doubleMode ? 'double' : 'single'}`}>
        <div className="enemy-selector">
          <label className="section-label">Pokémon Rival {doubleMode ? '1' : ''}:</label>
          <PokemonSearch value={enemy} onChange={setEnemy} />
        </div>
        {doubleMode && (
          <div className="enemy-selector">
            <label className="section-label">Pokémon Rival 2:</label>
            <PokemonSearch value={enemy2} onChange={setEnemy2} />
          </div>
        )}
      </div>

      {(enemy || enemy2) && (
        <div className={`matchup-results-container ${doubleMode ? 'double' : 'single'}`}>
          {enemy && (
            <div className="matchup-column">
              {doubleMode && enemy && (
                <h3 className="enemy-header">
                  <img src={enemy.sprite} alt={enemy.displayName} className="enemy-sprite-small" />
                  {enemy.displayName}
                </h3>
              )}
              <div className="matchup-results">
                {/* Mejores opciones defensivas */}
                <div className="matchup-section">
                  <h3 className="matchup-title">🛡️ Mejor Resistencia</h3>
                  <p className="matchup-subtitle">Pokémon que aguanta mejor sus ataques</p>
                  {suggestions.defensive.length === 0 ? (
                    <p className="no-results">No hay Pokémon en el equipo</p>
                  ) : (
                    <div className="matchup-grid">
                      {suggestions.defensive.slice(0, 3).map((item, idx) => (
                        <div key={item.slotIndex} className={`matchup-card ${idx === 0 ? 'best' : ''}`}>
                          {idx === 0 && <div className="best-badge">⭐ Mejor opción</div>}
                          <div className="matchup-card-header">
                            <img 
                              src={item.pokemon.sprite} 
                              alt={item.pokemon.displayName}
                              className="matchup-sprite"
                            />
                            <div>
                              <strong className="matchup-pokemon-name">{item.pokemon.displayName}</strong>
                              <div className="type-badges">
                                {item.pokemon.types.map(t => (
                                  <div key={t} className="type-badge-tiny">
                                    <TypeIcon type={t} size={14} />
                                    <span>{ES_LABELS[t]}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="matchup-rating">
                            <span className="rating-label">Daño recibido → </span>
                            <span className={`rating-value defensive-${item.score <= 0.5 ? 'good' : item.score === 1 ? 'neutral' : 'bad'}`}>
                              {formatDefensiveRating(item.avgMultiplier)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mejores opciones ofensivas */}
                <div className="matchup-section">
                  <h3 className="matchup-title">⚔️ Mejor Ataque</h3>
                  <p className="matchup-subtitle">Pokémon que hace más daño</p>
                  {suggestions.offensive.length === 0 ? (
                    <p className="no-results">No hay Pokémon con ataques ofensivos</p>
                  ) : (
                    <div className="matchup-grid">
                      {suggestions.offensive.slice(0, 3).map((item, idx) => (
                        <div key={item.slotIndex} className={`matchup-card ${idx === 0 ? 'best' : ''}`}>
                          {idx === 0 && <div className="best-badge">⭐ Mejor opción</div>}
                          <div className="matchup-card-header">
                            <img 
                              src={item.pokemon.sprite} 
                              alt={item.pokemon.displayName}
                              className="matchup-sprite"
                            />
                            <div>
                              <strong className="matchup-pokemon-name">{item.pokemon.displayName}</strong>
                              <div className="type-badges">
                                {item.pokemon.types.map(t => (
                                  <div key={t} className="type-badge-tiny">
                                    <TypeIcon type={t} size={14} />
                                    <span>{ES_LABELS[t]}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="matchup-move">
                            <div className="matchup-move-info">
                              <TypeIcon type={item.bestMove.type} size={18} />
                              <span className="move-name">{item.bestMove.displayName}</span>
                              {item.bestMove.stab && <span className="stab-badge-small">STAB</span>}
                            </div>
                            <span className={`effectiveness effectiveness-${item.bestMultiplier >= 2 ? 'super' : item.bestMultiplier <= 0.5 ? 'weak' : 'neutral'}`}>
                              {formatMultiplier(item.bestMultiplier)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {doubleMode && enemy2 && (
            <div className="matchup-column">
              <h3 className="enemy-header">
                <img src={enemy2.sprite} alt={enemy2.displayName} className="enemy-sprite-small" />
                {enemy2.displayName}
              </h3>
              <div className="matchup-results">
                {/* Mejores opciones defensivas */}
                <div className="matchup-section">
                  <h3 className="matchup-title">🛡️ Mejor Resistencia</h3>
                  <p className="matchup-subtitle">Pokémon que aguantan mejor sus ataques</p>
                  {suggestions2.defensive.length === 0 ? (
                    <p className="no-results">No hay Pokémon en el equipo</p>
                  ) : (
                    <div className="matchup-grid">
                      {suggestions2.defensive.slice(0, 3).map((item, idx) => (
                        <div key={item.slotIndex} className={`matchup-card ${idx === 0 ? 'best' : ''}`}>
                          {idx === 0 && <div className="best-badge">⭐ Mejor opción</div>}
                          <div className="matchup-card-header">
                            <img 
                              src={item.pokemon.sprite} 
                              alt={item.pokemon.displayName}
                              className="matchup-sprite"
                            />
                            <div>
                              <strong className="matchup-pokemon-name">{item.pokemon.displayName}</strong>
                              <div className="type-badges">
                                {item.pokemon.types.map(t => (
                                  <div key={t} className="type-badge-tiny">
                                    <TypeIcon type={t} size={14} />
                                    <span>{ES_LABELS[t]}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="matchup-rating">
                            <span className="rating-label">Daño recibido → </span>
                            <span className={`rating-value defensive-${item.score <= 0.5 ? 'good' : item.score === 1 ? 'neutral' : 'bad'}`}>
                              {formatDefensiveRating(item.avgMultiplier)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mejores opciones ofensivas */}
                <div className="matchup-section">
                  <h3 className="matchup-title">⚔️ Mejor Ataque</h3>
                  <p className="matchup-subtitle">Pokémon que hacen más daño</p>
                  {suggestions2.offensive.length === 0 ? (
                    <p className="no-results">No hay Pokémon con ataques ofensivos</p>
                  ) : (
                    <div className="matchup-grid">
                      {suggestions2.offensive.slice(0, 3).map((item, idx) => (
                        <div key={item.slotIndex} className={`matchup-card ${idx === 0 ? 'best' : ''}`}>
                          {idx === 0 && <div className="best-badge">⭐ Mejor opción</div>}
                          <div className="matchup-card-header">
                            <img 
                              src={item.pokemon.sprite} 
                              alt={item.pokemon.displayName}
                              className="matchup-sprite"
                            />
                            <div>
                              <strong className="matchup-pokemon-name">{item.pokemon.displayName}</strong>
                              <div className="type-badges">
                                {item.pokemon.types.map(t => (
                                  <div key={t} className="type-badge-tiny">
                                    <TypeIcon type={t} size={14} />
                                    <span>{ES_LABELS[t]}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="matchup-move">
                            <div className="matchup-move-info">
                              <TypeIcon type={item.bestMove.type} size={18} />
                              <span className="move-name">{item.bestMove.displayName}</span>
                              {item.bestMove.stab && <span className="stab-badge-small">STAB</span>}
                            </div>
                            <span className={`effectiveness effectiveness-${item.bestMultiplier >= 2 ? 'super' : item.bestMultiplier <= 0.5 ? 'weak' : 'neutral'}`}>
                              {formatMultiplier(item.bestMultiplier)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
