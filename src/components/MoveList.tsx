import { useEffect, useRef } from 'react';
import './MoveList.css';

export function MoveList({ sanHistory }: { sanHistory: string[] }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [sanHistory.length]);

  const rows: Array<{ num: number; white?: string; black?: string }> = [];
  for (let i = 0; i < sanHistory.length; i += 2) {
    rows.push({ num: i / 2 + 1, white: sanHistory[i], black: sanHistory[i + 1] });
  }

  return (
    <div className="move-list scrollbar-thin">
      {rows.length === 0 && <p className="move-list-empty">No moves yet.</p>}
      {rows.map((row) => (
        <div className="move-row" key={row.num}>
          <span className="move-num">{row.num}.</span>
          <span className="move-san">{row.white}</span>
          <span className="move-san">{row.black ?? ''}</span>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
