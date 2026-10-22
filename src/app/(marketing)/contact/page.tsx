import type { Metadata } from 'next';
import { Clock, Mail, MessageCircleQuestion } from 'lucide-react';
import { ProsePage } from '@/components/marketing/prose-page';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = { title: 'İletişim' };

export default function ContactPage() {
  return (
    <ProsePage title="İletişim" intro="Bir sorun mu yaşadın, bir fikrin mi var? Bize yaz; her mesajı okuyoruz.">
      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href={`mailto:${SITE.supportEmail}`}
          className="group flex gap-4 rounded-2xl border border-border bg-surface p-6 !text-fg !no-underline transition hover:border-primary"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-soft-fg">
            <Mail className="size-5" />
          </span>
          <span>
            <span className="block font-semibold">E-posta</span>
            <span className="block text-primary group-hover:underline">{SITE.supportEmail}</span>
          </span>
        </a>
        <div className="flex gap-4 rounded-2xl border border-border bg-surface p-6">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-success-soft text-success">
            <Clock className="size-5" />
          </span>
          <span>
            <span className="block font-semibold text-fg">Yanıt süresi</span>
            <span className="block">Genellikle 24 saat içinde</span>
          </span>
        </div>
      </div>
      <section>
        <h2 className="flex items-center gap-2">
          <MessageCircleQuestion className="size-5 text-primary" /> Yazmadan önce
        </h2>
        <ul>
          <li>
            <strong>Şifreni mi unuttun?</strong> Kayıtlı e-posta adresinden bize yaz; doğrulamanın ardından yardımcı olalım.
          </li>
          <li>
            <strong>Hesabını silmek mi istiyorsun?</strong> Ayarlar → Hesabı sil bölümünden anında yapabilirsin.
          </li>
          <li>
            <strong>Bir hata mı buldun?</strong> Hangi sayfada, ne yaptığında olduğunu ve mümkünse bir ekran görüntüsünü eklersen çok hızlı çözeriz.
          </li>
        </ul>
      </section>
    </ProsePage>
  );
}
