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
            const res = await fetch('/api/register', {
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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-[#135bec] rounded-full animate-spin" />
            </div>
        );
    }

    if (registrationEnabled === false) {
        return (
            <div className="min-h-screen bg-slate-50 text-[#0f172a] relative flex items-center justify-center px-4 py-12">
                {/* Ambient Background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-100/30 blur-[130px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/30 blur-[110px]" />
                </div>

                <div className="relative z-10 w-full max-w-md text-center">
                    <div className="flex justify-center mb-8">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#135bec] to-purple-600 shadow-[0_10px_20px_rgba(19,91,236,0.2)]">
                                <span className="material-symbols-outlined text-white text-[28px]">school</span>
                            </div>
                            <h1 className="text-2xl font-black text-[#0f172a]">VocabMaster</h1>
                        </Link>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-3xl p-8 shadow-sm">
                        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-100">
                            <span className="material-symbols-outlined text-amber-500 text-3xl">person_add_disabled</span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-[#0f172a] mb-4">Kayıtlar Geçici Olarak Kapalı</h2>
                        <p className="text-[#64748b] text-sm leading-relaxed mb-6 font-medium">
                            Platformumuza gösterdiğiniz ilgi için teşekkür ederiz. Şu anda sistem güncellemeleri nedeniyle yeni üye alımı geçici olarak askıya alınmıştır.
                        </p>
                        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">
                            <span className="material-symbols-outlined text-sm">arrow_back</span> Ana Sayfaya Dön
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-[#0f172a] relative flex items-center justify-center px-4 py-12">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-100/30 blur-[130px] animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/30 blur-[110px]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#135bec] to-purple-600 shadow-[0_10px_20px_rgba(19,91,236,0.2)]">
                            <span className="material-symbols-outlined text-white text-[28px]">school</span>
                        </div>
                        <h1 className="text-2xl font-black text-[#0f172a]">VocabMaster</h1>
                    </Link>
                </div>

                {/* Register Card */}
                <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-sm rounded-3xl p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-extrabold text-[#0f172a] mb-2">Hesap Oluştur</h2>
                        <p className="text-[#64748b] text-sm font-semibold">Kelime öğrenme yolculuğuna başla</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm text-center font-bold">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Ad Soyad</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#135bec] focus:ring-4 focus:ring-[#135bec]/10 transition-all text-sm font-medium"
                                placeholder="Ahmet Yılmaz"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#64748b]">E-posta</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#135bec] focus:ring-4 focus:ring-[#135bec]/10 transition-all text-sm font-medium"
                                placeholder="ornek@email.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Şifre</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#135bec] focus:ring-4 focus:ring-[#135bec]/10 transition-all text-sm font-medium"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Şifre Tekrar</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#135bec] focus:ring-4 focus:ring-[#135bec]/10 transition-all text-sm font-medium"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#135bec] to-blue-600 text-white font-bold shadow-[0_10px_20px_-5px_rgba(19,91,236,0.3)] hover:shadow-[0_15px_25px_-5px_rgba(19,91,236,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Kayıt Ol</span>
                                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Agreement */}
                    <p className="text-[#64748b] text-xs text-center mt-6 font-semibold">
                        Kayıt olarak{' '}
                        <Link href="/terms" className="text-[#135bec] hover:underline font-bold">Kullanım Koşulları</Link>
                        {' '}ve{' '}
                        <Link href="/privacy" className="text-[#135bec] hover:underline font-bold">Gizlilik Politikası</Link>
                        &apos;nı kabul etmiş olursun.
                    </p>

                    {/* Login Link */}
                    <p className="text-center text-[#64748b] text-sm mt-6 font-semibold">
                        Zaten hesabın var mı?{' '}
                        <Link href="/login" className="text-[#135bec] hover:underline font-bold transition-colors">
                            Giriş yap
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
