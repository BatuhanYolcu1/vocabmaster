'use client';

import { useId, useState } from 'react';
import { cn, formatNumber } from '@/lib/utils';

export interface BarDatum {
  label: string;
  value: number;
  /** Optional detail line in the tooltip */
  detail?: string;
  highlight?: boolean;
}

function niceMax(max: number) {
  if (max <= 0) return 4;
  const pow = 10 ** Math.floor(Math.log10(max));
  const n = max / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

/**
 * Single-series vertical bar chart drawn with plain HTML so it inherits theme tokens.
 * Recessive grid (3 lines), rounded data ends anchored to the baseline, hover tooltip,
 * and a screen-reader table.
 */
export function BarChart({
  data,
  unit,
  height = 180,
  tone = 'primary',
  labelEvery = 1,
  className,
  ariaLabel,
}: {
  data: BarDatum[];
  unit: string;
  height?: number;
  tone?: 'primary' | 'xp' | 'success' | 'violet';
  labelEvery?: number;
  className?: string;
  ariaLabel: string;
}) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const ticks = [max, max / 2, 0];
  const color = { primary: 'bg-primary', xp: 'bg-xp', success: 'bg-success', violet: 'bg-violet' }[tone];

  return (
    <figure className={cn('w-full', className)} aria-labelledby={`${id}-cap`}>
      <figcaption id={`${id}-cap`} className="sr-only">
        {ariaLabel}
      </figcaption>
      <div className="flex gap-2">
        {/* y axis */}
        <div className="flex shrink-0 flex-col justify-between pb-6 text-right text-[11px] tabular text-subtle" style={{ height }}>
          {ticks.map((t) => (
            <span key={t} className="-translate-y-1/2 leading-none first:translate-y-0 last:translate-y-0">
              {formatNumber(Math.round(t))}
            </span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          {/* grid */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col justify-between" style={{ height: height - 24 }}>
            {ticks.map((t, i) => (
              <div key={t} className={cn('h-px w-full', i === ticks.length - 1 ? 'bg-border-strong' : 'bg-border/70')} />
            ))}
          </div>
          {/* bars */}
          <div className="relative flex items-end gap-[2px]" style={{ height: height - 24 }} onMouseLeave={() => setHover(null)}>
            {data.map((d, i) => {
              const h = max > 0 ? (d.value / max) * 100 : 0;
              const active = hover === i;
              return (
                <div
                  key={`${d.label}-${i}`}
                  className="group relative flex h-full flex-1 items-end justify-center"
                  onMouseEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  tabIndex={0}
                  aria-label={`${d.label}: ${formatNumber(d.value)} ${unit}`}
                >
                  <div
                    className={cn(
                      'w-full max-w-7 rounded-t-[4px] transition-opacity',
                      d.value > 0 ? color : 'bg-transparent',
                      hover !== null && !active && 'opacity-45',
                      d.highlight && d.value > 0 && hover === null && 'ring-2 ring-offset-2 ring-offset-surface ring-[color:var(--border-strong)]',
                    )}
                    style={{ height: d.value > 0 ? `max(${h}%, 3px)` : 0 }}
                  />
                  {active && (
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs shadow-md">
                      <div className="font-semibold text-fg">{d.label}</div>
                      <div className="tabular text-muted">
                        {formatNumber(d.value)} {unit}
                      </div>
                      {d.detail && <div className="text-muted">{d.detail}</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* x labels */}
          <div className="mt-1.5 flex gap-[2px]">
            {data.map((d, i) => (
              <span
                key={`${d.label}-x-${i}`}
                className={cn('flex min-w-0 flex-1 justify-center whitespace-nowrap text-[11px] text-subtle', d.highlight && 'font-semibold text-muted')}
              >
                {i === data.length - 1 || (i % labelEvery === 0 && i <= data.length - 1 - labelEvery) ? d.label : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="sr-only">
      <table>
        <caption>{ariaLabel}</caption>
        <tbody>
          {data.map((d, i) => (
            <tr key={i}>
              <th scope="row">{d.label}</th>
              <td>
                {d.value} {unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </figure>
  );
}

/** Horizontal bars with direct labels — for ranked categories. */
export function HBarList({
  data,
  unit,
  tone = 'primary',
}: {
  data: Array<{ label: string; value: number }>;
  unit: string;
  tone?: 'primary' | 'violet' | 'success';
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const color = { primary: 'bg-primary', violet: 'bg-violet', success: 'bg-success' }[tone];
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-medium text-fg">{d.label}</span>
            <span className="shrink-0 tabular text-muted">
              {formatNumber(d.value)} {unit}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-2">
            <div className={cn('h-full rounded-full', color)} style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
