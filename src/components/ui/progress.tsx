import { cn } from '@/lib/utils';

const barTones = {
  primary: 'bg-primary',
  success: 'bg-success',
  xp: 'bg-xp',
  streak: 'bg-streak',
  danger: 'bg-danger',
} as const;

export function ProgressBar({
  value,
  max = 1,
  tone = 'primary',
  className,
  label,
}: {
  value: number;
  max?: number;
  tone?: keyof typeof barTones;
  className?: string;
  label?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      aria-label={label}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-3', className)}
    >
      <div className={cn('h-full rounded-full transition-[width] duration-500 ease-out', barTones[tone])} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ProgressRing({
  value,
  max = 1,
  size = 96,
  stroke = 9,
  tone = 'primary',
  children,
  className,
  label,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  tone?: 'primary' | 'success' | 'xp' | 'streak';
  children?: React.ReactNode;
  className?: string;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const color = { primary: 'var(--primary)', success: 'var(--success)', xp: 'var(--xp)', streak: 'var(--streak)' }[tone];
  return (
    <div
      className={cn('relative inline-grid place-items-center', className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      aria-label={label}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
