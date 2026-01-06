export default function Legend() {
  const items = [
    { label: '0', cls: 'pill-immune', desc: 'Inmune' },
    { label: '0.5', cls: 'pill-resist', desc: 'Resiste' },
    { label: '1', cls: 'pill-neutral', desc: 'Neutro' },
    { label: '1.5', cls: 'pill-neutral', desc: 'STAB neutro' },
    { label: '2', cls: 'pill-weak', desc: 'Súper efectivo' },
    { label: '3', cls: 'pill-x4', desc: 'x2 con STAB' },
    { label: '4', cls: 'pill-x4', desc: 'Doble debilidad' },
  ]
  return (
    <aside className="legend">
      <h3>Leyenda</h3>
      <div className="legend-list">
        {items.map((it) => (
          <div key={it.label} className="legend-item">
            <span className={`pill ${it.cls}`}>{it.label}</span>
            <span className="muted">{it.desc}</span>
          </div>
        ))}
      </div>
    </aside>
  )
}
