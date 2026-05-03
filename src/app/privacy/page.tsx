export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#0b0f17] text-white relative">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#135bec]/15 blur-[120px]" />
            </div>
            <div className="relative z-10 max-w-3xl mx-auto px-4 py-16">
                <h1 className="text-4xl font-black mb-8">Gizlilik Politikası</h1>
                <div className="prose prose-invert prose-sm max-w-none space-y-6 text-[#c4d0e4] leading-relaxed">
                    <p className="text-[#8b9bb4] text-sm">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
                    <h2 className="text-xl font-bold text-white mt-8">1. Toplanan Veriler</h2>
                    <p>VocabMaster, hizmetlerini sunabilmek için aşağıdaki kişisel verileri toplar: Ad-soyad, e-posta adresi, öğrenme istatistikleri ve uygulama kullanım verileri. Google ile giriş yapılması halinde Google profil bilgileri.</p>
                    <h2 className="text-xl font-bold text-white mt-8">2. Verilerin Kullanımı</h2>
                    <p>Toplanan veriler, kişiselleştirilmiş öğrenme deneyimi sunmak, hizmet kalitesini artırmak, istatistiksel analizler yapmak ve yasal yükümlülükleri yerine getirmek amacıyla kullanılır.</p>
                    <h2 className="text-xl font-bold text-white mt-8">3. Veri Güvenliği</h2>
                    <p>Kişisel verileriniz SSL/TLS şifreleme ile korunur. Şifreler bcrypt algoritması ile hash&apos;lenir. Verilerimiz güvenli bulut sunucularında barındırılır.</p>
                    <h2 className="text-xl font-bold text-white mt-8">4. KVKK Hakları</h2>
                    <p>6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında; verilerinize erişim, düzeltme, silme ve aktarım talep etme haklarına sahipsiniz. Taleplerinizi info@vocabmaster.app adresine iletebilirsiniz.</p>
                    <h2 className="text-xl font-bold text-white mt-8">5. Çerezler</h2>
                    <p>Oturum yönetimi ve kullanıcı tercihleri için teknik çerezler kullanılır. Analitik çerezler yalnızca izninizle etkinleştirilir.</p>
                    <h2 className="text-xl font-bold text-white mt-8">6. Üçüncü Taraf Hizmetler</h2>
                    <p>Google Authentication, Gemini AI ve analitik hizmetleri için üçüncü taraf sağlayıcılar kullanılır. Bu sağlayıcılar kendi gizlilik politikalarına tabidir.</p>
                    <h2 className="text-xl font-bold text-white mt-8">7. İletişim</h2>
                    <p>Gizlilik ile ilgili sorularınız için: info@vocabmaster.app</p>
                </div>
            </div>
        </div>
    );
}
