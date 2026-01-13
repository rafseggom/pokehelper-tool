import { useState, useEffect, useRef } from 'react'
import { searchNatures, fetchNature } from '../services/pokeapi.js'

// Mapeo de stats a abreviaturas españolas
const STAT_ABBR = {
  'hp': 'PS',
  'attack': 'Atq',
  'defense': 'Def',
  'special-attack': 'AtE',
  'special-defense': 'DeE',
  'speed': 'Vel'
}

/**
 * Componente de búsqueda de naturalezas con autocomplete
 */
export default function NatureSearch({ value, onChange }) {
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
      const results = await searchNatures(query, 10)
      setSuggestions(results)
      setShowDropdown(results.length > 0)
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = async (natureName) => {
    setLoading(true)
    setShowDropdown(false)
    setQuery('')
    
    try {
      const data = await fetchNature(natureName)
      onChange(data)
    } catch (error) {
      alert(`Error al cargar ${natureName}: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    onChange(null)
    setQuery('')
    setSuggestions([])
  }

  if (value && value.name) {
    const hasEffect = value.increasedStat && value.decreasedStat
    
    return (
      <div className="nature-selected">
        <div className="nature-info">
          <span className="nature-label">Naturaleza:</span>
          <strong>{value.displayName}</strong>
          {hasEffect && (
            <span className="nature-stats">
              <span className="stat-up">{STAT_ABBR[value.increasedStat] || value.increasedStat} ↑</span>
              {' / '}
              <span className="stat-down">{STAT_ABBR[value.decreasedStat] || value.decreasedStat} ↓</span>
            </span>
          )}
          {!hasEffect && <span className="nature-neutral">(Neutra)</span>}
        </div>
        <button className="ghost-btn-tiny" onClick={handleClear}>✕</button>
      </div>
    )
  }

  return (
    <div className="nature-search-container">
      <span className="search-label">Naturaleza:</span>
      <input
        ref={inputRef}
        type="text"
        className="nature-search-input"
        placeholder="Buscar naturaleza..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
      />
      {loading && <span className="search-spinner-small">⏳</span>}
      
      {showDropdown && suggestions.length > 0 && (
        <div ref={dropdownRef} className="nature-dropdown">
          {suggestions.map((nature) => (
            <div
              key={nature.id}
              className="nature-dropdown-item"
              onClick={() => handleSelect(nature.name)}
            >
              <strong>{nature.displayName}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
