'use client';

import { useEffect, useState } from 'react';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/settings');
            if (res.ok) {
                const data = await res.json();
                const map: Record<string, string> = {};
                data.forEach((s: any) => map[s.key] = s.value);
                setSettings(map);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchSettings(); }, []);

    const saveSetting = async (key: string, value: string) => {
        setSaving(key);
        try {
            await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value }),
            });
            setSettings(prev => ({ ...prev, [key]: value }));
        } catch (e) { console.error(e); }
        finally { setSaving(null); }
    };

    const toggleBooleanSetting = (key: string) => {
        const current = settings[key] === 'true';
        saveSetting(key, current ? 'false' : 'true');
    };

    const ConfigCard = ({ title, description, icon, children }: any) => (
        <div className="bg-[#111827]/60 border border-white/5 rounded-2xl p-6">
            <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#8b9bb4]">{icon}</span>
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg">{title}</h3>
                    <p className="text-[#8b9bb4] text-sm">{description}</p>
                </div>
            </div>
            {children}
        </div>
    );

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-white/5 rounded-xl w-48 animate-pulse mb-8" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400">settings</span>
                    Sistem Ayarları
                </h1>
                <p className="text-[#8b9bb4] mt-1">Platform geneli yapılandırmalar</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Settings */}
                <ConfigCard title="Yapay Zeka (AI) Modülü" description="Hikaye ve kelime üretimi ayarları" icon="smart_toy">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                        <div>
                            <p className="text-white font-medium">AI Servisi Aktif</p>
                            <p className="text-[#8b9bb4] text-xs">Kapatılırsa kullanıcılar AI özellikleri kullanamaz</p>
                        </div>
                        <button
                            onClick={() => toggleBooleanSetting('AI_ENABLED')}
                            disabled={saving === 'AI_ENABLED'}
                            className={`w-12 h-6 rounded-full transition-colors relative ${settings['AI_ENABLED'] !== 'false' ? 'bg-emerald-500' : 'bg-slate-600'} disabled:opacity-50`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings['AI_ENABLED'] !== 'false' ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </ConfigCard>

                {/* Maintenance */}
                <ConfigCard title="Bakım Modu" description="Siteyi geçici olarak erişime kapatın" icon="construction">
                    <div className="flex items-center justify-between p-4 bg-white/5 border border-amber-500/20 rounded-xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <p className="text-white font-medium">Bakım Modunu Aç</p>
                            <p className="text-amber-400/70 text-xs">Sadece adminler siteye erişebilir</p>
                        </div>
                        <button
                            onClick={() => toggleBooleanSetting('MAINTENANCE_MODE')}
                            disabled={saving === 'MAINTENANCE_MODE'}
                            className={`w-12 h-6 rounded-full transition-colors relative z-10 ${settings['MAINTENANCE_MODE'] === 'true' ? 'bg-amber-500' : 'bg-slate-600'} disabled:opacity-50`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings['MAINTENANCE_MODE'] === 'true' ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </ConfigCard>

                {/* Registration */}
                <ConfigCard title="Yeni Kayıtlar" description="Platforma yeni üye alımını kontrol edin" icon="person_add">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                        <div>
                            <p className="text-white font-medium">Yeni Kayıtları Kabul Et</p>
                            <p className="text-[#8b9bb4] text-xs">Kapatılırsa register sayfası kilitlenir</p>
                        </div>
                        <button
                            onClick={() => toggleBooleanSetting('REGISTRATION_ENABLED')}
                            disabled={saving === 'REGISTRATION_ENABLED'}
                            className={`w-12 h-6 rounded-full transition-colors relative ${settings['REGISTRATION_ENABLED'] !== 'false' ? 'bg-[#135bec]' : 'bg-slate-600'} disabled:opacity-50`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings['REGISTRATION_ENABLED'] !== 'false' ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </ConfigCard>

                {/* Pricing / Limits Preview */}
                <ConfigCard title="Plan Limitleri" description="Mevcut limitler kaynak koddan yönetiliyor" icon="tune">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-sm text-[#8b9bb4]">
                        Plan limitleri ve fiyatlandırmalar (₺29.99 / ₺59.99) şu anda <code className="bg-black/30 px-1 py-0.5 rounded text-amber-400 font-mono">src/lib/subscription.ts</code> dosyasında sabit (hardcoded) olarak tanımlıdır. Değiştirmek için kod güncellenmelidir.
                    </div>
                </ConfigCard>
            </div>
        </div>
    );
}
