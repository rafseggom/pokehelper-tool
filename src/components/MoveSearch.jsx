import { useState, useEffect, useRef } from 'react'
import { searchMoves, fetchMove } from '../services/pokeapi.js'
import TypeIcon from './TypeIcon.jsx'
import { ES_LABELS } from '../data/types.js'

/**
 * Componente de búsqueda de movimientos con autocomplete
 * Al seleccionar, obtiene datos completos (tipo, clase de daño) de la API
 */
export default function MoveSearch({ value, onChange, pokemonTypes = [] }) {
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
      const results = await searchMoves(query, 15)
      setSuggestions(results)
      setShowDropdown(results.length > 0)
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = async (moveName) => {
    setLoading(true)
    setShowDropdown(false)
    setQuery('')
    
    try {
      const data = await fetchMove(moveName)
      onChange(data)
    } catch (error) {
      alert(`Error al cargar ${moveName}: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    onChange(null)
    setQuery('')
    setSuggestions([])
  }

  const hasStab = value && value.type && pokemonTypes.includes(value.type)

  if (value && value.name) {
    return (
      <div className="move-selected">
        <div className="move-info-row">
          <TypeIcon type={value.type} size={20} />
          <strong>{value.displayName}</strong>
          {hasStab && <span className="stab-badge">STAB</span>}
          {value.defensive && <span className="defensive-badge">Defensivo</span>}
        </div>
        <button className="ghost-btn-tiny" onClick={handleClear}>✕</button>
      </div>
    )
  }

  return (
    <div className="move-search-container">
      <input
        ref={inputRef}
        type="text"
        className="move-search-input"
        placeholder="Buscar movimiento..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
      />
      {loading && <span className="search-spinner-small">⏳</span>}
      
      {showDropdown && suggestions.length > 0 && (
        <div ref={dropdownRef} className="move-dropdown">
          {suggestions.map(s => (
            <button
              key={s.name}
              className="move-suggestion"
              onClick={() => handleSelect(s.name)}
            >
              <span className="move-suggestion-name">{s.displayName}</span>
              <span className="move-suggestion-en">({s.name})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
