export default function AboutPage() {
    const team = [
        { name: 'BAY Technology', role: 'Geliştirici Ekip', icon: '🚀' },
    ];

    return (
        <div className="min-h-screen bg-[#0b0f17] text-white relative">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#135bec]/15 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[100px]" />
            </div>
            <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black mb-4">Hakkımızda</h1>
                    <p className="text-[#8b9bb4] text-lg max-w-2xl mx-auto">
                        VocabMaster, dil öğrenmeyi herkes için erişilebilir, eğlenceli ve etkili hale getirmek amacıyla kurulmuştur.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="glass-panel rounded-3xl p-8">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#135bec] to-blue-600 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-white text-[28px]">visibility</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-3">Vizyonumuz</h2>
                        <p className="text-[#8b9bb4] leading-relaxed">
                            Yapay zeka ve bilimsel öğrenme yöntemlerini birleştirerek, dil öğrenme sürecini kişiselleştirilmiş ve kalıcı hale getirmek. Her bireyin potansiyeline uygun bir öğrenme deneyimi sunmak.
                        </p>
                    </div>
                    <div className="glass-panel rounded-3xl p-8">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-white text-[28px]">flag</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-3">Misyonumuz</h2>
                        <p className="text-[#8b9bb4] leading-relaxed">
                            Türk öğrencilerin ve profesyonellerin İngilizce kelime hazinelerini en verimli şekilde geliştirmelerine yardımcı olmak. Ezbere değil, anlayarak öğrenmeyi teşvik etmek.
                        </p>
                    </div>
                </div>

                <div className="glass-panel rounded-3xl p-8 text-center">
                    <h2 className="text-2xl font-bold mb-6">Rakamlarla VocabMaster</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { num: '7', label: 'Çalışma Modu' },
                            { num: '6', label: 'CEFR Seviye' },
                            { num: 'AI', label: 'Destekli' },
                            { num: '24/7', label: 'Erişim' },
                        ].map(s => (
                            <div key={s.label}>
                                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#135bec] to-purple-400">{s.num}</p>
                                <p className="text-[#8b9bb4] text-sm mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
