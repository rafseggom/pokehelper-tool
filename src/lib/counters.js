import { TYPES } from '../data/types.js';
import { effectivenessDual, effectivenessSingle } from '../data/typeChart.js';

/**
 * Sugiere qué Pokémon del equipo usar contra un enemigo específico
 * @param {Array} team - Array de slots con pokemon y moves
 * @param {Object} enemy - Pokémon enemigo con {types, displayName}
 * @returns {Object} - {defensive: [...], offensive: [...]}
 */
export function suggestCounters(team, enemy) {
  if (!enemy || !enemy.types || enemy.types.length === 0) {
    return { defensive: [], offensive: [] };
  }

  const enemyTypes = enemy.types.filter(Boolean);
  
  // DEFENSA: Calcular qué Pokémon de mi equipo resiste mejor los tipos del enemigo
  const defensiveScores = team
    .map((slot, index) => {
      if (!slot.pokemon || !slot.pokemon.types || slot.pokemon.types.length === 0) {
        return null;
      }
      
      const myTypes = slot.pokemon.types.filter(Boolean);
      
      // Calcular el daño promedio que recibiría de los tipos del enemigo
      // Asumimos que el enemigo puede tener ataques de sus propios tipos
      let totalMultiplier = 0;
      let count = 0;
      
      enemyTypes.forEach(attackType => {
        const effectiveness = myTypes.length >= 2 
          ? effectivenessDual(attackType, myTypes)
          : effectivenessDual(attackType, [myTypes[0]]);
        totalMultiplier += effectiveness;
        count++;
      });
      
      const avgMultiplier = count > 0 ? totalMultiplier / count : 1;
      
      return {
        slotIndex: index,
        pokemon: slot.pokemon,
        avgMultiplier,
        // Menor es mejor (resiste más)
        score: avgMultiplier
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score); // Ordenar de menor a mayor (mejor resistencia primero)

  // ATAQUE: Calcular qué Pokémon hace más daño al enemigo
  const offensiveScores = team
    .map((slot, index) => {
      if (!slot.pokemon || !slot.pokemon.types || slot.pokemon.types.length === 0) {
        return null;
      }
      
      const myTypes = slot.pokemon.types.filter(Boolean);
      const moves = (slot.moves || []).filter(mv => mv && !mv.defensive && mv.type);
      
      if (moves.length === 0) {
        return null; // Sin ataques ofensivos
      }
      
      // Encontrar el mejor ataque contra el enemigo
      let bestMove = null;
      let bestMultiplier = 0;
      
      moves.forEach(move => {
        let effectiveness = enemyTypes.length >= 2
          ? effectivenessDual(move.type, enemyTypes)
          : effectivenessSingle(move.type, enemyTypes[0]);
        
        // Aplicar STAB
        const hasStab = myTypes.includes(move.type);
        if (hasStab) {
          effectiveness *= 1.5;
        }
        
        if (effectiveness > bestMultiplier) {
          bestMultiplier = effectiveness;
          bestMove = { ...move, stab: hasStab };
        }
      });
      
      if (!bestMove) {
        return null;
      }
      
      return {
        slotIndex: index,
        pokemon: slot.pokemon,
        bestMove,
        bestMultiplier,
        // Mayor es mejor (hace más daño)
        score: bestMultiplier
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score); // Ordenar de mayor a menor (mejor ataque primero)

  return {
    defensive: defensiveScores,
    offensive: offensiveScores
  };
}

/**
 * Formatea el multiplicador defensivo para mostrar
 */
export function formatDefensiveRating(multiplier) {
  if (multiplier === 0) return 'Inmune';
  if (multiplier <= 0.25) return 'Resiste mucho';
  if (multiplier <= 0.5) return 'Resiste';
  if (multiplier === 1) return 'Neutral';
  if (multiplier <= 2) return 'Débil';
  return 'Muy débil';
}
