import { ES_LABELS } from '../data/types.js';

export default function TypeIcon({ type, size = 24, title }) {
  const base = import.meta.env.BASE_URL || '/';
  const src = `${base}icons/${type}.svg`;
  return (
    <img
      src={src}
      alt={title || type}
      width={size}
      height={size}
      loading="lazy"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    />
  );
}
