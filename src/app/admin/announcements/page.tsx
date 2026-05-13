'use client';

import { useEffect, useState } from 'react';

interface Announcement {
    id: string;
    title: string;
    message: string;
    type: string;
    active: boolean;
    targetPlan: string | null;
    expiresAt: string | null;
    createdAt: string;
}

export default function AdminAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info',
        targetPlan: '',
        active: true,
    });
    const [saving, setSaving] = useState(false);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/announcements');
            if (res.ok) setAnnouncements(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAnnouncements(); }, []);

    const handleSubmit = async () => {
        if (!formData.title.trim() || !formData.message.trim()) return;
        setSaving(true);
        try {
            const data = {
                ...formData,
                targetPlan: formData.targetPlan || null,
            };
            const res = await fetch('/api/admin/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                setShowAdd(false);
                setFormData({ title: '', message: '', type: 'info', targetPlan: '', active: true });
                fetchAnnouncements();
            }
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const toggleActive = async (announcement: Announcement) => {
        try {
            const res = await fetch('/api/admin/announcements', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: announcement.id, active: !announcement.active }),
            });
            if (res.ok) fetchAnnouncements();
        } catch (e) { console.error(e); }
    };

    const deleteAnnouncement = async (id: string) => {
        if (!confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return;
        try {
            await fetch('/api/admin/announcements', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            fetchAnnouncements();
        } catch (e) { console.error(e); }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-amber-400">campaign</span>
                        Duyurular
                    </h1>
                    <p className="text-[#8b9bb4] mt-1">Kullanıcılara banner bildirimleri gönderin</p>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#135bec] to-blue-600 text-white font-bold text-sm flex items-center gap-2 hover:shadow-[0_0_20px_rgba(19,91,236,0.4)] transition-all"
                >
                    <span className="material-symbols-outlined text-lg">{showAdd ? 'close' : 'add'}</span>
                    {showAdd ? 'İptal' : 'Yeni Duyuru'}
                </button>
            </div>

            {/* Add Form */}
            {showAdd && (
                <div className="bg-[#111827]/60 border border-white/10 rounded-2xl p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#8b9bb4] uppercase tracking-wider mb-2">Başlık</label>
                            <input
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Örn: Yeni Özellik Eklendi!"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#135bec]/50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#8b9bb4] uppercase tracking-wider mb-2">Mesaj</label>
                            <textarea
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Duyuru detayları..."
                                rows={3}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#135bec]/50 resize-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#8b9bb4] uppercase tracking-wider mb-2">Tip</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none"
                                >
                                    <option value="info">Bilgi (Mavi)</option>
                                    <option value="success">Başarı (Yeşil)</option>
                                    <option value="warning">Uyarı (Sarı)</option>
                                    <option value="promo">Promosyon (Mor)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#8b9bb4] uppercase tracking-wider mb-2">Hedef Kitle</label>
                                <select
                                    value={formData.targetPlan}
                                    onChange={e => setFormData({ ...formData, targetPlan: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none"
                                >
                                    <option value="">Tüm Kullanıcılar</option>
                                    <option value="FREE">Sadece Free</option>
                                    <option value="LITE">Sadece Lite</option>
                                    <option value="PRO">Sadece Pro</option>
                                </select>
                            </div>
                        </div>
                        <div className="pt-2">
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="px-6 py-3 rounded-xl bg-[#135bec] text-white font-bold text-sm disabled:opacity-50"
                            >
                                {saving ? 'Kaydediliyor...' : 'Yayınla'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
                ) : announcements.length === 0 ? (
                    <div className="text-center py-12 text-[#8b9bb4] bg-[#111827]/60 border border-white/5 rounded-2xl">
                        Henüz duyuru bulunmuyor.
                    </div>
                ) : (
                    announcements.map(a => (
                        <div key={a.id} className={`bg-[#111827]/60 border ${a.active ? 'border-white/10' : 'border-red-500/20 opacity-60'} rounded-2xl p-5 flex items-start gap-4 transition-all`}>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                a.type === 'info' ? 'bg-blue-500/20 text-blue-400' :
                                a.type === 'success' ? 'bg-green-500/20 text-green-400' :
                                a.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-purple-500/20 text-purple-400'
                            }`}>
                                <span className="material-symbols-outlined text-[24px]">
                                    {a.type === 'info' ? 'info' : a.type === 'success' ? 'check_circle' : a.type === 'warning' ? 'warning' : 'stars'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-white font-bold text-lg truncate pr-4">{a.title}</h3>
                                    <div className="flex gap-2 shrink-0">
                                        <button onClick={() => toggleActive(a)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${a.active ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}>
                                            {a.active ? 'Gizle' : 'Yayınla'}
                                        </button>
                                        <button onClick={() => deleteAnnouncement(a.id)} className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[#8b9bb4] text-sm mb-3">{a.message}</p>
                                <div className="flex gap-3 text-xs font-medium">
                                    <span className="bg-white/5 text-[#8b9bb4] px-2.5 py-1 rounded-md border border-white/5">
                                        {a.targetPlan ? `Sadece ${a.targetPlan}` : 'Tüm Kullanıcılar'}
                                    </span>
                                    <span className="bg-white/5 text-[#8b9bb4] px-2.5 py-1 rounded-md border border-white/5 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                                        {new Date(a.createdAt).toLocaleDateString('tr-TR')}
                                    </span>
                                    {!a.active && (
                                        <span className="bg-red-500/10 text-red-400 px-2.5 py-1 rounded-md border border-red-500/20">
                                            Pasif
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
