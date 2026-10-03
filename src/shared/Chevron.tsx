/** Fixed geometry and slot: disclosure never depends on font glyph metrics. */
export function Chevron({open}: {open: boolean}) {
  return <span className="orb-disclosure-slot" aria-hidden="true">
    <svg className={`orb-chevron ${open?'open':''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" focusable="false">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </span>;
}
