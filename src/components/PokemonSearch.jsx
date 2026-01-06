import { useState, useEffect, useRef } from 'react'
import { searchPokemon, fetchPokemon } from '../services/pokeapi.js'
import TypeIcon from './TypeIcon.jsx'
import { ES_LABELS } from '../data/types.js'

export default function PokemonSearch({ value, onChange }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        inputRef.current && !inputRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      const results = await searchPokemon(query, 10)
      setSuggestions(results)
      setShowDropdown(results.length > 0)
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = async (pokemonName) => {
    setLoading(true)
    setShowDropdown(false)
    setQuery('')
    
    try {
      const data = await fetchPokemon(pokemonName)
      onChange(data)
    } catch (error) {
      alert(`Error al cargar ${pokemonName}: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    onChange(null)
    setQuery('')
    setSuggestions([])
  }

  if (value) {
    return (
      <div className="pokemon-selected">
        <img className="pokemon-sprite" src={value.sprite} alt={value.displayName} />
        <div className="pokemon-info">
          <strong>{value.displayName}</strong>
          <div className="type-badges">
            {value.types.map(t => (
              <div key={t} className="type-badge-small">
                <TypeIcon type={t} size={16} />
                <span>{ES_LABELS[t]}</span>
              </div>
            ))}
          </div>
        </div>
        <button className="ghost-btn-small" onClick={handleClear}>✕</button>
      </div>
    )
  }

  return (
    <div className="pokemon-search-container">
      <input
        ref={inputRef}
        type="text"
        className="pokemon-search-input"
        placeholder="Buscar Pokémon..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
      />
      {loading && <span className="search-spinner">⏳</span>}
      
      {showDropdown && suggestions.length > 0 && (
        <div ref={dropdownRef} className="pokemon-dropdown">
          {suggestions.map(s => (
            <button
              key={s.name}
              className="pokemon-suggestion"
              onClick={() => handleSelect(s.name)}
            >
              <span className="pokemon-id">#{s.id}</span>
              <span className="pokemon-name">{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
