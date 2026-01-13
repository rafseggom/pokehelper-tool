import { useState, useEffect, useRef } from 'react'
import { searchAbilities, fetchAbility } from '../services/pokeapi.js'

/**
 * Componente de búsqueda de habilidades con autocomplete y tooltip
 */
export default function AbilitySearch({ value, onChange }) {
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
      const results = await searchAbilities(query, 10)
      setSuggestions(results)
      setShowDropdown(results.length > 0)
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = async (abilityName) => {
    setLoading(true)
    setShowDropdown(false)
    setQuery('')
    
    try {
      const data = await fetchAbility(abilityName)
      onChange(data)
    } catch (error) {
      alert(`Error al cargar ${abilityName}: ${error.message}`)
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
    return (
      <div className="ability-selected">
        <div className="tooltip-wrapper">
          <div className="ability-info">
            <span className="ability-label">Habilidad:</span>
            <strong>{value.displayName}</strong>
          </div>
          {value.effect && <div className="tooltip-text">{value.effect}</div>}
        </div>
        <button className="ghost-btn-tiny" onClick={handleClear}>✕</button>
      </div>
    )
  }

  return (
    <div className="ability-search-container">
      <span className="search-label">Habilidad:</span>
      <input
        ref={inputRef}
        type="text"
        className="ability-search-input"
        placeholder="Buscar habilidad..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
      />
      {loading && <span className="search-spinner-small">⏳</span>}
      
      {showDropdown && suggestions.length > 0 && (
        <div ref={dropdownRef} className="ability-dropdown">
          {suggestions.map((ability) => (
            <div
              key={ability.id}
              className="ability-dropdown-item"
              onClick={() => handleSelect(ability.name)}
            >
              <strong>{ability.displayName}</strong>
              <span className="ability-name-en">{ability.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
