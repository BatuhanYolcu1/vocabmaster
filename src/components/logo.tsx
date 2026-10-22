import Link from 'next/link';
import { cn } from '@/lib/utils';

/** inverse: white tile with a blue mark, for use on the brand colour. */
export function LogoMark({ className, inverse }: { className?: string; inverse?: boolean }) {
  const tile = inverse ? '#fff' : 'var(--primary)';
  const ink = inverse ? 'var(--primary)' : '#fff';
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8', className)} aria-hidden>
      <rect x="1" y="1" width="30" height="30" rx="9" fill={tile} />
      <rect x="7" y="9.5" width="14" height="11" rx="3" fill={ink} fillOpacity="0.35" transform="rotate(-8 14 15)" />
      <rect x="10" y="11" width="15" height="12" rx="3" fill={ink} />
      <path d="m13.6 16.4 2.6 2.6 4.6-5.2" fill="none" stroke={tile} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ href = '/', className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn('flex items-center gap-2.5 rounded-lg', className)} aria-label="VocabMaster ana sayfa">
      <LogoMark />
      <span className="font-display text-[17px] font-extrabold tracking-tight text-fg">VocabMaster</span>
    </Link>
  );
}
