import Link from 'next/link';
import { Logo } from '@/components/logo';
import { SITE } from '@/lib/constants';

const COLUMNS = [
  {
    title: 'Ürün',
    links: [
      { href: '/#nasil', label: 'Nasıl çalışır' },
      { href: '/#modlar', label: 'Çalışma modları' },
      { href: '/pricing', label: 'Fiyatlar' },
      { href: '/register', label: 'Ücretsiz başla' },
    ],
  },
  {
    title: 'Şirket',
    links: [
      { href: '/about', label: 'Hakkımızda' },
      { href: '/contact', label: 'İletişim' },
    ],
  },
  {
    title: 'Yasal',
    links: [
      { href: '/privacy', label: 'Gizlilik politikası' },
      { href: '/terms', label: 'Kullanım koşulları' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">
            Aralıklı tekrarla İngilizce kelimeleri kalıcı olarak öğrenmenin en kolay yolu.
          </p>
          <a href={`mailto:${SITE.supportEmail}`} className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            {SITE.supportEmail}
          </a>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold text-fg">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted transition-colors hover:text-fg">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-5 py-5 text-xs text-subtle sm:px-8">
          © {new Date().getFullYear()} VocabMaster · BAY Technology
        </p>
      </div>
    </footer>
  );
}
