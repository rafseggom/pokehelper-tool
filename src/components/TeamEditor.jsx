import SlotCard from './SlotCard.jsx';

export default function TeamEditor({ team, onChange }) {
  const setSlot = (idx, slot) => {
    const next = team.map((s, i) => (i === idx ? slot : s));
    onChange(next);
  };
  return (
    <div className="team-grid">
      {team.map((slot, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
            <button className="ghost-btn" onClick={() => setSlot(i, { pokemon: null, moves: [], ability: null, nature: null, item: null })}>Resetear Pokémon {i + 1}</button>
          </div>
          <SlotCard slot={slot} onChange={(s) => setSlot(i, s)} index={i} />
        </div>
      ))}
    </div>
  );
}
