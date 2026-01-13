// Servicio para interactuar con PokeAPI (Gen 1-9, ~1000+ Pokémon)
import { computeDefensiveSummary } from '../lib/coverage.js'
import { ES_LABELS } from '../data/types.js'
import { effectivenessDual } from '../data/typeChart.js'

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

// Diccionario de correcciones manuales para movimientos nuevos (Gen 8 Legends / Gen 9)
const MANUAL_TRANSLATIONS = {
  // Leyendas Arceus
  "dire-claw": "Garra Nociva",
  "psyshield-bash": "Asalto Barrera",
  "power-shift": "Cambiapoder",
  "stone-axe": "Hachazo Pétreo",
  "springtide-storm": "Ciclón Primavera",
  "mystical-power": "Poder Místico",
  "raging-fury": "Furia Candente",
  "wave-crash": "Envite Acuático",
  "chloroblast": "Clorostallido",
  "mountain-gale": "Viento Hielo",
  "victory-dance": "Danza Victoria",
  "headlong-rush": "Arremetida",
  "barb-barrage": "Mil Púas Tóxicas",
  "esper-wing": "Ala Aural",
  "bitter-malice": "Rencor Reprimido",
  "shelter": "Retracción",
  "triple-arrows": "Triple Flecha",
  "infernal-parade": "Desfile Infernal",
  "ceaseless-edge": "Tajo Metralla",
  "bleakwind-storm": "Ciclón Helado",
  "wildbolt-storm": "Ciclón Electro",
  "sandsear-storm": "Ciclón Arena",
  "lunar-blessing": "Bendición Lunar",
  "take-heart": "Valor",

  // Novena Generación (Escarlata/Púrpura y DLCs)
  "tera-blast": "Teraexplosión",
  "silk-trap": "Telatrampa",
  "axe-kick": "Patada Hacha",
  "last-respects": "Homenaje Póstumo",
  "order-up": "Marcha",
  "lumina-crash": "Fotocolisión",
  "jet-punch": "Puño Jet",
  "spicy-extract": "Extracto Picante",
  "spin-out": "Derrape",
  "population-bomb": "Proliferación",
  "ice-spinner": "Pirueta Helada",
  "kowtow-cleave": "Genuflexión",
  "glaive-rush": "Asalto Espadón",
  "revival-blessing": "Plegaria Vital",
  "salt-cure": "Salazón",
  "triple-dive": "Triple Inmersión",
  "mortal-spin": "Giro Mortífero",
  "doodle": "Calco",
  "fillet-away": "Deslome",
  "flower-trick": "Truco Floral",
  "torch-song": "Canto Ardiente",
  "aqua-step": "Danza Acuática",
  "raging-bull": "Furia Taurina",
  "make-it-rain": "Fiebre Dorada",
  "ruination": "Calamidad",
  "collision-course": "Nitrochoque",
  "electro-drift": "Electroderrape",
  "shed-tail": "Autotomía",
  "chilly-reception": "Fría Acogida",
  "tidy-up": "Limpieza General",
  "snowscape": "Paisaje Nevado",
  "pounce": "Brinco",
  "trailblaze": "Abrecaminos",
  "chilling-water": "Agua Fría",
  "hyper-drill": "Hipertaladradora",
  "twin-beam": "Láser Doble",
  "rage-fist": "Puño Furia",
  "armor-cannon": "Cañón Armadura",
  "bitter-blade": "Espada Lamento",
  "double-shock": "Doble Descarga",
  "gigaton-hammer": "Martillo Colosal",
  "comeuppance": "Resarcimiento",
  "aqua-cutter": "Tajo Acuático",
  "blazing-torque": "Pirochoque",
  "wicked-torque": "Ominochoque",
  "noxious-torque": "Ponzochoque",
  "combat-torque": "Pugnachoque",
  "magical-torque": "Feerichoque",
  "blood-moon": "Luna Roja",
  "matcha-gotcha": "Cañón Matcha",
  "syrup-bomb": "Bomba Jarabe",
  "ivy-cudgel": "Garrote Hiedra"
};

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

    // Stats base del Pokémon
    const baseStats = data.stats.map(s => ({
      name: s.stat.name,
      value: s.base_stat
    }))

    return {
      name: data.name,
      displayName: spanishName,
      sprite,
      types,
      baseStats
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
    const data = await fetchWithCache(`${BASE_URL}/pokemon?limit=5000`) // Gen 1-9

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
 * @returns {Promise<{name: string, displayName: string, type: string, defensive: boolean, damageClass: string, effect: string}>}
 */
export async function fetchMove(nameOrId) {
  try {
    const normalized = typeof nameOrId === 'string'
      ? nameOrId.toLowerCase().replace(/[^a-z0-9-]/g, '')
      : nameOrId

    const data = await fetchWithCache(`${BASE_URL}/move/${normalized}`)

    // Obtener nombre en español (priorizar traducciones manuales)
    const spanishName = MANUAL_TRANSLATIONS[data.name] ||
      data.names.find(n => n.language.name === 'es')?.name ||
      data.name

    // Tipo del movimiento
    const type = TYPE_MAP_EN_TO_INTERNAL[data.type.name]

    // Movimientos defensivos son aquellos con damage_class === 'status'
    const defensive = data.damage_class.name === 'status'
    
    // Clase de daño (physical, special, status)
    const damageClass = data.damage_class.name

    // Obtener descripción con múltiples fallbacks (español primero, luego inglés)
    const spanishFlavorEntry = data.flavor_text_entries?.find(e => e.language.name === 'es')
    const englishFlavorEntry = data.flavor_text_entries?.find(e => e.language.name === 'en')
    const spanishEffectEntry = data.effect_entries?.find(e => e.language.name === 'es')
    const englishEffectEntry = data.effect_entries?.find(e => e.language.name === 'en')
    
    const spanishEffect = spanishFlavorEntry?.flavor_text?.replace(/\n/g, ' ')
      || spanishEffectEntry?.short_effect?.replace(/\n/g, ' ')
      || spanishEffectEntry?.effect?.replace(/\n/g, ' ')
      || englishFlavorEntry?.flavor_text?.replace(/\n/g, ' ')
      || englishEffectEntry?.short_effect?.replace(/\n/g, ' ')
      || englishEffectEntry?.effect?.replace(/\n/g, ' ')
      || ''

    return {
      name: data.name,
      displayName: spanishName,
      type,
      defensive,
      damageClass,
      effect: spanishEffect
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
 * Normaliza texto eliminando tildes y diéresis para búsquedas flexibles
 * @param {string} text - Texto a normalizar
 * @returns {string} - Texto normalizado
 */
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina diacríticos (tildes, diéresis, etc.)
}

/**
 * Precarga todos los movimientos en caché para búsquedas más rápidas
 * @param {function} onProgress - Callback que recibe (current, total) para reportar progreso
 * @returns {Promise<void>}
 */
export async function preloadAllMoves(onProgress) {
  try {
    // Cargar lista básica si no existe
    if (!movesListCache) {
      const listData = await fetchWithCache(`${BASE_URL}/move?limit=10000`)
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
            const spanishName = MANUAL_TRANSLATIONS[m.name] ||
              moveData.names.find(n => n.language.name === 'es')?.name ||
              m.name
            movesSpanishCache.set(m.name, {
              name: m.name,
              displayName: spanishName,
              id: m.id,
              spanishLower: normalizeText(spanishName)
            })
          } catch (error) {
            console.warn(`Error loading move ${m.name}:`, error)
            const displayName = MANUAL_TRANSLATIONS[m.name] || m.name
            movesSpanishCache.set(m.name, {
              name: m.name,
              displayName: displayName,
              id: m.id,
              spanishLower: normalizeText(displayName)
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
      const listData = await fetchWithCache(`${BASE_URL}/move?limit=10000`)
      movesListCache = listData.results.map(m => ({
        name: m.name,
        id: parseInt(m.url.split('/').filter(Boolean).pop()),
        url: m.url
      }))
      movesSpanishCache = new Map() // Inicializar caché de nombres en español
    }

    const normalized = normalizeText(query.trim())
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
            const spanishName = MANUAL_TRANSLATIONS[m.name] ||
              moveData.names.find(n => n.language.name === 'es')?.name ||
              m.name
            const result = {
              name: m.name,
              displayName: spanishName,
              id: m.id,
              spanishLower: normalizeText(spanishName)
            }
            movesSpanishCache.set(m.name, result)
            return result
          } catch {
            const displayName = MANUAL_TRANSLATIONS[m.name] || m.name
            const result = {
              name: m.name,
              displayName: displayName,
              id: m.id,
              spanishLower: normalizeText(displayName)
            }
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
            const spanishName = MANUAL_TRANSLATIONS[m.name] ||
              moveData.names.find(n => n.language.name === 'es')?.name ||
              m.name
            const result = {
              name: m.name,
              displayName: spanishName,
              id: m.id,
              spanishLower: normalizeText(spanishName)
            }
            movesSpanishCache.set(m.name, result)
            return result
          } catch {
            const displayName = MANUAL_TRANSLATIONS[m.name] || m.name
            const result = {
              name: m.name,
              displayName: displayName,
              id: m.id,
              spanishLower: normalizeText(displayName)
            }
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
          const spanishName = MANUAL_TRANSLATIONS[m.name] ||
            moveData.names.find(n => n.language.name === 'es')?.name ||
            m.name
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

export async function fetchPokemonAnalysis(nameOrId, team = []) {
  try {
    const normalized = typeof nameOrId === 'string'
      ? nameOrId.toLowerCase().replace(/[^a-z0-9-]/g, '')
      : nameOrId

    const pokemonData = await fetchWithCache(`${BASE_URL}/pokemon/${normalized}`)
    const speciesData = await fetchWithCache(pokemonData.species.url)
    const evoData = await fetchWithCache(speciesData.evolution_chain.url)

    const bst = pokemonData.stats.reduce((acc, stat) => acc + stat.base_stat, 0)
    const avgStat = Math.round(bst / pokemonData.stats.length)

    const formLabels = new Set()
    const formDetails = []
    const normalizeFormLabel = (name) => name.replace(/-/g, ' ')

    const addVarietyForms = async (varieties) => {
      const enriched = await Promise.all(varieties
        .filter(v => !v.is_default)
        .map(async (v) => {
          const n = v.pokemon.name
          const pokemonInfo = await fetchWithCache(v.pokemon.url)
          const types = pokemonInfo.types
            .sort((a, b) => a.slot - b.slot)
            .map(t => TYPE_MAP_EN_TO_INTERNAL[t.type.name])
            .filter(Boolean)
          const sprite = pokemonInfo.sprites.other?.['official-artwork']?.front_default || pokemonInfo.sprites.front_default

          let category = 'Forma alternativa'
          if (n.includes('-mega')) category = 'Megaevolución'
          else if (n.includes('-gmax')) category = 'Gigamax'
          else if (n.includes('-alola')) category = 'Forma Alola'
          else if (n.includes('-galar')) category = 'Forma Galar'
          else if (n.includes('-hisui')) category = 'Forma Hisui'
          else if (n.includes('-paldea')) category = 'Forma Paldea'

          formLabels.add(category)

          return {
            name: n,
            displayName: normalizeFormLabel(n),
            category,
            sprite,
            types
          }
        }))

      formDetails.push(...enriched)
    }

    await addVarietyForms(speciesData.varieties)

    const flattenEvolution = (node, depth = 1, acc = []) => {
      acc.push({ name: node.species.name, stage: depth, evolutionDetails: [] })
      node.evolves_to.forEach((child) => {
        const details = child.evolution_details || []
        const allDetails = details.map((detail) => {
          const parts = []
          if (detail.min_level) parts.push(`Nivel ${detail.min_level}`)
          if (detail.item?.name) parts.push(`Usar ${detail.item.name.replace(/-/g, ' ')}`)
          if (detail.held_item?.name) parts.push(`Sostener ${detail.held_item.name.replace(/-/g, ' ')}`)
          if (detail.known_move?.name) parts.push(`Saber ${detail.known_move.name.replace(/-/g, ' ')}`)
          if (detail.location?.name) parts.push(`En ${detail.location.name.replace(/-/g, ' ')}`)
          if (detail.min_happiness) parts.push(`Felicidad ${detail.min_happiness}`)
          if (detail.min_affection) parts.push(`Afecto ${detail.min_affection}`)
          if (detail.time_of_day && detail.time_of_day !== '') parts.push(`Por la ${detail.time_of_day === 'day' ? 'mañana' : detail.time_of_day === 'night' ? 'noche' : detail.time_of_day}`)
          return parts.length > 0 ? parts.join(', ') : 'Evoluciona automáticamente'
        })
        flattenEvolution(child, depth + 1, acc)
        if (acc[acc.length - 1].name === child.species.name) {
          acc[acc.length - 1].evolutionDetails = allDetails
        }
      })
      return acc
    }

    const getEvolutionPaths = (node, path = [], paths = []) => {
      const nextPath = [...path, node.species.name]
      if (!node.evolves_to.length) {
        paths.push(nextPath)
      } else {
        node.evolves_to.forEach((child) => getEvolutionPaths(child, nextPath, paths))
      }
      return paths
    }

    const evolutionNodes = evoData?.chain ? flattenEvolution(evoData.chain) : [{ name: speciesData.name, stage: 1, evolutionDetails: [] }]

    const findEvolutionDetails = (nodeName, node) => {
      if (node.species.name === nodeName) {
        return { found: true, details: [] }
      }
      for (const child of node.evolves_to) {
        if (child.species.name === nodeName) {
          const details = child.evolution_details || []
          const allDetails = details.map((detail) => {
            const parts = []
            if (detail.min_level) parts.push(`Nivel ${detail.min_level}`)
            if (detail.item?.name) parts.push(`Usar ${detail.item.name.replace(/-/g, ' ')}`)
            if (detail.held_item?.name) parts.push(`Sostener ${detail.held_item.name.replace(/-/g, ' ')}`)
            if (detail.known_move?.name) parts.push(`Saber ${detail.known_move.name.replace(/-/g, ' ')}`)
            if (detail.location?.name) parts.push(`En ${detail.location.name.replace(/-/g, ' ')}`)
            if (detail.min_happiness) parts.push(`Felicidad ${detail.min_happiness}`)
            if (detail.min_affection) parts.push(`Afecto ${detail.min_affection}`)
            if (detail.time_of_day && detail.time_of_day !== '') parts.push(`Por la ${detail.time_of_day === 'day' ? 'mañana' : detail.time_of_day === 'night' ? 'noche' : detail.time_of_day}`)
            return parts.length > 0 ? parts.join(', ') : 'Evoluciona automáticamente'
          })
          return { found: true, details: allDetails }
        }
        const result = findEvolutionDetails(nodeName, child)
        if (result.found) return result
      }
      return { found: false, details: [] }
    }

    const evolutionEntries = await Promise.all(
      evolutionNodes.map(async ({ name, stage }) => {
        const speciesInfo = name === speciesData.name
          ? speciesData
          : await fetchWithCache(`${BASE_URL}/pokemon-species/${name}`)

        await addVarietyForms(speciesInfo.varieties)

        const spanishName = speciesInfo.names.find((n) => n.language.name === 'es')?.name || name
        const defaultPokemonName = speciesInfo.varieties.find((v) => v.is_default)?.pokemon?.name || name

        const pokeInfo = name === pokemonData.name
          ? pokemonData
          : await fetchWithCache(`${BASE_URL}/pokemon/${defaultPokemonName}`)

        const entryBst = pokeInfo.stats.reduce((acc, stat) => acc + stat.base_stat, 0)
        const entryAvg = Math.round(entryBst / pokeInfo.stats.length)
        const entryTypes = pokeInfo.types
          .sort((a, b) => a.slot - b.slot)
          .map(t => TYPE_MAP_EN_TO_INTERNAL[t.type.name])
          .filter(Boolean)
        const entrySprite = pokeInfo.sprites.other?.['official-artwork']?.front_default || pokeInfo.sprites.front_default

        const evoResult = evoData?.chain ? findEvolutionDetails(name, evoData.chain) : { found: false, details: [] }

        return { name, displayName: spanishName, stage, bst: entryBst, avgStat: entryAvg, types: entryTypes, sprite: entrySprite, stats: pokeInfo.stats, evolutionDetails: evoResult.details }
      })
    )

    const evolutionLineMap = new Map()
    evolutionEntries.forEach((entry) => {
      const existing = evolutionLineMap.get(entry.name)
      if (!existing || entry.stage < existing.stage) {
        evolutionLineMap.set(entry.name, entry)
      }
    })

    const evolutionLine = Array.from(evolutionLineMap.values()).sort((a, b) => a.stage - b.stage)

    const displayNameLookup = evolutionLine.reduce((acc, curr) => {
      acc[curr.name] = curr.displayName
      return acc
    }, {})

    const currentStage = evolutionLine.find((e) => e.name === pokemonData.name) || evolutionLine[0]
    const bestEvolution = evolutionLine.reduce((best, curr) => (curr.bst > best.bst ? curr : best), currentStage)

    const findNode = (node) => {
      if (node.species.name === speciesData.name) return node
      for (const child of node.evolves_to) {
        const match = findNode(child)
        if (match) return match
      }
      return null
    }

    const currentNode = evoData?.chain ? findNode(evoData.chain) : null
    const nextSpecies = currentNode?.evolves_to?.map((e) => e.species.name) || []
    const nextDisplay = nextSpecies.map((n) => displayNameLookup[n] || n)

    const captureVerdict = (() => {
      if (bestEvolution.bst >= 600) {
        return {
          label: 'Captura obligada',
          color: '#22c55e',
          explanation: `Puede llegar a ${bestEvolution.displayName} con ${bestEvolution.bst} BST, rendimiento tope de gama.`
        }
      }
      if (bestEvolution.bst >= 520) {
        return {
          label: 'Muy recomendable',
          color: '#2dd4bf',
          explanation: `Evoluciona hasta ${bestEvolution.displayName} (${bestEvolution.bst} BST); merece la inversión.`
        }
      }
      if (bestEvolution.bst >= 460) {
        return {
          label: 'Situacional',
          color: '#f59e0b',
          explanation: `Potencial correcto (${bestEvolution.displayName}, ${bestEvolution.bst} BST); captura si cubre huecos de tu equipo.`
        }
      }
      return {
        label: 'Poca prioridad',
        color: '#ef4444',
        explanation: 'El techo de stats es bajo; solo vale si necesitas su tipo o habilidad concreta.'
      }
    })()

    const statVerdict = (() => {
      if (avgStat >= 90) return { label: 'Stats sobresalientes', color: '#22c55e', explanation: 'Promedio alto, rinde bien incluso sin evolucionar.' }
      if (avgStat >= 75) return { label: 'Stats sólidos', color: '#38b2ac', explanation: 'Promedio competente para la historia y combate casual.' }
      if (avgStat >= 60) return { label: 'Stats medios', color: '#f59e0b', explanation: 'Necesita soporte o evolución para brillar.' }
      return { label: 'Stats débiles', color: '#ef4444', explanation: 'Promedio bajo; depende de evolucionar pronto.' }
    })()

    const statLabels = {
      hp: 'PS',
      attack: 'Ataque',
      defense: 'Defensa',
      'special-attack': 'Ataque especial',
      'special-defense': 'Defensa especial',
      speed: 'Velocidad'
    }

    const topStats = (() => {
      const statsSource = bestEvolution.stats || pokemonData.stats
      const sorted = [...statsSource].sort((a, b) => b.base_stat - a.base_stat).slice(0, 2)
      return sorted.map((stat) => ({
        label: statLabels[stat.stat.name] || stat.stat.name,
        value: stat.base_stat,
        stageName: bestEvolution.displayName
      }))
    })()
    const strongestStat = topStats[0]

    const evolutionPaths = evoData?.chain
      ? getEvolutionPaths(evoData.chain)
          .map((path) => path.map((n) => displayNameLookup[n] || n).join(' → '))
      : [displayNameLookup[speciesData.name] || speciesData.name]

    const sprite = pokemonData.sprites.other?.['official-artwork']?.front_default || pokemonData.sprites.front_default

    const computeCoverageAdvice = () => {
      if (!Array.isArray(team) || !team.length) {
        return { covers: [], uncovered: [], message: 'No hay equipo cargado para evaluar huecos.' }
      }

      const defensive = computeDefensiveSummary(team)

      const candidateTypes = pokemonData.types
        .sort((a, b) => a.slot - b.slot)
        .map((t) => TYPE_MAP_EN_TO_INTERNAL[t.type.name])
        .filter(Boolean)

      const defensiveWeaknesses = Object.entries(defensive.buckets)
        .filter(([, bucket]) => (bucket.x2 + bucket.x4) > 0)
        .map(([atk]) => atk)

      const defensiveCovered = Object.entries(defensive.buckets)
        .filter(([, bucket]) => bucket.x0 > 0 || bucket.x0_5 > 0)
        .map(([atk]) => atk)

      const covers = defensiveWeaknesses.filter((atk) => {
        const m = effectivenessDual(atk, candidateTypes)
        return m !== undefined && m <= 0.5
      })

      const coversButAlreadyCovered = covers.filter((atk) => defensiveCovered.includes(atk))
      const coversNewGap = covers.filter((atk) => !defensiveCovered.includes(atk))

      if (!covers.length) {
        return { covers: [], uncovered: [], message: 'No cubre debilidades defensivas del equipo.' }
      }

      const readable = covers.map((t) => ES_LABELS[t] || t)
      return {
        covers,
        uncovered: coversNewGap,
        coversButAlreadyCovered,
        message: `Cubre defensivamente ataques de tipo ${readable.join(', ')}.`
      }
    }

    const coverageAdvice = computeCoverageAdvice()

    return {
      name: pokemonData.name,
      displayName: speciesData.names.find((n) => n.language.name === 'es')?.name || pokemonData.name,
      sprite,
      bst,
      avgStat,
      stats: pokemonData.stats,
      canEvolve: nextSpecies.length > 0 || bestEvolution.stage > currentStage.stage,
      evolutionDetails: nextSpecies.length ? `Evoluciona a ${nextDisplay.join(' / ')}` : 'No evoluciona más',
      evolutionLine,
      evolutionPaths,
      bestEvolution,
      strongestStat,
      topStats,
      coverageAdvice,
      captureVerdict,
      statVerdict,
      forms: Array.from(formLabels),
      formsDetailed: formDetails
    }
  } catch (error) {
    console.error('Error analyzing pokemon:', error)
    throw error
  }
}

/**
 * Obtiene datos de una naturaleza por nombre o ID
 * @param {string|number} nameOrId - Nombre (en inglés, minúsculas) o ID de la naturaleza
 * @returns {Promise<{name: string, displayName: string, increasedStat: string|null, decreasedStat: string|null}>}
 */
export async function fetchNature(nameOrId) {
  try {
    // No normalizar - usar el nombre exacto como viene de la API
    const identifier = typeof nameOrId === 'string'
      ? nameOrId.toLowerCase()
      : nameOrId

    const data = await fetchWithCache(`${BASE_URL}/nature/${identifier}`)

    // Obtener nombre en español
    const spanishName = data.names.find(n => n.language.name === 'es')?.name || data.name

    // Stats afectadas (pueden ser null si es naturaleza neutra)
    const increasedStat = data.increased_stat?.name || null
    const decreasedStat = data.decreased_stat?.name || null

    return {
      name: data.name,
      displayName: spanishName,
      increasedStat,
      decreasedStat
    }
  } catch (error) {
    console.error('Error fetching nature:', error)
    throw error
  }
}

/**
 * Busca naturalezas por nombre (para autocomplete)
 * @param {string} query - Texto de búsqueda
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Array<{name: string, displayName: string, id: number}>>}
 */
let naturesListCache = null

export async function searchNatures(query, limit = 20) {
  try {
    // Cargar lista de naturalezas (solo la primera vez)
    if (!naturesListCache) {
      const data = await fetchWithCache(`${BASE_URL}/nature?limit=25`)
      naturesListCache = await Promise.all(
        data.results.map(async (n) => {
          const natureData = await fetchWithCache(n.url)
          const spanishName = natureData.names.find(name => name.language.name === 'es')?.name || n.name
          return {
            name: n.name,
            displayName: spanishName,
            id: parseInt(n.url.split('/').filter(Boolean).pop()),
            spanishLower: normalizeText(spanishName)
          }
        })
      )
    }

    const normalized = normalizeText(query.trim())

    const matches = naturesListCache
      .filter(n => 
        n.name.includes(normalized) || 
        n.spanishLower.includes(normalized)
      )
      .slice(0, limit)

    return matches
  } catch (error) {
    console.error('Error searching natures:', error)
    return []
  }
}

/**
 * Obtiene datos de una habilidad por nombre o ID
 * @param {string|number} nameOrId - Nombre (en inglés, minúsculas) o ID de la habilidad
 * @returns {Promise<{name: string, displayName: string, effect: string}>}
 */
export async function fetchAbility(nameOrId) {
  try {
    // No normalizar - usar el nombre exacto como viene de la API
    const identifier = typeof nameOrId === 'string'
      ? nameOrId.toLowerCase()
      : nameOrId

    const data = await fetchWithCache(`${BASE_URL}/ability/${identifier}`)

    // Obtener nombre en español
    const spanishName = data.names.find(n => n.language.name === 'es')?.name || data.name

    // Obtener descripción en español (effect_entries tiene el efecto real)
    const spanishEffectEntry = data.effect_entries?.find(e => e.language.name === 'es')
    const spanishEffect = spanishEffectEntry?.effect?.replace(/\n/g, ' ') 
      || spanishEffectEntry?.short_effect?.replace(/\n/g, ' ')
      || data.effect_entries?.find(e => e.language.name === 'en')?.short_effect?.replace(/\n/g, ' ')
      || ''

    return {
      name: data.name,
      displayName: spanishName,
      effect: spanishEffect
    }
  } catch (error) {
    console.error('Error fetching ability:', error)
    throw error
  }
}

/**
 * Busca habilidades por nombre (para autocomplete)
 * @param {string} query - Texto de búsqueda
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Array<{name: string, displayName: string, id: number}>>}
 */
let abilitiesListCache = null

export async function searchAbilities(query, limit = 20) {
  try {
    // Cargar lista de habilidades (solo la primera vez)
    if (!abilitiesListCache) {
      const data = await fetchWithCache(`${BASE_URL}/ability?limit=400`)
      // Cargar nombres en español de forma asíncrona (puede tardar)
      abilitiesListCache = data.results.map(a => ({
        name: a.name,
        displayName: null, // Se cargará bajo demanda
        id: parseInt(a.url.split('/').filter(Boolean).pop()),
        url: a.url
      }))
    }

    const normalized = normalizeText(query.trim())

    // Buscar primero por nombre en inglés (rápido)
    const matchesByEnglish = abilitiesListCache
      .filter(a => a.name.includes(normalized))
      .slice(0, limit)

    // Cargar nombres en español de los resultados
    const results = await Promise.all(
      matchesByEnglish.map(async (a) => {
        if (!a.displayName) {
          try {
            const abilityData = await fetchWithCache(a.url)
            const spanishName = abilityData.names.find(n => n.language.name === 'es')?.name || a.name
            a.displayName = spanishName
            a.spanishLower = normalizeText(spanishName)
          } catch {
            a.displayName = a.name
            a.spanishLower = a.name
          }
        }
        return a
      })
    )

    return results
  } catch (error) {
    console.error('Error searching abilities:', error)
    return []
  }
}

/**
 * Obtiene datos de un objeto por nombre o ID
 * @param {string|number} nameOrId - Nombre (en inglés, exacto como viene de la API) o ID del objeto
 * @returns {Promise<{name: string, displayName: string, effect: string, sprite: string|null}>}
 */
export async function fetchItem(nameOrId) {
  try {
    // No normalizar - usar el nombre exacto como viene de la API
    const identifier = typeof nameOrId === 'string'
      ? nameOrId.toLowerCase()
      : nameOrId

    const data = await fetchWithCache(`${BASE_URL}/item/${identifier}`)

    // Obtener nombre en español
    const spanishName = data.names?.find(n => n.language.name === 'es')?.name || data.name

    // Obtener descripción en español (effect_entries tiene el efecto real del objeto)
    const spanishEffectEntry = data.effect_entries?.find(e => e.language.name === 'es')
    const spanishEffect = spanishEffectEntry?.effect?.replace(/\n/g, ' ') 
      || spanishEffectEntry?.short_effect?.replace(/\n/g, ' ')
      || data.effect_entries?.find(e => e.language.name === 'en')?.short_effect?.replace(/\n/g, ' ')
      || ''

    // Sprite del objeto
    const sprite = data.sprites?.default || null

    return {
      name: data.name,
      displayName: spanishName,
      effect: spanishEffect,
      sprite
    }
  } catch (error) {
    console.error('Error fetching item:', error)
    throw error
  }
}

/**
 * Busca objetos por nombre (para autocomplete)
 * Solo muestra objetos equipables (held items), no medicinas ni bayas
 * @param {string} query - Texto de búsqueda
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Array<{name: string, displayName: string, id: number}>>}
 */
let itemsListCache = null

export async function searchItems(query, limit = 20) {
  try {
    // Cargar lista de objetos equipables (solo la primera vez)
    if (!itemsListCache) {
      // Obtener lista completa de items
      const data = await fetchWithCache(`${BASE_URL}/item?limit=2000`)
      
      // Filtrar solo items equipables (held-items)
      // Esto excluye medicinas, bayas, TMs, objetos de evolución, etc.
      const heldItemsPromises = data.results.map(async (i) => {
        try {
          const itemData = await fetchWithCache(i.url)
          // Verificar si es un item equipable
          const isHeldItem = itemData.attributes?.some(attr => attr.name === 'holdable') || false
          const category = itemData.category?.name || ''
          
          // Incluir solo items equipables y excluir categorías no deseadas
          if (isHeldItem || 
              category === 'held-items' || 
              category === 'choice' ||
              category === 'effort-drop' ||
              category === 'type-enhancement' ||
              category === 'plates' ||
              category === 'species-specific' ||
              category === 'training' ||
              category === 'bad-held-items' ||
              category === 'in-a-pinch' ||
              category === 'stat-boosts' ||
              category === 'mega-stones' ||
              category === 'memories' ||
              category === 'z-crystals' ||
              category === 'jewels' ||
              category === 'scarves') {
            const spanishName = itemData.names.find(n => n.language.name === 'es')?.name || i.name
            return {
              name: i.name,
              displayName: spanishName,
              id: parseInt(i.url.split('/').filter(Boolean).pop()),
              url: i.url,
              spanishLower: normalizeText(spanishName),
              category
            }
          }
          return null
        } catch (error) {
          console.warn(`Error loading item ${i.name}:`, error)
          return null
        }
      })
      
      const allItems = await Promise.all(heldItemsPromises)
      itemsListCache = allItems.filter(item => item !== null)
      
      console.log(`✅ ${itemsListCache.length} objetos equipables cargados`)
    }

    const normalized = normalizeText(query.trim())

    // Buscar por nombre en inglés o español
    const matches = itemsListCache
      .filter(i => 
        i.name.includes(normalized) || 
        i.spanishLower.includes(normalized)
      )
      .slice(0, limit)

    return matches
  } catch (error) {
    console.error('Error searching items:', error)
    return []
  }
}