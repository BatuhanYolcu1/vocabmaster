import { cn, initials } from '@/lib/utils';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-12 text-center', className)}>
      {Icon && (
        <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-surface-2 text-muted">
          <Icon className="size-6" />
        </div>
      )}
      <h3 className="font-display text-base font-bold text-fg">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow && <div className="mb-1.5 text-sm font-medium text-muted">{eyebrow}</div>}
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-fg sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted sm:text-[15px]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-surface-2', className)} />;
}

const avatarColors = ['bg-primary', 'bg-violet', 'bg-success', 'bg-streak', 'bg-xp'];

export function Avatar({
  name,
  image,
  size = 36,
  className,
}: {
  name?: string | null;
  image?: string | null;
  size?: number;
  className?: string;
}) {
  const color = avatarColors[((name ?? '').charCodeAt(0) || 0) % avatarColors.length];
  return (
    <span
      className={cn('inline-grid shrink-0 place-items-center overflow-hidden rounded-full text-white', !image && color, className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      aria-hidden
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="size-full object-cover" />
      ) : (
        <span className="font-semibold">{initials(name)}</span>
      )}
    </span>
  );
}

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded border border-border-strong bg-surface px-1 font-mono text-[10px] font-medium text-muted',
        className,
      )}
    >
      {children}
    </kbd>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: React.ReactNode }>;
  className?: string;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className={cn('inline-flex rounded-xl bg-surface-2 p-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-lg px-3.5 py-1.5 text-sm font-medium text-muted transition-colors hover:text-fg',
            value === o.value && 'bg-surface text-fg shadow-sm',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Chip({
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-[13px] font-medium transition-colors',
        active
          ? 'border-primary bg-primary-soft text-primary-soft-fg'
          : 'border-border bg-surface text-muted hover:border-border-strong hover:text-fg',
        className,
      )}
      {...props}
    />
  );
}

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'primary',
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: 'primary' | 'success' | 'xp' | 'streak' | 'violet' | 'warning';
  className?: string;
}) {
  const toneClass = {
    primary: 'bg-primary-soft text-primary-soft-fg',
    success: 'bg-success-soft text-success',
    xp: 'bg-xp-soft text-xp',
    streak: 'bg-streak-soft text-streak',
    violet: 'bg-violet-soft text-violet',
    warning: 'bg-warning-soft text-warning',
  }[tone];
  return (
    <div className={cn('rounded-2xl border border-border bg-surface p-4 shadow-sm', className)}>
      <div className="flex items-center gap-2 text-[13px] font-medium text-muted">
        {Icon && (
          <span className={cn('grid size-7 place-items-center rounded-lg', toneClass)}>
            <Icon className="size-4" />
          </span>
        )}
        {label}
      </div>
      <div className="mt-2.5 font-display text-2xl font-extrabold tabular text-fg">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-muted">{hint}</div>}
    </div>
  );
}
