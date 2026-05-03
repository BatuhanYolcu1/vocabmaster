export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#0b0f17] text-white relative">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#135bec]/15 blur-[120px]" />
            </div>
            <div className="relative z-10 max-w-3xl mx-auto px-4 py-16">
                <h1 className="text-4xl font-black mb-8">Kullanım Koşulları</h1>
                <div className="prose prose-invert prose-sm max-w-none space-y-6 text-[#c4d0e4] leading-relaxed">
                    <p className="text-[#8b9bb4] text-sm">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
                    <h2 className="text-xl font-bold text-white mt-8">1. Hizmet Tanımı</h2>
                    <p>VocabMaster, BAY Technology tarafından geliştirilen yapay zeka destekli bir kelime öğrenme platformudur. Platform, web tarayıcısı ve PWA üzerinden erişilebilir.</p>
                    <h2 className="text-xl font-bold text-white mt-8">2. Hesap Oluşturma</h2>
                    <p>Platforma kayıt olmak için geçerli bir e-posta adresi gereklidir. Hesap bilgilerinizin güvenliğinden siz sorumlusunuz. 13 yaş altı kullanıcılar veli izni ile kayıt olabilir.</p>
                    <h2 className="text-xl font-bold text-white mt-8">3. Kullanım Kuralları</h2>
                    <p>Platformu yasa dışı amaçlarla kullanmak, diğer kullanıcıların deneyimini olumsuz etkilemek, sistemi kötüye kullanmak veya otomatik araçlarla veri çekmek yasaktır.</p>
                    <h2 className="text-xl font-bold text-white mt-8">4. Abonelik ve Ödeme</h2>
                    <p>Ücretli planlar aylık veya yıllık olarak faturalandırılır. İptal işlemi mevcut dönem sonunda geçerli olur. İade politikası 14 gün içinde geçerlidir.</p>
                    <h2 className="text-xl font-bold text-white mt-8">5. Fikri Mülkiyet</h2>
                    <p>Platform, tasarım, kod ve içerik BAY Technology&apos;nin fikri mülkiyetidir. Kullanıcılar tarafından oluşturulan kelime listeleri kullanıcıya aittir.</p>
                    <h2 className="text-xl font-bold text-white mt-8">6. Sorumluluk Reddi</h2>
                    <p>Platform &quot;olduğu gibi&quot; sunulmaktadır. Öğrenme sonuçları garanti edilmez. Teknik aksaklıklardan kaynaklanan veri kayıplarından sorumluluk kabul edilmez.</p>
                    <h2 className="text-xl font-bold text-white mt-8">7. Değişiklikler</h2>
                    <p>Bu koşullar önceden bildirim yapılarak değiştirilebilir. Değişiklikler sonrası platformu kullanmaya devam etmeniz, yeni koşulları kabul ettiğiniz anlamına gelir.</p>
                </div>
            </div>
        </div>
    );
}
