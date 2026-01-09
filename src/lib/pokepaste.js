/**
 * Parsea un texto en formato pokepaste y extrae los Pokémon y sus movimientos
 * @param {string} pasteText - Texto en formato pokepaste
 * @returns {Array<{name: string, moves: string[]}>} Array de Pokémon con sus movimientos
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
      // Extraer solo el nombre del Pokémon (antes del paréntesis o @)
      const nameMatch = line.match(/^([^(@]+)/)
      if (nameMatch) {
        const pokemonName = nameMatch[1].trim()
        currentPokemon = {
          name: pokemonName,
          moves: []
        }
      }
      continue
    }

    // Líneas de movimientos (empiezan con "-")
    if (line.startsWith('-')) {
      const move = line.substring(1).trim()
      if (move && currentPokemon) {
        currentPokemon.moves.push(move)
      }
    }
    // Ignorar el resto de líneas (Ability, Level, EVs, IVs, Nature, etc.)
  }

  // Añadir el último Pokémon si existe
  if (currentPokemon && currentPokemon.name) {
    pokemon.push(currentPokemon)
  }

  return pokemon
}
