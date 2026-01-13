import { useMemo } from 'react'
import PokemonSearch from './PokemonSearch.jsx'
import MoveSearch from './MoveSearch.jsx'
import AbilitySearch from './AbilitySearch.jsx'
import NatureSearch from './NatureSearch.jsx'
import ItemSearch from './ItemSearch.jsx'

// Mapeo de stats a abreviaturas españolas
const STAT_ABBR = {
  'hp': 'PS',
  'attack': 'Atq',
  'defense': 'Def',
  'special-attack': 'AtE',
  'special-defense': 'DeE',
  'speed': 'Vel'
}

export default function SlotCard({ slot, onChange, index }) {
  const pokemon = slot.pokemon || null
  const pokemonTypes = pokemon?.types || []
  
  const setPokemon = (data) => onChange({ ...slot, pokemon: data })
  const setAbility = (data) => onChange({ ...slot, ability: data })
  const setNature = (data) => onChange({ ...slot, nature: data })
  const setItem = (data) => onChange({ ...slot, item: data })
  
  const updateMove = (idx, next) => {
    const base = Array.isArray(slot.moves) ? [...slot.moves] : []
    while (base.length < 4) base.push(null)
    base[idx] = next
    onChange({ ...slot, moves: base })
  }

  const moves4 = useMemo(() => {
    const base = [...(slot.moves || [])]
    while (base.length < 4) base.push(null)
    return base.slice(0, 4)
  }, [slot.moves])

  // Calcular las 2-3 stats base más altas
  const topStats = useMemo(() => {
    if (!pokemon || !pokemon.baseStats || !Array.isArray(pokemon.baseStats)) {
      return null
    }

    const sorted = [...pokemon.baseStats]
      .sort((a, b) => b.value - a.value)

    const first = sorted[0]
    const second = sorted[1]
    const third = sorted[2]

    // Si las dos primeras están empatadas, mostrar ambas + la tercera
    if (first && second && first.value === second.value) {
      return {
        display: `${STAT_ABBR[first.name] || first.name}=${STAT_ABBR[second.name] || second.name}${third ? ` (${STAT_ABBR[third.name] || third.name})` : ''}`,
        isTied: true
      }
    }

    // Si no hay empate, mostrar las dos más altas
    if (first && second) {
      return {
        display: `${STAT_ABBR[first.name] || first.name}, ${STAT_ABBR[second.name] || second.name}`,
        isTied: false
      }
    }

    return null
  }, [pokemon])

  const handleReset = () => {
    onChange({ pokemon: null, moves: [], ability: null, nature: null, item: null })
  }

  return (
    <div className="slot-card">
      <div className="slot-header">
        <div className="pill">Pokémon {index + 1}</div>
        {pokemon && <button className="ghost-btn-small" onClick={handleReset}>Resetear</button>}
      </div>

      <PokemonSearch value={pokemon} onChange={setPokemon} />

      {pokemon && (
        <>
          <div className="slot-card__details">
            <AbilitySearch value={slot.ability} onChange={setAbility} />
            <NatureSearch value={slot.nature} onChange={setNature} />
            <ItemSearch value={slot.item} onChange={setItem} />
            
            {topStats && (
              <div className="pokemon-top-stats">
                <span className="top-stats-label">Stats destacadas:</span>
                <strong>{topStats.display}</strong>
              </div>
            )}
          </div>

          <div className="slot-card__moves">
            {moves4.map((mv, i) => (
              <div key={i} className="move-row">
                <span className="move-label">Ataque {i + 1}:</span>
                <MoveSearch value={mv} onChange={(newMv) => updateMove(i, newMv)} pokemonTypes={pokemonTypes} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
