# VocabMaster

Aralıklı tekrar (SRS) ile İngilizce kelime öğrenme platformu. Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Prisma 6 · PostgreSQL · Auth.js v5.

## Özellikler

- **Günlük çalışma**: tekrarı gelen kelimeler + seviyeye ve ilgi alanlarına göre seçilen yeni kelimeler
- **7 çalışma modu**: kartlar, çoktan seçmeli, yazma, eşleştirme, dinleme, boşluk doldurma, konuşma (+ Pro: AI hikâye modu)
- **SM-2 tabanlı tekrar takvimi** (öğrenme adımları + aralıklı tekrar), tek kaynakta: `src/lib/srs.ts`
- **XP, seviye, günlük seri, günlük hedef ve başarımlar**; hepsi sunucuda hesaplanır (`src/server/study.ts`)
- **Hazır kütüphane** (7 kategori, A1–C2), tanım, örnek cümle ve IPA ile
- **Kendi listelerin**: elle, yapıştırarak, Excel/CSV’den (Pro) ya da metinden AI ile çıkararak
- **İstatistikler**, sıralama (haftalık/aylık/tüm zamanlar), açık/koyu tema, mobil uyumlu arayüz
- **Yönetim paneli**: kullanıcılar (plan/rol), kütüphane kelimeleri, duyurular, kuponlar, sistem ayarları (bakım modu, AI, kayıtlar)

## Kurulum

```bash
npm install
cp .env.example .env      # DATABASE_URL ve AUTH_SECRET'i doldur
npm run db:push           # şemayı veritabanına uygula
npm run db:seed           # kütüphane kelimeleri ve başarımlar
npm run dev
```

İlk admin hesabı için kayıt olduktan sonra veritabanında ilgili kullanıcının `role` alanını `ADMIN` yap.

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Prisma client + şema senkronu + production build |
| `npm test` | Birim testleri (Vitest) |
| `npm run typecheck` / `npm run lint` | Tip ve lint kontrolleri |
| `npm run db:seed` | Kütüphaneyi günceller. Tekrar tekrar çalıştırılabilir; kelimeleri yerinde günceller, hiçbir şey silmez |

## Proje yapısı

```
src/
  app/
    (marketing)/   tanıtım sayfaları, fiyatlar, yasal sayfalar
    (auth)/        giriş / kayıt
    (app)/         giriş yapmış kullanıcı alanı (panel, çalışma, listeler, kütüphane…)
    admin/         yönetim paneli
    api/           route handler'lar (zod ile doğrulama, tek tip hata cevapları)
  components/      ui/ (tasarım sistemi), study/ (çalışma motoru + modlar), app/, marketing/, charts/
  lib/             istemci + sunucu ortak saf mantık (srs, levels, dates, plans, schemas)
  server/          yalnızca sunucu: auth, oturum yardımcıları, çalışma/istatistik servisleri, AI
prisma/
  schema.prisma
  seed.ts, words/  kütüphane içeriği
```

## Notlar

- **Gün sınırları Türkiye saatine göre** hesaplanır (seri, günlük hedef, grafikler): `src/lib/dates.ts`.
- **Build sırasında `prisma db push`** çalışır; veri kaybına yol açacak bir şema değişikliğinde build bilerek durur.
- **Ödeme altyapısı henüz bağlı değil.** Pro üyelik şimdilik yönetim panelinden tanımlanır.
