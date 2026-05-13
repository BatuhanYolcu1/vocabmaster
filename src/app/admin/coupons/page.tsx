'use client';

import { useEffect, useState } from 'react';

interface Coupon {
    id: string;
    code: string;
    discount: number;
    targetPlan: string;
    maxUses: number;
    usedCount: number;
    active: boolean;
    expiresAt: string | null;
    createdAt: string;
}

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discount: 50,
        targetPlan: 'LITE',
        maxUses: 100,
        active: true,
    });
    const [saving, setSaving] = useState(false);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/coupons');
            if (res.ok) setCoupons(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCoupons(); }, []);

    const handleSubmit = async () => {
        if (!formData.code.trim() || formData.discount <= 0 || formData.discount > 100) return;
        setSaving(true);
        try {
            const res = await fetch('/api/admin/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    code: formData.code.toUpperCase(),
                    discount: Number(formData.discount),
                    maxUses: Number(formData.maxUses),
                }),
            });
            if (res.ok) {
                setShowAdd(false);
                setFormData({ code: '', discount: 50, targetPlan: 'LITE', maxUses: 100, active: true });
                fetchCoupons();
            }
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const toggleActive = async (coupon: Coupon) => {
        try {
            const res = await fetch('/api/admin/coupons', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: coupon.id, active: !coupon.active }),
            });
            if (res.ok) fetchCoupons();
        } catch (e) { console.error(e); }
    };

    const deleteCoupon = async (id: string) => {
        if (!confirm('Bu kuponu silmek istediğinize emin misiniz?')) return;
        try {
            await fetch('/api/admin/coupons', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            fetchCoupons();
        } catch (e) { console.error(e); }
    };

    const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        setFormData(prev => ({ ...prev, code }));
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-emerald-400">local_activity</span>
                        Kuponlar
                    </h1>
                    <p className="text-[#8b9bb4] mt-1">İndirim kodları ve kampanya yönetimi</p>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm flex items-center gap-2 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                >
                    <span className="material-symbols-outlined text-lg">{showAdd ? 'close' : 'add'}</span>
                    {showAdd ? 'İptal' : 'Yeni Kupon'}
                </button>
            </div>

            {/* Add Form */}
            {showAdd && (
                <div className="bg-[#111827]/60 border border-emerald-500/20 rounded-2xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-[#8b9bb4] uppercase tracking-wider mb-2">Kupon Kodu</label>
                            <div className="relative">
                                <input
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="Örn: YAZ50"
                                    className="w-full px-4 py-3 pr-10 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 uppercase"
                                />
                                <button onClick={generateRandomCode} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8b9bb4] hover:text-white" title="Rastgele Üret">
                                    <span className="material-symbols-outlined text-[18px]">casino</span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#8b9bb4] uppercase tracking-wider mb-2">İndirim (%)</label>
                            <input
                                type="number"
                                min="1" max="100"
                                value={formData.discount}
                                onChange={e => setFormData({ ...formData, discount: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#8b9bb4] uppercase tracking-wider mb-2">Geçerli Plan</label>
                            <select
                                value={formData.targetPlan}
                                onChange={e => setFormData({ ...formData, targetPlan: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none"
                            >
                                <option value="LITE">Lite Planı</option>
                                <option value="PRO">Pro Planı</option>
                                <option value="ALL">Tüm Ücretli Planlar</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#8b9bb4] uppercase tracking-wider mb-2">Kullanım Limiti</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.maxUses}
                                onChange={e => setFormData({ ...formData, maxUses: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm disabled:opacity-50"
                    >
                        {saving ? 'Oluşturuluyor...' : 'Kuponu Oluştur'}
                    </button>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />
                    ))
                ) : coupons.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-[#8b9bb4] bg-[#111827]/60 border border-white/5 rounded-2xl">
                        Henüz kupon bulunmuyor.
                    </div>
                ) : (
                    coupons.map(c => {
                        const isExhausted = c.usedCount >= c.maxUses;
                        const statusColor = !c.active || isExhausted ? 'border-red-500/20 bg-red-500/5' : 'border-emerald-500/30 bg-emerald-500/5';
                        
                        return (
                            <div key={c.id} className={`bg-[#111827]/80 border ${statusColor} rounded-2xl p-5 relative overflow-hidden group transition-all`}>
                                {/* Decorative circle */}
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full" />
                                <div className="absolute -right-8 top-8 w-16 h-16 bg-white/5 rounded-full" />
                                
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="inline-block px-3 py-1 rounded bg-white/10 font-mono text-white text-lg font-bold tracking-widest border border-white/10 border-dashed">
                                                {c.code}
                                            </div>
                                            <div className="mt-2 text-3xl font-black text-emerald-400">%{c.discount} <span className="text-sm font-medium text-[#8b9bb4] uppercase tracking-wider ml-1">İndirim</span></div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => toggleActive(c)} className="w-8 h-8 rounded-lg bg-white/10 text-white hover:bg-white/20 flex items-center justify-center" title={c.active ? 'Pasif Yap' : 'Aktif Yap'}>
                                                <span className="material-symbols-outlined text-[16px]">{c.active ? 'visibility_off' : 'visibility'}</span>
                                            </button>
                                            <button onClick={() => deleteCoupon(c.id)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-end border-t border-white/5 pt-4 mt-2">
                                        <div>
                                            <p className="text-xs text-[#8b9bb4] mb-1">Geçerli Plan</p>
                                            <p className={`text-sm font-bold ${c.targetPlan === 'PRO' ? 'text-purple-400' : 'text-[#135bec]'}`}>
                                                {c.targetPlan === 'ALL' ? 'Lite & Pro' : c.targetPlan}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-[#8b9bb4] mb-1">Kullanım</p>
                                            <p className="text-sm font-bold text-white">
                                                <span className={isExhausted ? 'text-red-400' : 'text-emerald-400'}>{c.usedCount}</span> / {c.maxUses}
                                            </p>
                                        </div>
                                    </div>

                                    {!c.active && (
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-20 flex items-center justify-center">
                                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">Pasif</span>
                                            <div className="absolute top-4 right-4 flex gap-1">
                                                <button onClick={() => toggleActive(c)} className="w-8 h-8 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 flex items-center justify-center shadow-lg">
                                                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                                                </button>
                                                <button onClick={() => deleteCoupon(c.id)} className="w-8 h-8 rounded-lg bg-red-500 text-white hover:bg-red-600 flex items-center justify-center shadow-lg">
                                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
