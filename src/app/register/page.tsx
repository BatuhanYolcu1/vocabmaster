'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [registrationEnabled, setRegistrationEnabled] = useState<boolean | null>(null);

    useEffect(() => {
        async function checkStatus() {
            try {
                const res = await fetch('/api/register');
                if (res.ok) {
                    const data = await res.json();
                    setRegistrationEnabled(data.registrationEnabled);
                } else {
                    setRegistrationEnabled(true);
                }
            } catch {
                setRegistrationEnabled(true);
            }
        }
        checkStatus();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Şifreler eşleşmiyor');
            return;
        }

        if (password.length < 6) {
            setError('Şifre en az 6 karakter olmalı');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/register', { // Using correct register endpoint /api/register
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            if (res.ok) {
                router.push('/login?registered=true');
            } else {
                const data = await res.json();
                setError(data.error || 'Kayıt başarısız');
            }
        } catch {
            setError('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    if (registrationEnabled === null) {
        return (
            <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-[#135bec] rounded-full animate-spin" />
            </div>
        );
    }

    if (registrationEnabled === false) {
        return (
            <div className="min-h-screen bg-[#0b0f17] text-white relative flex items-center justify-center px-4 py-12">
                {/* Ambient Background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#135bec]/15 blur-[100px]" />
                </div>

                <div className="relative z-10 w-full max-w-md text-center">
                    <div className="flex justify-center mb-8">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#135bec] to-purple-600 shadow-[0_0_30px_rgba(19,91,236,0.5)]">
                                <span className="material-symbols-outlined text-white text-[28px]">school</span>
                            </div>
                            <h1 className="text-2xl font-bold text-white">VocabMaster</h1>
                        </Link>
                    </div>

                    <div className="glass-panel rounded-3xl p-8 border border-amber-500/20">
                        <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-amber-500 text-3xl">person_add_disabled</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Kayıtlar Geçici Olarak Kapalı</h2>
                        <p className="text-[#92a4c9] text-sm leading-relaxed mb-6">
                            Platformumuza gösterdiğiniz ilgi için teşekkür ederiz. Şu anda sistem güncellemeleri nedeniyle yeni üye alımı geçici olarak askıya alınmıştır.
                        </p>
                        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 hover:text-white transition-all">
                            <span className="material-symbols-outlined text-sm">arrow_back</span> Ana Sayfaya Dön
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b0f17] text-white relative flex items-center justify-center px-4 py-12">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#135bec]/15 blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#135bec] to-purple-600 shadow-[0_0_30px_rgba(19,91,236,0.5)]">
                            <span className="material-symbols-outlined text-white text-[28px]">school</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white">VocabMaster</h1>
                    </Link>
                </div>

                {/* Register Card */}
                <div className="glass-panel rounded-3xl p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Hesap Oluştur</h2>
                        <p className="text-[#92a4c9] text-sm">Kelime öğrenme yolculuğuna başla</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#92a4c9]">Ad Soyad</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#92a4c9]/50 focus:outline-none focus:border-[#135bec]/50 focus:ring-2 focus:ring-[#135bec]/20 transition-all"
                                placeholder="Ahmet Yılmaz"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#92a4c9]">E-posta</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#92a4c9]/50 focus:outline-none focus:border-[#135bec]/50 focus:ring-2 focus:ring-[#135bec]/20 transition-all"
                                placeholder="ornek@email.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#92a4c9]">Şifre</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#92a4c9]/50 focus:outline-none focus:border-[#135bec]/50 focus:ring-2 focus:ring-[#135bec]/20 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[#92a4c9]">Şifre Tekrar</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[#92a4c9]/50 focus:outline-none focus:border-[#135bec]/50 focus:ring-2 focus:ring-[#135bec]/20 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#135bec] to-blue-600 text-white font-bold shadow-[0_0_20px_rgba(19,91,236,0.4)] hover:shadow-[0_0_30px_rgba(19,91,236,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Kayıt Ol</span>
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Agreement */}
                    <p className="text-[#92a4c9] text-xs text-center mt-6">
                        Kayıt olarak{' '}
                        <Link href="/terms" className="text-[#135bec] hover:underline">Kullanım Koşulları</Link>
                        {' '}ve{' '}
                        <Link href="/privacy" className="text-[#135bec] hover:underline">Gizlilik Politikası</Link>
                        &apos;nı kabul etmiş olursun.
                    </p>

                    {/* Login Link */}
                    <p className="text-center text-[#92a4c9] text-sm mt-6">
                        Zaten hesabın var mı?{' '}
                        <Link href="/login" className="text-[#135bec] hover:text-blue-400 font-medium transition-colors">
                            Giriş yap
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
