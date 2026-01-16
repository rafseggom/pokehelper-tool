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
          
          <SlotCard slot={slot} onChange={(s) => setSlot(i, s)} index={i} />
        </div>
      ))}
    </div>
  );
}
