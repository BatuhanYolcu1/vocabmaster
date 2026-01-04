'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('E-posta veya şifre hatalı');
            } else {
                router.push('/');
                router.refresh();
            }
        } catch {
            setError('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0f17] text-white font-['Lexend'] relative flex items-center justify-center px-4">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#135bec]/20 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/15 blur-[100px]" />
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

                {/* Login Card */}
                <div className="glass-panel rounded-3xl p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Tekrar Hoş Geldin!</h2>
                        <p className="text-[#92a4c9] text-sm">Öğrenmeye kaldığın yerden devam et</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

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

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-[#92a4c9] cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded bg-white/5 border-white/10 text-[#135bec] focus:ring-[#135bec]/20" />
                                Beni hatırla
                            </label>
                            <Link href="/forgot-password" className="text-[#135bec] hover:text-blue-400 transition-colors">
                                Şifremi unuttum
                            </Link>
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
                                    <span>Giriş Yap</span>
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-[#92a4c9] text-xs">veya</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Social Login */}
                    <button
                        onClick={() => signIn('google', { callbackUrl: '/' })}
                        className="w-full h-12 rounded-xl glass-button text-white font-medium flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google ile devam et
                    </button>

                    {/* Register Link */}
                    <p className="text-center text-[#92a4c9] text-sm mt-6">
                        Hesabın yok mu?{' '}
                        <Link href="/register" className="text-[#135bec] hover:text-blue-400 font-medium transition-colors">
                            Ücretsiz kaydol
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
