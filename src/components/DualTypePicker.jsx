import { TYPES, ES_LABELS } from '../data/types.js';

export default function DualTypePicker({ value = [], onChange }) {
  const [t1 = '', t2 = ''] = value;

  const handleT1 = (e) => {
    const v = e.target.value || '';
    onChange([v || null, t2 || null].filter(Boolean));
  };
  const handleT2 = (e) => {
    const v = e.target.value || '';
    const arr = [t1 || null, v || null].filter(Boolean);
    onChange(arr);
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <select value={t1} onChange={handleT1}>
        <option value="">Sin tipo</option>
        {TYPES.map((k) => (
          <option key={k} value={k}>{ES_LABELS[k]}</option>
        ))}
      </select>
      <select value={t2} onChange={handleT2}>
        <option value="">Sin segundo tipo</option>
        {TYPES.map((k) => (
          <option key={k} value={k}>{ES_LABELS[k]}</option>
        ))}
      </select>
    </div>
  );
}
