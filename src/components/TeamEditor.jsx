import SlotCard from './SlotCard.jsx';

export default function TeamEditor({ team, onChange }) {
  const setSlot = (idx, slot) => {
    const next = team.map((s, i) => (i === idx ? slot : s));
    onChange(next);
  };
  return (
    <div className="team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
      {team.map((slot, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
            <button className="ghost-btn" onClick={() => setSlot(i, { types: [], moves: [] })}>Resetear Pokémon {i + 1}</button>
          </div>
          <SlotCard slot={slot} onChange={(s) => setSlot(i, s)} index={i} />
        </div>
      ))}
    </div>
  );
}
