import { useMemo, useState } from 'react'
import TypeSelectGrid from './TypeSelectGrid.jsx'
import TypeIcon from './TypeIcon.jsx'
import MoveItem from './MoveItem.jsx'
import Modal from './Modal.jsx'

export default function SlotCard({ slot, onChange, index }) {
  const setTypes = (types) => onChange({ ...slot, types })
  const [openTypes, setOpenTypes] = useState(false)
  const updateMove = (idx, next) => {
    const base = Array.isArray(slot.moves) ? [...slot.moves] : []
    while (base.length < 4) base.push({ type: '', defensive: false })
    base[idx] = next
    onChange({ ...slot, moves: base })
  }

  const moves4 = useMemo(() => {
    const base = [...(slot.moves || [])]
    while (base.length < 4) base.push({ type: '', defensive: false })
    return base.slice(0, 4)
  }, [slot.moves])

  return (
    <div className="slot-card">
      <div className="slot-header">
        <div className="pill">Pokémon {index + 1}</div>
        <div className="types-row">
          <button type="button" className="type-picker-btn" onClick={() => setOpenTypes(true)}>
            {(slot.types || []).length ? (
              <>
                {(slot.types || []).map((t) => <TypeIcon key={t} type={t} size={20} />)}
                <span>Cambiar tipos del Pokémon</span>
              </>
            ) : (
              <span>Elegir tipos del Pokémon</span>
            )}
          </button>
        </div>
      </div>

      <div className="slot-card__moves">
        {moves4.map((mv, i) => (
          <MoveItem key={i} label={`Ataque ${i + 1}`} move={mv} onChange={(newMv) => updateMove(i, newMv)} stabTypes={slot.types || []} />
        ))}
      </div>

      <Modal open={openTypes} onClose={() => setOpenTypes(false)} title={`Tipos del Pokémon`}>
        <TypeSelectGrid selected={slot.types || []} onChange={(v) => { setTypes(v); setOpenTypes(false) }} max={2} />
      </Modal>
    </div>
  )
}
