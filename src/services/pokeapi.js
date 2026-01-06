// Servicio para interactuar con PokeAPI (Gen 1-9, ~1000+ Pokémon)
const BASE_URL = 'https://pokeapi.co/api/v2'

// Mapeo de tipos EN -> ES (nombres internos a etiquetas)
const TYPE_MAP_EN_TO_INTERNAL = {
  normal: 'normal',
  fire: 'fire',
  water: 'water',
  electric: 'electric',
  grass: 'grass',
  ice: 'ice',
  fighting: 'fighting',
  poison: 'poison',
  ground: 'ground',
  flying: 'flying',
  psychic: 'psychic',
  bug: 'bug',
  rock: 'rock',
  ghost: 'ghost',
  dragon: 'dragon',
  dark: 'dark',
  steel: 'steel',
  fairy: 'fairy'
}

// Cache simple para evitar requests repetidos
const cache = new Map()

async function fetchWithCache(url) {
  if (cache.has(url)) {
    return cache.get(url)
  }
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  const data = await response.json()
  cache.set(url, data)
  return data
}

/**
 * Obtiene datos de un Pokémon por nombre o ID
 * @param {string|number} nameOrId - Nombre (en inglés, minúsculas) o ID del Pokémon
 * @returns {Promise<{name: string, displayName: string, sprite: string, types: string[]}>}
 */
export async function fetchPokemon(nameOrId) {
  try {
    const normalized = typeof nameOrId === 'string' 
      ? nameOrId.toLowerCase().replace(/[^a-z0-9-]/g, '')
      : nameOrId
    
    const data = await fetchWithCache(`${BASE_URL}/pokemon/${normalized}`)
    
    // Obtener nombre en español
    const speciesData = await fetchWithCache(data.species.url)
    const spanishName = speciesData.names.find(n => n.language.name === 'es')?.name || data.name
    
    // Mapear tipos a nuestro sistema interno
    const types = data.types
      .sort((a, b) => a.slot - b.slot)
      .map(t => TYPE_MAP_EN_TO_INTERNAL[t.type.name])
      .filter(Boolean)
    
    // Sprite oficial de mejor calidad
    const sprite = data.sprites.other?.['official-artwork']?.front_default 
      || data.sprites.front_default
    
    return {
      name: data.name,
      displayName: spanishName,
      sprite,
      types
    }
  } catch (error) {
    console.error('Error fetching pokemon:', error)
    throw error
  }
}

/**
 * Busca Pokémon por nombre (para autocomplete)
 * @param {string} query - Texto de búsqueda
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Array<{name: string, id: number}>>}
 */
export async function searchPokemon(query, limit = 20) {
  try {
    // PokeAPI no tiene endpoint de búsqueda, así que obtenemos la lista completa y filtramos
    // (en producción podrías cachear esta lista o usar un endpoint custom)
    const data = await fetchWithCache(`${BASE_URL}/pokemon?limit=1025`) // Gen 1-9
    
    const normalized = query.toLowerCase().replace(/[^a-z0-9-]/g, '')
    
    const matches = data.results
      .filter(p => p.name.includes(normalized))
      .slice(0, limit)
      .map((p) => ({
        name: p.name,
        id: parseInt(p.url.split('/').filter(Boolean).pop())
      }))
    
    return matches
  } catch (error) {
    console.error('Error searching pokemon:', error)
    return []
  }
}

/**
 * Obtiene datos de un movimiento por nombre o ID
 * @param {string|number} nameOrId - Nombre (en inglés, minúsculas) o ID del movimiento
 * @returns {Promise<{name: string, displayName: string, type: string, defensive: boolean}>}
 */
export async function fetchMove(nameOrId) {
  try {
    const normalized = typeof nameOrId === 'string'
      ? nameOrId.toLowerCase().replace(/[^a-z0-9-]/g, '')
      : nameOrId
    
    const data = await fetchWithCache(`${BASE_URL}/move/${normalized}`)
    
    // Obtener nombre en español
    const spanishName = data.names.find(n => n.language.name === 'es')?.name || data.name
    
    // Tipo del movimiento
    const type = TYPE_MAP_EN_TO_INTERNAL[data.type.name]
    
    // Movimientos defensivos son aquellos con damage_class === 'status'
    const defensive = data.damage_class.name === 'status'
    
    return {
      name: data.name,
      displayName: spanishName,
      type,
      defensive
    }
  } catch (error) {
    console.error('Error fetching move:', error)
    throw error
  }
}

/**
 * Busca movimientos por nombre (para autocomplete)
 * @param {string} query - Texto de búsqueda
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Array<{name: string, id: number}>>}
 */
export async function searchMoves(query, limit = 20) {
  try {
    const data = await fetchWithCache(`${BASE_URL}/move?limit=920`) // Todos los movimientos Gen 1-9
    
    const normalized = query.toLowerCase().replace(/[^a-z0-9-]/g, '')
    
    const matches = data.results
      .filter(m => m.name.includes(normalized))
      .slice(0, limit)
      .map((m) => ({
        name: m.name,
        id: parseInt(m.url.split('/').filter(Boolean).pop())
      }))
    
    return matches
  } catch (error) {
    console.error('Error searching moves:', error)
    return []
  }
}
