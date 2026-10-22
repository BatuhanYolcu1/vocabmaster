import type { Metadata } from 'next';
import { Compass, Flag } from 'lucide-react';
import { ProsePage } from '@/components/marketing/prose-page';
import { ButtonLink } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Hakkımızda' };

export default function AboutPage() {
  return (
    <ProsePage
      title="Hakkımızda"
      intro="VocabMaster, İngilizce kelime öğrenmeyi herkes için erişilebilir, keyifli ve gerçekten kalıcı hâle getirmek için yola çıktı."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            icon: Compass,
            t: 'Vizyonumuz',
            b: 'Bilimsel öğrenme yöntemlerini ve yapay zekâyı birleştirerek her öğrenciye kendi hızına uygun, kişisel bir öğrenme deneyimi sunmak.',
          },
          {
            icon: Flag,
            t: 'Misyonumuz',
            b: 'Türkiye’deki öğrencilerin ve profesyonellerin İngilizce kelime hazinesini en verimli şekilde geliştirmesine yardım etmek: ezber değil, kalıcı öğrenme.',
          },
        ].map(({ icon: Icon, t, b }) => (
          <div key={t} className="rounded-2xl border border-border bg-surface p-6">
            <Icon className="size-6 text-primary" />
            <p className="mt-3 font-display text-lg font-bold text-fg">{t}</p>
            <p className="mt-1.5">{b}</p>
          </div>
        ))}
      </div>
      <section>
        <h2>Nasıl çalışıyoruz?</h2>
        <p>
          VocabMaster’ın merkezinde aralıklı tekrar (spaced repetition) var: her kelimeyi tam unutmak üzereyken yeniden karşına çıkarıyoruz.
          Yedi farklı çalışma modu bir kelimeyi tanımaktan, yazmaya, duymaya ve söylemeye kadar farklı becerileri çalıştırıyor. Hepsi aynı
          tekrar takvimine işleniyor.
        </p>
      </section>
      <section>
        <h2>Ekip</h2>
        <p>VocabMaster, BAY Technology tarafından geliştirilmektedir.</p>
      </section>
      <ButtonLink href="/register">Ücretsiz başla</ButtonLink>
    </ProsePage>
  );
}
