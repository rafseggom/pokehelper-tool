import { TYPES, ES_LABELS } from '../data/types.js';
import TypeIcon from './TypeIcon.jsx';

export default function TypeSelectGrid({
  selected = [],
  onChange,
  max = 2,          // para Pokémon: hasta 2 tipos. Para movimientos: usa max=1.
}) {
  const toggle = (t) => {
    if (max === 1) {
      onChange([t]);
      return;
    }
    const exists = selected.includes(t);
    let next = selected;
    if (exists) next = selected.filter(x => x !== t);
    else if (selected.length < max) next = [...selected, t];
    onChange(next);
  };

  return (
    <div className="type-grid">
      {TYPES.map((t) => {
        const active = selected.includes(t);
        return (
          <button
            key={t}
            type="button"
            className={`type-grid__item ${active ? 'is-active' : ''}`}
            onClick={() => toggle(t)}
            title={ES_LABELS[t]}
          >
            <TypeIcon type={t} size={32} title={ES_LABELS[t]} />
            <span className="type-grid__label">{ES_LABELS[t]}</span>
          </button>
        );
      })}
    </div>
  );
}
