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
 * Busca movimientos por nombre en español o inglés (para autocomplete)
 * @param {string} query - Texto de búsqueda en español o inglés
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Array<{name: string, displayName: string, id: number}>>}
 */
let movesListCache = null // Cache de movimientos básicos
let movesSpanishCache = null // Cache de movimientos con nombres en español (se llena gradualmente)

/**
 * Precarga todos los movimientos en caché para búsquedas más rápidas
 * @param {function} onProgress - Callback que recibe (current, total) para reportar progreso
 * @returns {Promise<void>}
 */
export async function preloadAllMoves(onProgress) {
  try {
    // Cargar lista básica si no existe
    if (!movesListCache) {
      const listData = await fetchWithCache(`${BASE_URL}/move?limit=920`)
      movesListCache = listData.results.map(m => ({
        name: m.name,
        id: parseInt(m.url.split('/').filter(Boolean).pop()),
        url: m.url
      }))
      movesSpanishCache = new Map()
    }
    
    const total = movesListCache.length
    const batchSize = 50 // Lotes más pequeños para mejor feedback de progreso
    
    for (let i = 0; i < total; i += batchSize) {
      const batch = movesListCache.slice(i, Math.min(i + batchSize, total))
      
      await Promise.all(
        batch.map(async (m) => {
          if (movesSpanishCache.has(m.name)) {
            return // Ya está en caché
          }
          try {
            const moveData = await fetchWithCache(m.url)
            const spanishName = moveData.names.find(n => n.language.name === 'es')?.name || m.name
            movesSpanishCache.set(m.name, {
              name: m.name,
              displayName: spanishName,
              id: m.id,
              spanishLower: spanishName.toLowerCase()
            })
          } catch (error) {
            console.warn(`Error loading move ${m.name}:`, error)
            movesSpanishCache.set(m.name, {
              name: m.name,
              displayName: m.name,
              id: m.id,
              spanishLower: m.name.toLowerCase()
            })
          }
        })
      )
      
      // Reportar progreso
      if (onProgress) {
        onProgress(Math.min(i + batchSize, total), total)
      }
    }
    
    console.log(`✅ ${total} movimientos cargados en caché`)
  } catch (error) {
    console.error('Error preloading moves:', error)
    throw error
  }
}

/**
 * Verifica si los movimientos ya están precargados
 * @returns {boolean}
 */
export function areMovesPreloaded() {
  return movesSpanishCache !== null && movesSpanishCache.size > 0
}

/**
 * Obtiene el número de movimientos actualmente en caché
 * @returns {number}
 */
export function getCachedMovesCount() {
  return movesSpanishCache?.size || 0
}

export async function searchMoves(query, limit = 20) {
  try {
    // Cargar lista completa de movimientos (solo la primera vez)
    if (!movesListCache) {
      const listData = await fetchWithCache(`${BASE_URL}/move?limit=920`)
      movesListCache = listData.results.map(m => ({
        name: m.name,
        id: parseInt(m.url.split('/').filter(Boolean).pop()),
        url: m.url
      }))
      movesSpanishCache = new Map() // Inicializar caché de nombres en español
    }
    
    const normalized = query.toLowerCase().trim()
    if (normalized.length < 2) {
      return []
    }
    
    // Estrategia: buscar en inglés primero, luego expandir búsqueda en español si es necesario
    const matchesByEnglish = movesListCache
      .filter(m => m.name.toLowerCase().includes(normalized))
      .slice(0, limit)
    
    // Si hay suficientes resultados en inglés, cargar sus nombres en español y retornar
    if (matchesByEnglish.length >= limit) {
      const results = await Promise.all(
        matchesByEnglish.map(async (m) => {
          if (movesSpanishCache.has(m.name)) {
            return movesSpanishCache.get(m.name)
          }
          try {
            const moveData = await fetchWithCache(m.url)
            const spanishName = moveData.names.find(n => n.language.name === 'es')?.name || m.name
            const result = { name: m.name, displayName: spanishName, id: m.id }
            movesSpanishCache.set(m.name, result)
            return result
          } catch {
            const result = { name: m.name, displayName: m.name, id: m.id }
            movesSpanishCache.set(m.name, result)
            return result
          }
        })
      )
      return results
    }
    
    // Si no hay suficientes resultados en inglés, buscar en español
    // Cargar progresivamente más movimientos con nombres en español hasta encontrar coincidencias
    const batchSize = 100
    let allMatches = [...matchesByEnglish]
    
    for (let i = 0; i < movesListCache.length && allMatches.length < limit; i += batchSize) {
      const batch = movesListCache.slice(i, i + batchSize)
      
      // Cargar nombres en español para este lote
      const batchWithSpanish = await Promise.all(
        batch.map(async (m) => {
          if (movesSpanishCache.has(m.name)) {
            return movesSpanishCache.get(m.name)
          }
          try {
            const moveData = await fetchWithCache(m.url)
            const spanishName = moveData.names.find(n => n.language.name === 'es')?.name || m.name
            const result = { 
              name: m.name, 
              displayName: spanishName, 
              id: m.id,
              spanishLower: spanishName.toLowerCase()
            }
            movesSpanishCache.set(m.name, result)
            return result
          } catch {
            const result = { name: m.name, displayName: m.name, id: m.id, spanishLower: m.name.toLowerCase() }
            movesSpanishCache.set(m.name, result)
            return result
          }
        })
      )
      
      // Buscar coincidencias en este lote
      const batchMatches = batchWithSpanish.filter(m => 
        m.spanishLower.includes(normalized) && 
        !allMatches.some(existing => existing.name === m.name)
      )
      
      allMatches = [...allMatches, ...batchMatches].slice(0, limit)
      
      // Si ya tenemos suficientes resultados, parar
      if (allMatches.length >= limit) {
        break
      }
    }
    
    // Asegurarnos de que todos tienen displayName
    const finalResults = await Promise.all(
      allMatches.slice(0, limit).map(async (m) => {
        if (m.displayName) {
          return { name: m.name, displayName: m.displayName, id: m.id }
        }
        if (movesSpanishCache.has(m.name)) {
          const cached = movesSpanishCache.get(m.name)
          return { name: cached.name, displayName: cached.displayName, id: cached.id }
        }
        try {
          const moveData = await fetchWithCache(m.url)
          const spanishName = moveData.names.find(n => n.language.name === 'es')?.name || m.name
          return { name: m.name, displayName: spanishName, id: m.id }
        } catch {
          return { name: m.name, displayName: m.name, id: m.id }
        }
      })
    )
    
    return finalResults
  } catch (error) {
    console.error('Error searching moves:', error)
    return []
  }
}
