import { TYPES } from '../data/types.js';
import { effectivenessSingle, effectivenessDual } from '../data/typeChart.js';

// Defensive summary: for each attacker type, tally buckets across slots
export function computeDefensiveSummary(team) {
  const buckets = {}; // attacker -> {x0,x0_5,x1,x2,x4}
  const perSlot = {}; // attacker -> [multipliers per slot]
  TYPES.forEach((atk) => {
    buckets[atk] = { x0: 0, x0_5: 0, x1: 0, x2: 0, x4: 0 };
    perSlot[atk] = [];
    team.forEach((slot) => {
      const defs = (slot?.types || []).filter(Boolean);
      const m = defs.length >= 2 ? effectivenessDual(atk, defs) : effectivenessDual(atk, [defs[0]]);
      perSlot[atk].push(m || 1);
      if (m === 0) buckets[atk].x0 += 1;
      else if (m === 0.5) buckets[atk].x0_5 += 1;
      else if (m === 1) buckets[atk].x1 += 1;
      else if (m === 2) buckets[atk].x2 += 1;
      else if (m === 4) buckets[atk].x4 += 1;
      else {
        // Non-standard values (e.g., 0.25, 0.75, etc.) shouldn't occur in Gen9 chart; bucket to nearest
        if (m < 0.5) buckets[atk].x0_5 += 1; else if (m < 1.5) buckets[atk].x1 += 1; else if (m < 3) buckets[atk].x2 += 1; else buckets[atk].x4 += 1;
      }
    });
  });
  return { buckets, perSlot };
}

// Offensive coverage: best multiplier vs each single defender type across all non-defensive moves
// Applies STAB=1.5 if move.type is in slot.types; STAB multiplies after chart effectiveness
export function computeOffensiveCoverage(team) {
  const bestByDefType = {}; // defender -> {best, source: {slotIndex, moveIndex, moveType, stab}}
  TYPES.forEach((defType) => {
    let best = 0;
    let bestSource = null;
    team.forEach((slot, sIdx) => {
      const slotTypes = (slot?.types || []).filter(Boolean);
      (slot?.moves || []).forEach((mv, mIdx) => {
        if (!mv || mv.defensive || !mv.type) return; // exclude defensive or empty moves
        const base = effectivenessSingle(mv.type, defType);
        let total = base;
        const stab = slotTypes.includes(mv.type);
        if (stab) total = total * 1.5;
        if (total > best) {
          best = total;
          bestSource = { slotIndex: sIdx, moveIndex: mIdx, moveType: mv.type, stab };
        }
      });
    });
    bestByDefType[defType] = { best, source: bestSource };
  });
  return bestByDefType;
}

export function formatMultiplier(m) {
  // Map numeric to display set {x0, x0.5, x1, x1.5, x2, x3, x4}
  const rounded = Math.round(m * 10) / 10; // handle floating issues like 1.499999
  if (rounded <= 0) return 'x0';
  if (rounded <= 0.5) return 'x0.5';
  if (rounded <= 1) return 'x1';
  if (rounded <= 1.5) return 'x1.5';
  if (rounded <= 2) return 'x2';
  if (rounded <= 3) return 'x3';
  return 'x4';
}
