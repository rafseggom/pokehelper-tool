import { useState } from 'react'
import TypeIcon from './TypeIcon.jsx'
import TypeSelectGrid from './TypeSelectGrid.jsx'
import Modal from './Modal.jsx'
import { ES_LABELS } from '../data/types.js'

export default function MoveItem({ label, move, onChange, stabTypes = [] }) {
  const [open, setOpen] = useState(false)
  const update = (patch) => onChange({ ...move, ...patch })
  const stab = move.type ? stabTypes.includes(move.type) : false

  const preview = move.type ? (
    <>
      <TypeIcon type={move.type} size={18} />
      <span>{ES_LABELS[move.type]}</span>
    </>
  ) : (
    <span className="muted">Elegir tipo</span>
  )

  return (
    <div className="move-row">
      <div className="move-main">
        <span className="pill-label">{label}</span>
        <button type="button" className="type-picker-btn" onClick={() => setOpen(true)}>
          {preview}
        </button>
      </div>

      <div className="move-meta">
        <label className="checkbox-row">
          <input type="checkbox" checked={!!move.defensive} onChange={(e) => update({ defensive: e.target.checked })} />
          Defensivo
        </label>
        {move.type && (
          <div className={`stab-badge ${stab ? 'on' : ''}`}>
            <TypeIcon type={move.type} size={18} />
            <span>{stab ? 'STAB' : 'No STAB'}</span>
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={`Seleccionar tipo - ${label}`}>
        <TypeSelectGrid
          selected={move.type ? [move.type] : []}
          onChange={(arr) => { const v = Array.isArray(arr) ? arr[0] : arr; update({ type: v || '' }); setOpen(false) }}
          max={1}
        />
      </Modal>
    </div>
  )
}
