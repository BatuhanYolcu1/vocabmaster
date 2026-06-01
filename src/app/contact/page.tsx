'use client';

import { CheckCircle, Clock, Mail, Send } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: integrate with email service
        setSent(true);
    };

    return (
        <div className="min-h-screen bg-[#0b0f17] text-white relative">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#135bec]/15 blur-[120px]" />
            </div>
            <div className="relative z-10 max-w-2xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black mb-4">İletişim</h1>
                    <p className="text-[#8b9bb4]">Sorularınız, önerileriniz veya geri bildirimleriniz için bize ulaşın.</p>
                </div>

                {sent ? (
                    <div className="glass-panel rounded-3xl p-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} className="text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3">Mesajınız Gönderildi!</h2>
                        <p className="text-[#8b9bb4]">En kısa sürede size geri dönüş yapacağız.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-8 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#92a4c9]">Ad Soyad</label>
                                <input
                                    type="text" required value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#92a4c9]/50 focus:outline-none focus:border-[#135bec]/50 transition-all"
                                    placeholder="Adınız"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#92a4c9]">E-posta</label>
                                <input
                                    type="email" required value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#92a4c9]/50 focus:outline-none focus:border-[#135bec]/50 transition-all"
                                    placeholder="ornek@email.com"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#92a4c9]">Konu</label>
                            <input
                                type="text" required value={form.subject}
                                onChange={e => setForm({ ...form, subject: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#92a4c9]/50 focus:outline-none focus:border-[#135bec]/50 transition-all"
                                placeholder="Konu başlığı"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#92a4c9]">Mesajınız</label>
                            <textarea
                                required rows={5} value={form.message}
                                onChange={e => setForm({ ...form, message: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#92a4c9]/50 focus:outline-none focus:border-[#135bec]/50 transition-all resize-none"
                                placeholder="Mesajınızı yazın..."
                            />
                        </div>
                        <button type="submit" className="w-full h-12 rounded-xl bg-gradient-to-r from-[#135bec] to-blue-600 text-white font-bold shadow-[0_0_20px_rgba(19,91,236,0.4)] hover:shadow-[0_0_30px_rgba(19,91,236,0.6)] transition-all flex items-center justify-center gap-2">
                            <Send size={20} />
                            Gönder
                        </button>
                    </form>
                )}

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#135bec]/20 flex items-center justify-center text-[#135bec]">
                            <Mail size={20} />
                        </div>
                        <div>
                            <p className="text-white font-medium text-sm">E-posta</p>
                            <p className="text-[#8b9bb4] text-sm">info@vocabmaster.app</p>
                        </div>
                    </div>
                    <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-white font-medium text-sm">Yanıt Süresi</p>
                            <p className="text-[#8b9bb4] text-sm">24 saat içinde</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
