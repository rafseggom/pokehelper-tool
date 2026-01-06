import { useMemo } from 'react'
import PokemonSearch from './PokemonSearch.jsx'
import MoveSearch from './MoveSearch.jsx'

export default function SlotCard({ slot, onChange, index }) {
  const pokemon = slot.pokemon || null
  const pokemonTypes = pokemon?.types || []
  
  const setPokemon = (data) => onChange({ ...slot, pokemon: data })
  
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

  const handleReset = () => {
    onChange({ pokemon: null, moves: [] })
  }

  return (
    <div className="slot-card">
      <div className="slot-header">
        <div className="pill">Pokémon {index + 1}</div>
        {pokemon && <button className="ghost-btn-small" onClick={handleReset}>Resetear</button>}
      </div>

      <PokemonSearch value={pokemon} onChange={setPokemon} />

      {pokemon && (
        <div className="slot-card__moves">
          {moves4.map((mv, i) => (
            <div key={i} className="move-row">
              <span className="move-label">Ataque {i + 1}:</span>
              <MoveSearch value={mv} onChange={(newMv) => updateMove(i, newMv)} pokemonTypes={pokemonTypes} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
