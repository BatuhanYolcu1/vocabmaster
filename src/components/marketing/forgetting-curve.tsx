// Illustrative chart: memory without review decays; with spaced reviews it stays high.
// Two series → legend + direct labels; neutral ink for "no review", brand blue for SRS.

const W = 560;
const H = 240;
const PAD = { l: 44, r: 16, t: 16, b: 34 };
const days = 30;
const x = (d: number) => PAD.l + (d / days) * (W - PAD.l - PAD.r);
const y = (p: number) => PAD.t + (1 - p) * (H - PAD.t - PAD.b);

function decay(from: number, start: number, end: number, strength: number) {
  const pts: string[] = [];
  for (let d = start; d <= end; d += 0.25) pts.push(`${x(d).toFixed(1)},${y(from * Math.exp(-(d - start) / strength)).toFixed(1)}`);
  return pts;
}

const noReview = decay(1, 0, days, 4).join(' ');
const reviews = [0, 1, 4, 11, 25];
const srsPoints: string[] = [];
reviews.forEach((r, i) => {
  const next = reviews[i + 1] ?? days;
  const strength = 2.5 * (i + 1) ** 1.9;
  srsPoints.push(...decay(1, r, next, strength));
});
const srs = srsPoints.join(' ');

export function ForgettingCurve() {
  return (
    <figure className="w-full">
      <div className="mb-3 flex flex-wrap gap-4 text-xs font-medium text-muted">
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-5 rounded bg-primary" /> Aralıklı tekrar ile
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-5 rounded bg-subtle" /> Tekrar etmeden
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Unutma eğrisi: tekrar etmeden hafıza birkaç günde düşer; aralıklı tekrarla yüksek kalır.">
        {[0, 0.5, 1].map((p) => (
          <g key={p}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(p)} y2={y(p)} stroke="var(--border)" strokeWidth="1" />
            <text x={PAD.l - 8} y={y(p) + 4} textAnchor="end" fontSize="11" fill="var(--subtle)">
              %{p * 100}
            </text>
          </g>
        ))}
        {[0, 7, 14, 21, 28].map((d) => (
          <text key={d} x={x(d)} y={H - 10} textAnchor="middle" fontSize="11" fill="var(--subtle)">
            {d === 0 ? 'bugün' : `${d}. gün`}
          </text>
        ))}
        <polyline points={noReview} fill="none" stroke="var(--subtle)" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" />
        <polyline points={srs} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {reviews.slice(1).map((r) => (
          <circle key={r} cx={x(r)} cy={y(1)} r="5" fill="var(--primary)" stroke="var(--surface)" strokeWidth="2" />
        ))}
        <text x={x(25)} y={y(1) - 9} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--fg)">
          tekrar
        </text>
        <text x={x(17)} y={y(0.06) - 8} fontSize="11" fill="var(--muted)">
          çoğu unutuldu
        </text>
      </svg>
      <figcaption className="sr-only">Temsilî grafik.</figcaption>
    </figure>
  );
}
