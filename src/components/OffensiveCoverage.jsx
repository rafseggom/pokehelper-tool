import { TYPES, ES_LABELS } from '../data/types.js'
import { computeOffensiveCoverage, formatMultiplier } from '../lib/coverage.js'
import TypeIcon from './TypeIcon.jsx'

const multiplierClass = (label) => {
  if (label === 'x0') return 'pill-immune'
  if (label === 'x0.5') return 'pill-resist'
  if (label === 'x1' || label === 'x1.5') return 'pill-neutral'
  if (label === 'x2') return 'pill-weak'
  return 'pill-x4'
}

export default function OffensiveCoverage({ team }) {
  const best = computeOffensiveCoverage(team)
  const numeric = (m) => {
    const r = Math.round(m * 10) / 10
    if (r <= 0) return '0'
    if (r <= 0.5) return '0.5'
    if (r <= 1) return '1'
    if (r <= 1.5) return '1.5'
    if (r <= 2) return '2'
    if (r <= 3) return '3'
    return '4'
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Cobertura ofensiva</h2>
      </div>
      <div className="summary-grid">
        {TYPES.map((def) => {
          const entry = best[def]
          const label = formatMultiplier(entry.best)
          const num = numeric(entry.best)
          const bad = entry.best < 2 
          return (
            <div key={def} className={`summary-card type-surface--${def} ${bad ? 'bad' : ''}`}>
              <div className="summary-header">
                <TypeIcon type={def} size={28} />
                <span>{ES_LABELS[def]}</span>
              </div>
              <div className="pill-row">
                <span className={`pill ${multiplierClass(label)}`}>x{num}</span>
              </div>
              {entry.source && (
                <div className="muted small">{entry.source.pokemonName} - {entry.source.moveName}{entry.source.stab ? ' (STAB)' : ''}</div>
              )}
              {!entry.source && <div className="muted small">Sin cobertura</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
