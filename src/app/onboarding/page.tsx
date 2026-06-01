'use client';

import { ArrowRight, CheckCircle, Rocket } from 'lucide-react';
import { Icon } from '@/components/Icon';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const levels = [
    { id: 'A1', label: 'Başlangıç', desc: 'Temel kelimeler ve cümleler', emoji: '🌱', color: 'from-emerald-400 to-green-600' },
    { id: 'A2', label: 'Temel', desc: 'Günlük yaşam kelimeleri', emoji: '🌿', color: 'from-teal-400 to-emerald-600' },
    { id: 'B1', label: 'Orta', desc: 'Genel konuşma seviyesi', emoji: '🌳', color: 'from-blue-400 to-cyan-600' },
    { id: 'B2', label: 'Orta Üst', desc: 'Akademik ve iş İngilizcesi', emoji: '🚀', color: 'from-[#135bec] to-blue-600' },
    { id: 'C1', label: 'İleri', desc: 'Akıcı konuşma ve yazma', emoji: '⭐', color: 'from-purple-500 to-fuchsia-600' },
    { id: 'C2', label: 'Uzman', desc: 'Neredeyse ana dil seviyesi', emoji: '👑', color: 'from-amber-400 to-orange-600' },
];

const dailyGoals = [
    { value: 5, label: 'Rahat', desc: '5 kelime/gün', emoji: '🐢', time: '~3 dk' },
    { value: 10, label: 'Normal', desc: '10 kelime/gün', emoji: '🏃', time: '~5 dk' },
    { value: 20, label: 'Ciddi', desc: '20 kelime/gün', emoji: '🔥', time: '~10 dk' },
    { value: 30, label: 'Yoğun', desc: '30 kelime/gün', emoji: '💪', time: '~15 dk' },
];

const interests = [
    { id: 'Genel', label: 'Genel', icon: 'language', color: 'from-blue-400 to-cyan-500' },
    { id: 'İş', label: 'İş & Kariyer', icon: 'business_center', color: 'from-indigo-400 to-blue-600' },
    { id: 'Akademik', label: 'Akademik', icon: 'school', color: 'from-purple-400 to-violet-600' },
    { id: 'Seyahat', label: 'Seyahat', icon: 'flight', color: 'from-cyan-400 to-teal-600' },
    { id: 'Teknoloji', label: 'Teknoloji', icon: 'computer', color: 'from-emerald-400 to-green-600' },
    { id: 'Sağlık', label: 'Sağlık', icon: 'health_and_safety', color: 'from-rose-400 to-pink-600' },
];

export default function OnboardingPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [selectedLevel, setSelectedLevel] = useState('B1');
    const [selectedGoal, setSelectedGoal] = useState(10);
    const [selectedInterests, setSelectedInterests] = useState<string[]>(['Genel']);
    const [saving, setSaving] = useState(false);

    const toggleInterest = (id: string) => {
        setSelectedInterests(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleComplete = async () => {
        setSaving(true);
        try {
            await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    level: selectedLevel,
                    dailyGoal: selectedGoal,
                    interests: selectedInterests,
                    onboardingComplete: true,
                }),
            });
            router.push('/');
        } catch {
            router.push('/');
        } finally {
            setSaving(false);
        }
    };

    const firstName = session?.user?.name?.split(' ')[0] || 'Öğrenci';

    return (
        <div className="min-h-screen bg-[#0b0f17] text-white relative flex items-center justify-center px-4 py-12">
            {/* BG */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#135bec]/15 blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-lg">
                {/* Progress */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {[1, 2, 3].map(s => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${s <= step ? 'bg-gradient-to-br from-[#135bec] to-blue-600 text-white' : 'bg-white/10 text-[#8b9bb4]'}`}>
                                {s < step ? '✓' : s}
                            </div>
                            {s < 3 && <div className={`w-12 h-0.5 rounded ${s < step ? 'bg-[#135bec]' : 'bg-white/10'}`} />}
                        </div>
                    ))}
                </div>

                {/* Step 1: Level */}
                {step === 1 && (
                    <div className="animate-fadeIn">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-black mb-2">Merhaba, {firstName}! 👋</h1>
                            <p className="text-[#8b9bb4]">İngilizce seviyen ne?</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            {levels.map(l => (
                                <button
                                    key={l.id}
                                    onClick={() => setSelectedLevel(l.id)}
                                    className={`p-4 rounded-2xl border text-left transition-all ${selectedLevel === l.id ? 'border-[#135bec] bg-[#135bec]/10 shadow-[0_0_20px_rgba(19,91,236,0.2)]' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                                >
                                    <span className="text-2xl">{l.emoji}</span>
                                    <p className="font-bold text-white mt-2">{l.id} - {l.label}</p>
                                    <p className="text-xs text-[#8b9bb4] mt-1">{l.desc}</p>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setStep(2)} className="w-full py-4 rounded-xl bg-gradient-to-r from-[#135bec] to-blue-600 text-white font-bold text-lg shadow-[0_0_20px_rgba(19,91,236,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-2">
                            Devam <ArrowRight size={20} />
                        </button>
                    </div>
                )}

                {/* Step 2: Daily Goal */}
                {step === 2 && (
                    <div className="animate-fadeIn">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-black mb-2">Günlük Hedefin 🎯</h1>
                            <p className="text-[#8b9bb4]">Her gün ne kadar çalışmak istersin?</p>
                        </div>
                        <div className="space-y-3 mb-8">
                            {dailyGoals.map(g => (
                                <button
                                    key={g.value}
                                    onClick={() => setSelectedGoal(g.value)}
                                    className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all ${selectedGoal === g.value ? 'border-[#135bec] bg-[#135bec]/10 shadow-[0_0_20px_rgba(19,91,236,0.2)]' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                                >
                                    <span className="text-3xl">{g.emoji}</span>
                                    <div className="flex-1 text-left">
                                        <p className="font-bold text-white">{g.label}</p>
                                        <p className="text-xs text-[#8b9bb4]">{g.desc} • {g.time}</p>
                                    </div>
                                    {selectedGoal === g.value && <CheckCircle size={20} className="text-[#135bec]" />}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-xl glass-button text-white font-medium">Geri</button>
                            <button onClick={() => setStep(3)} className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[#135bec] to-blue-600 text-white font-bold shadow-[0_0_20px_rgba(19,91,236,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-2">
                                Devam <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Interests */}
                {step === 3 && (
                    <div className="animate-fadeIn">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-black mb-2">İlgi Alanların 🌟</h1>
                            <p className="text-[#8b9bb4]">Hangi konularda kelime öğrenmek istiyorsun?</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            {interests.map(i => (
                                <button
                                    key={i.id}
                                    onClick={() => toggleInterest(i.id)}
                                    className={`p-4 rounded-2xl border text-center transition-all ${selectedInterests.includes(i.id) ? 'border-[#135bec] bg-[#135bec]/10 shadow-[0_0_20px_rgba(19,91,236,0.2)]' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${i.color} flex items-center justify-center mx-auto mb-2`}>
                                        <Icon name={i.icon} size={20} className="text-white" />
                                    </div>
                                    <p className="font-bold text-white text-sm">{i.label}</p>
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setStep(2)} className="flex-1 py-4 rounded-xl glass-button text-white font-medium">Geri</button>
                            <button
                                onClick={handleComplete}
                                disabled={saving || selectedInterests.length === 0}
                                className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[#135bec] to-blue-600 text-white font-bold shadow-[0_0_20px_rgba(19,91,236,0.4)] hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>Başla! <Rocket size={20} /></>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
