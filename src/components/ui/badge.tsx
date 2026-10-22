import { cn } from '@/lib/utils';
import type { CardStage } from '@/lib/srs';
import { CARD_STAGE_LABELS } from '@/lib/srs';

const tones = {
  neutral: 'bg-surface-2 text-muted',
  primary: 'bg-primary-soft text-primary-soft-fg',
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger',
  warning: 'bg-warning-soft text-warning',
  xp: 'bg-xp-soft text-xp',
  streak: 'bg-streak-soft text-streak',
  violet: 'bg-violet-soft text-violet',
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({
  tone = 'neutral',
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-semibold leading-4 [&_svg]:size-3',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

const stageTone: Record<CardStage, BadgeTone> = {
  new: 'neutral',
  learning: 'warning',
  review: 'primary',
  mastered: 'success',
};

export function StageBadge({ stage, className }: { stage: CardStage; className?: string }) {
  return (
    <Badge tone={stageTone[stage]} className={className}>
      {CARD_STAGE_LABELS[stage]}
    </Badge>
  );
}

const levelTone: Record<string, BadgeTone> = {
  A1: 'success',
  A2: 'success',
  B1: 'primary',
  B2: 'primary',
  C1: 'violet',
  C2: 'violet',
};

export function LevelBadge({ level, className }: { level: string; className?: string }) {
  return (
    <Badge tone={levelTone[level] ?? 'neutral'} className={cn('font-mono tracking-tight', className)}>
      {level}
    </Badge>
  );
}
