import type { Metadata } from 'next';
import { ProsePage } from '@/components/marketing/prose-page';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = { title: 'Kullanım koşulları' };

export default function TermsPage() {
  return (
    <ProsePage title="Kullanım koşulları" updated="22 Ekim 2026">
      <section>
        <h2>1. Hizmet tanımı</h2>
        <p>
          VocabMaster, BAY Technology tarafından geliştirilen, aralıklı tekrar ve yapay zekâ destekli bir İngilizce kelime öğrenme
          platformudur. Platforma web tarayıcısı üzerinden ve ana ekrana eklenebilen uygulama (PWA) olarak erişilebilir.
        </p>
      </section>
      <section>
        <h2>2. Hesap</h2>
        <p>
          Kayıt için geçerli bir e-posta adresi gerekir. Hesap bilgilerinin güvenliğinden sen sorumlusun. 13 yaşından küçük kullanıcılar
          ancak veli izniyle kayıt olabilir.
        </p>
      </section>
      <section>
        <h2>3. Kullanım kuralları</h2>
        <p>
          Platformu yasa dışı amaçlarla kullanmak, diğer kullanıcıların deneyimini olumsuz etkilemek, sistemi kötüye kullanmak (ör. sıralamayı
          manipüle etmek) ya da otomatik araçlarla veri çekmek yasaktır. Bu kurallara uymayan hesaplar askıya alınabilir.
        </p>
      </section>
      <section>
        <h2>4. Abonelik ve ödeme</h2>
        <p>
          Temel özellikler ücretsizdir. Pro üyelik aylık olarak ücretlendirilir; iptal, içinde bulunulan dönemin sonunda geçerli olur. Satın
          alımdan itibaren 14 gün içinde iade talep edebilirsin.
        </p>
      </section>
      <section>
        <h2>5. Fikrî mülkiyet</h2>
        <p>
          Platformun tasarımı, kodu ve hazır içeriği BAY Technology’nin fikrî mülkiyetidir. Kendi oluşturduğun kelime listeleri ve eklediğin
          içerik sana aittir.
        </p>
      </section>
      <section>
        <h2>6. Sorumluluk reddi</h2>
        <p>
          Platform “olduğu gibi” sunulur. Öğrenme sonuçları garanti edilmez. Yapay zekâ tarafından üretilen içerikler hata içerebilir; önemli
          kullanımlarda doğrulamanı öneririz.
        </p>
      </section>
      <section>
        <h2>7. Değişiklikler</h2>
        <p>
          Bu koşullar, önceden duyurularak güncellenebilir. Güncellemeden sonra platformu kullanmaya devam etmen yeni koşulları kabul ettiğin
          anlamına gelir. Sorular için: <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>
        </p>
      </section>
    </ProsePage>
  );
}
