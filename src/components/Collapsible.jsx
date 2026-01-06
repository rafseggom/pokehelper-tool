import { useState } from 'react';

export default function Collapsible({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="collapsible">
      <button
        className="collapsible__header"
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="collapsible__chev">{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="collapsible__content">{children}</div>}
    </div>
  );
}