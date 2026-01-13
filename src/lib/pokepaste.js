/**
 * Parsea un texto en formato pokepaste y extrae los Pokémon con sus datos completos
 * @param {string} pasteText - Texto en formato pokepaste
 * @returns {Array<{name: string, moves: string[], item: string|null, ability: string|null, nature: string|null}>} Array de Pokémon con sus datos
 */
export function parsePokepaste(pasteText) {
  if (!pasteText || typeof pasteText !== 'string') {
    return []
  }

  const pokemon = []
  const lines = pasteText.split('\n')
  let currentPokemon = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Línea vacía indica fin del Pokémon actual
    if (line === '') {
      if (currentPokemon && currentPokemon.name) {
        pokemon.push(currentPokemon)
        currentPokemon = null
      }
      continue
    }

    // Primera línea: nombre del Pokémon (formato: "Nombre (Género) @ Item" o simplemente "Nombre")
    if (!currentPokemon) {
      // Extraer nombre del Pokémon (antes del paréntesis o @)
      const nameMatch = line.match(/^([^(@]+)/)
      const pokemonName = nameMatch ? nameMatch[1].trim() : null
      
      // Extraer objeto equipado (después de @)
      const itemMatch = line.match(/@\s*(.+)/)
      const item = itemMatch ? itemMatch[1].trim() : null
      
      if (pokemonName) {
        currentPokemon = {
          name: pokemonName,
          moves: [],
          item,
          ability: null,
          nature: null
        }
      }
      continue
    }

    // Línea de habilidad (formato: "Ability: Nombre")
    if (line.startsWith('Ability:')) {
      const abilityMatch = line.match(/Ability:\s*(.+)/)
      if (abilityMatch && currentPokemon) {
        currentPokemon.ability = abilityMatch[1].trim()
      }
      continue
    }

    // Línea de naturaleza (puede estar en varias líneas, pero comúnmente después de IVs o sola)
    // Formato común: "Adamant Nature" o solo "Adamant"
    // Lista de naturalezas conocidas para detectarlas
    const natures = [
      'Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty',
      'Bold', 'Docile', 'Relaxed', 'Impish', 'Lax',
      'Timid', 'Hasty', 'Serious', 'Jolly', 'Naive',
      'Modest', 'Mild', 'Quiet', 'Bashful', 'Rash',
      'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky'
    ]
    
    for (const nature of natures) {
      if (line.includes(nature)) {
        if (currentPokemon && !currentPokemon.nature) {
          currentPokemon.nature = nature
        }
        break
      }
    }

    // Líneas de movimientos (empiezan con "-")
    if (line.startsWith('-')) {
      const move = line.substring(1).trim()
      if (move && currentPokemon) {
        currentPokemon.moves.push(move)
      }
    }
  }

  // Añadir el último Pokémon si existe
  if (currentPokemon && currentPokemon.name) {
    pokemon.push(currentPokemon)
  }

  return pokemon
}
