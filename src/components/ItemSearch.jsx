import { useState, useEffect, useRef } from 'react'
import { searchItems, fetchItem } from '../services/pokeapi.js'

/**
 * Componente de búsqueda de objetos con autocomplete y tooltip
 */
export default function ItemSearch({ value, onChange }) {
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
      const results = await searchItems(query, 10)
      setSuggestions(results)
      setShowDropdown(results.length > 0)
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = async (itemName) => {
    setLoading(true)
    setShowDropdown(false)
    setQuery('')
    
    try {
      const data = await fetchItem(itemName)
      onChange(data)
    } catch (error) {
      alert(`Error al cargar ${itemName}: ${error.message}`)
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
      <div className="item-selected">
        <div className="tooltip-wrapper">
          <div className="item-info">
            {value.sprite && <img src={value.sprite} alt={value.displayName} className="item-sprite" />}
            <span className="item-label">Objeto:</span>
            <strong>{value.displayName}</strong>
          </div>
          {value.effect && <div className="tooltip-text">{value.effect}</div>}
        </div>
        <button className="ghost-btn-tiny" onClick={handleClear}>✕</button>
      </div>
    )
  }

  return (
    <div className="item-search-container">
      <span className="search-label">Objeto:</span>
      <input
        ref={inputRef}
        type="text"
        className="item-search-input"
        placeholder="Buscar objeto..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
      />
      {loading && <span className="search-spinner-small">⏳</span>}
      
      {showDropdown && suggestions.length > 0 && (
        <div ref={dropdownRef} className="item-dropdown">
          {suggestions.map((item) => (
            <div
              key={item.id}
              className="item-dropdown-item"
              onClick={() => handleSelect(item.name)}
            >
              <strong>{item.displayName}</strong>
              <span className="item-name-en">{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
