import { TYPES, ES_LABELS } from '../data/types.js'
import { computeDefensiveSummary } from '../lib/coverage.js'
import TypeIcon from './TypeIcon.jsx'

export default function DefensiveSummary({ team }) {
  const { buckets } = computeDefensiveSummary(team)

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Resumen defensivo</h2>
      </div>
      <div className="summary-grid">
        {TYPES.map((t) => {
          const b = buckets[t]
          const covered = (b.x0 + b.x0_5) > 0
          return (
            <div key={t} className={`summary-card type-surface--${t} ${covered ? 'ok' : 'bad'}`}>
              <div className="summary-header">
                <TypeIcon type={t} size={28} />
                <span>{ES_LABELS[t]}</span>
              </div>
              <div className="pill-row">
                <span className={`pill ${covered ? 'pill-resist' : 'pill-weak'}`}>{covered ? 'Cubierto' : 'Sin cobertura'}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
