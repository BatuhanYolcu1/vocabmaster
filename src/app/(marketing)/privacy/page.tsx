import type { Metadata } from 'next';
import { ProsePage } from '@/components/marketing/prose-page';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = { title: 'Gizlilik politikası' };

export default function PrivacyPage() {
  return (
    <ProsePage title="Gizlilik politikası" updated="22 Ekim 2026" intro="Verilerini yalnızca sana iyi bir öğrenme deneyimi sunmak için kullanırız. Satmayız, reklam için paylaşmayız.">
      <section>
        <h2>1. Toplanan veriler</h2>
        <ul>
          <li>Hesap bilgileri: ad, e-posta adresi; Google ile giriş yaparsan Google profil adın ve fotoğrafın.</li>
          <li>Öğrenme verileri: listelerin, eklediğin kelimeler, cevapların, tekrar takvimin, seri ve XP bilgilerin.</li>
          <li>Tercihler: seviye, ilgi alanları, günlük hedef.</li>
          <li>Teknik veriler: anonim performans ve kullanım ölçümleri (çerez kullanmadan).</li>
        </ul>
      </section>
      <section>
        <h2>2. Verilerin kullanımı</h2>
        <p>
          Veriler; hesabını yönetmek, sana uygun kelimeleri seçmek, tekrar takvimini hesaplamak, istatistiklerini göstermek, hizmeti
          geliştirmek ve yasal yükümlülükleri yerine getirmek için kullanılır.
        </p>
      </section>
      <section>
        <h2>3. Veri güvenliği</h2>
        <p>
          Tüm bağlantılar SSL/TLS ile şifrelenir. Şifreler geri döndürülemez biçimde (bcrypt) saklanır; kimse — biz dahil — şifreni göremez.
          Veriler güvenli bulut sunucularında barındırılır.
        </p>
      </section>
      <section>
        <h2>4. KVKK kapsamındaki hakların</h2>
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında verilerine erişme, düzeltme, silme ve aktarım talep etme hakkına sahipsin.
          Hesabını ve tüm verilerini dilediğin an <strong>Ayarlar → Hesabı sil</strong> bölümünden kalıcı olarak silebilirsin. Diğer talepler
          için <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> adresine yazabilirsin.
        </p>
      </section>
      <section>
        <h2>5. Çerezler</h2>
        <p>
          Yalnızca oturumunu açık tutmak ve tema gibi tercihlerini hatırlamak için zorunlu teknik çerezler ve tarayıcı depolaması kullanılır.
          Reklam ya da takip çerezi kullanılmaz.
        </p>
      </section>
      <section>
        <h2>6. Üçüncü taraf hizmetler</h2>
        <p>
          Google ile giriş, yapay zekâ özellikleri için Google Gemini ve barındırma/ölçüm için Vercel kullanılır. Yapay zekâ özelliklerinde
          yalnızca işlenmesi gereken metin (ör. kelime ya da yapıştırdığın metin) iletilir. Bu sağlayıcılar kendi gizlilik politikalarına tabidir.
        </p>
      </section>
      <section>
        <h2>7. İletişim</h2>
        <p>
          Gizlilikle ilgili her sorun için: <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>
        </p>
      </section>
    </ProsePage>
  );
}
