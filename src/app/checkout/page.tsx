'use client';

import { ArrowLeft, CheckCircle, Lock, Tag } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CheckoutPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Plan parameters
    const planParam = (searchParams.get('plan') || 'lite').toUpperCase();
    const annualParam = searchParams.get('annual') === 'true';

    const plan = planParam === 'PRO' ? 'PRO' : 'LITE';
    const period = annualParam ? 'yearly' : 'monthly';

    // Pricing calculation
    const baseMonthlyPrice = plan === 'PRO' ? 59.99 : 29.99;
    const basePrice = annualParam ? (baseMonthlyPrice * 12 * 0.8) : baseMonthlyPrice;

    // States
    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');
    const [discountPercent, setDiscountPercent] = useState(0);
    const [validCoupon, setValidCoupon] = useState('');

    // Card Input States
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [isFlipped, setIsFlipped] = useState(false);

    // Form submission states
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentStep, setPaymentStep] = useState(0); // 0: input, 1: card check, 2: bank connection, 3: activating, 4: success
    const [paymentError, setPaymentError] = useState('');

    useEffect(() => {
        if (status === 'loading') return;
        if (!session) {
            router.push(`/login?callbackUrl=/checkout?plan=${plan.toLowerCase()}&annual=${annualParam}`);
        }
    }, [session, status, router, plan, annualParam]);

    // Format Card Number (adds spaces)
    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);
        const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
        setCardNumber(formatted);
    };

    // Format Expiry Date (adds slash)
    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        if (value.length >= 3) {
            value = `${value.slice(0, 2)}/${value.slice(2)}`;
        }
        setCardExpiry(value);
    };

    // Format CVV (numbers only, max 3)
    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 3) value = value.slice(0, 3);
        setCardCvv(value);
    };

    // Determine Card Brand
    const getCardBrand = () => {
        if (cardNumber.startsWith('4')) return 'Visa';
        if (cardNumber.startsWith('5')) return 'Mastercard';
        return 'Card';
    };

    // Coupon verification
    const handleApplyCoupon = async () => {
        setCouponError('');
        setCouponSuccess('');
        if (!couponCode.trim()) return;

        try {
            const res = await fetch('/api/checkout/validate-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode, plan }),
            });

            const data = await res.json();
            if (res.ok && data.valid) {
                setDiscountPercent(data.discountPercent);
                setValidCoupon(data.code);
                setCouponSuccess(`Başarılı! %${data.discountPercent} indirim uygulandı.`);
            } else {
                setCouponError(data.error || 'Geçersiz kupon kodu');
                setDiscountPercent(0);
                setValidCoupon('');
            }
        } catch {
            setCouponError('Kupon doğrulanırken hata oluştu.');
        }
    };

    // Calculation variables
    const discountAmount = basePrice * (discountPercent / 100);
    const finalPrice = basePrice - discountAmount;

    // Checkout submission
    const handleCheckoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPaymentError('');

        // Basic client validation
        if (cardNumber.replace(/\s/g, '').length !== 16) {
            setPaymentError('Lütfen geçerli bir 16 haneli kart numarası girin.');
            return;
        }
        if (cardExpiry.length !== 5) {
            setPaymentError('Lütfen geçerli bir son kullanma tarihi girin (AA/YY).');
            return;
        }
        if (cardCvv.length !== 3) {
            setPaymentError('Lütfen geçerli bir 3 haneli CVC/CVV kodu girin.');
            return;
        }
        if (!cardName.trim()) {
            setPaymentError('Lütfen kart sahibinin adını girin.');
            return;
        }

        setPaymentLoading(true);
        setPaymentStep(1);

        // Step 1: Card verification (Simulated)
        setTimeout(() => {
            setPaymentStep(2);
            // Step 2: Bank connection (Simulated)
            setTimeout(() => {
                setPaymentStep(3);
                // Step 3: Activating subscription in DB
                fetch('/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        plan,
                        period,
                        couponCode: validCoupon || undefined,
                    }),
                })
                    .then(async (res) => {
                        if (res.ok) {
                            setPaymentStep(4);
                            // Refresh page or push to home after success
                            setTimeout(() => {
                                window.location.href = '/';
                            }, 2500);
                        } else {
                            const errData = await res.json();
                            throw new Error(errData.error || 'Ödeme tamamlanamadı.');
                        }
                    })
                    .catch((err) => {
                        setPaymentStep(0);
                        setPaymentLoading(false);
                        setPaymentError(err.message || 'Ödeme servisinde bir sunucu hatası oluştu.');
                    });
            }, 1500);
        }, 1500);
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-[#135bec] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b0f17] text-white relative py-12 px-4">
            {/* Background lighting */}
            <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#135bec]/15 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />

            <div className="max-w-5xl mx-auto z-10 relative">
                {/* Header */}
                <div className="mb-10 flex items-center gap-4">
                    <Link href="/pricing" className="p-2 rounded-xl glass-button text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-white">Güvenli Ödeme</h1>
                        <p className="text-[#8b9bb4] text-sm">Aboneliğinizi saniyeler içinde tamamlayın</p>
                    </div>
                </div>

                {paymentStep > 0 && paymentStep < 4 ? (
                    /* Checkout Processing Screen */
                    <div className="glass-panel p-16 rounded-[2rem] text-center max-w-xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
                        <div className="relative w-24 h-24 mb-8">
                            <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 animate-spin" />
                            <div className="absolute inset-4 rounded-full bg-[#135bec]/10 flex items-center justify-center text-cyan-400">
                                <Lock size={32} className="animate-pulse" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Ödemeniz Güvenle İşleniyor</h3>
                        <p className="text-[#8b9bb4] text-sm max-w-xs mx-auto animate-pulse">
                            {paymentStep === 1 && 'Kart bilgileri doğrulanıyor...'}
                            {paymentStep === 2 && 'Banka güvenli bağlantısı kuruluyor...'}
                            {paymentStep === 3 && 'Aboneliğiniz aktif ediliyor...'}
                        </p>
                    </div>
                ) : paymentStep === 4 ? (
                    /* Success Screen */
                    <div className="glass-panel p-16 rounded-[2rem] text-center max-w-xl mx-auto flex flex-col items-center justify-center min-h-[400px] border-emerald-500/20">
                        {/* Sparkle effect */}
                        <div className="relative w-24 h-24 mb-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                            <CheckCircle size={48} className="text-emerald-400 animate-bounce" />
                            {/* Confetti simulation circles */}
                            <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                            <div className="absolute bottom-2 left-0 w-3 h-3 bg-purple-500 rounded-full animate-ping" />
                        </div>
                        <h3 className="text-3xl font-black text-white mb-2">Tebrikler! 🎉</h3>
                        <p className="text-[#8b9bb4] text-lg font-light max-w-xs mx-auto mb-4">
                            Artık bir <span className={`font-black ${plan === 'PRO' ? 'text-purple-400' : 'text-blue-400'}`}>{plan}</span> üyesiniz!
                        </p>
                        <p className="text-xs text-slate-500">Ana sayfaya yönlendiriliyorsunuz...</p>
                    </div>
                ) : (
                    /* General Checkout Layout */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Side: Card & Form Details */}
                        <div className="lg:col-span-7 space-y-8">
                            {/* Interactive Credit Card UI */}
                            <div className="flex justify-center py-2 perspective">
                                <div className={`relative w-[340px] h-[210px] rounded-2xl transition-transform duration-700 preserve-3d shadow-2xl ${isFlipped ? 'rotate-y-180' : ''}`}>
                                    
                                    {/* Front Side */}
                                    <div className="absolute inset-0 w-full h-full rounded-2xl p-6 bg-gradient-to-br from-[#1b233a] via-[#111827] to-[#135bec]/40 border border-white/10 flex flex-col justify-between backface-hidden">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">VocabMaster Card</span>
                                                <div className="w-10 h-7 bg-amber-400/20 rounded-md border border-amber-400/30 mt-2 flex items-center justify-center text-[10px] text-amber-400">CHIP</div>
                                            </div>
                                            <span className="text-lg font-black text-white/80">{getCardBrand()}</span>
                                        </div>
                                        
                                        <div>
                                            <p className="text-lg font-mono tracking-widest text-white mb-4">
                                                {cardNumber || '•••• •••• •••• ••••'}
                                            </p>
                                            <div className="flex justify-between">
                                                <div>
                                                    <span className="text-[8px] text-slate-500 uppercase block">Kart Sahibi</span>
                                                    <span className="text-xs font-bold tracking-wide uppercase text-white/95">
                                                        {cardName || 'AD SOYAD'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[8px] text-slate-500 uppercase block">Son Kul.</span>
                                                    <span className="text-xs font-bold font-mono text-white/95">
                                                        {cardExpiry || 'AA/YY'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Back Side */}
                                    <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-[#111827] to-[#1e1e2d] border border-white/10 flex flex-col justify-between py-6 backface-hidden rotate-y-180">
                                        <div className="w-full h-11 bg-black/60 mt-2" />
                                        <div className="px-6 flex items-center justify-between">
                                            <div className="flex-1 bg-white/20 h-8 rounded-l px-2 flex items-center justify-end text-xs text-slate-400 font-mono italic">
                                                İmza Alanı
                                            </div>
                                            <div className="w-12 bg-white text-black h-8 font-mono font-bold flex items-center justify-center text-sm rounded-r shadow-inner">
                                                {cardCvv || '•••'}
                                            </div>
                                        </div>
                                        <div className="px-6 text-[8px] text-slate-500 text-center leading-tight">
                                            Bu kart simüle edilmiştir. Gerçek işlemlerde kullanılmaz.
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>

                            {/* Payment Form */}
                            <form onSubmit={handleCheckoutSubmit} className="glass-panel p-8 rounded-3xl space-y-6">
                                <h3 className="text-lg font-bold">Kart Bilgileri</h3>

                                {paymentError && (
                                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm rounded-xl">
                                        {paymentError}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-[#8b9bb4] uppercase tracking-wider">Kart Numarası</label>
                                        <input
                                            type="text"
                                            value={cardNumber}
                                            onChange={handleCardNumberChange}
                                            placeholder="4000 1234 5678 9010"
                                            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#135bec]/50 transition-all font-mono"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-[#8b9bb4] uppercase tracking-wider">Kart Sahibi</label>
                                        <input
                                            type="text"
                                            value={cardName}
                                            onChange={(e) => setCardName(e.target.value)}
                                            placeholder="AHMET YILMAZ"
                                            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#135bec]/50 transition-all uppercase"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-[#8b9bb4] uppercase tracking-wider">Son Kullanma Tarihi</label>
                                        <input
                                            type="text"
                                            value={cardExpiry}
                                            onChange={handleExpiryChange}
                                            placeholder="AA/YY"
                                            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#135bec]/50 transition-all font-mono"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-[#8b9bb4] uppercase tracking-wider">CVC / CVV</label>
                                        <input
                                            type="text"
                                            value={cardCvv}
                                            onChange={handleCvvChange}
                                            onFocus={() => setIsFlipped(true)}
                                            onBlur={() => setIsFlipped(false)}
                                            placeholder="123"
                                            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#135bec]/50 transition-all font-mono"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={paymentLoading}
                                    className="w-full py-4 bg-gradient-to-r from-[#135bec] to-blue-600 text-white font-black text-base rounded-2xl shadow-xl shadow-blue-500/25 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <span>Güvenli Ödeme Yap</span>
                                    <Lock size={16} />
                                </button>
                            </form>
                        </div>

                        {/* Right Side: Order Summary & Coupon */}
                        <div className="lg:col-span-5 space-y-6">
                            {/* Summary Card */}
                            <div className="glass-panel p-6 rounded-3xl space-y-5">
                                <h3 className="text-lg font-bold border-b border-white/5 pb-3">Sipariş Özeti</h3>

                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-white">VocabMaster {plan}</p>
                                        <p className="text-xs text-[#8b9bb4] capitalize">{period === 'monthly' ? 'Aylık Plan' : 'Yıllık Plan (%20 indirimli)'}</p>
                                    </div>
                                    <span className="font-bold">₺{basePrice.toFixed(2)}</span>
                                </div>

                                {/* Discount Section */}
                                {discountPercent > 0 && (
                                    <div className="flex justify-between items-center text-emerald-400 text-sm bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/10">
                                        <div className="flex items-center gap-1.5">
                                            <Tag size={18} />
                                            <span>İndirim (%{discountPercent})</span>
                                        </div>
                                        <span>- ₺{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="border-t border-white/5 pt-4 flex justify-between items-baseline">
                                    <span className="font-bold text-base">Toplam Tutar:</span>
                                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                                        ₺{finalPrice.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Coupon Code Panel */}
                            <div className="glass-panel p-6 rounded-3xl space-y-3">
                                <h4 className="text-sm font-bold text-[#8b9bb4] uppercase tracking-wider">İndirim Kuponu</h4>
                                
                                {couponError && (
                                    <p className="text-xs text-rose-500 flex items-center gap-1">
                                        <span>⚠</span> {couponError}
                                    </p>
                                )}
                                
                                {couponSuccess && (
                                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                                        <span>✓</span> {couponSuccess}
                                    </p>
                                )}

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        placeholder="KUPONKODU"
                                        className="flex-1 h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#135bec]/50 transition-all font-mono uppercase"
                                        disabled={!!validCoupon}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyCoupon}
                                        className="px-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-bold text-xs transition-all shrink-0"
                                        disabled={!!validCoupon}
                                    >
                                        Uygula
                                    </button>
                                </div>

                                {validCoupon && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDiscountPercent(0);
                                            setValidCoupon('');
                                            setCouponSuccess('');
                                        }}
                                        className="text-xs text-rose-500 hover:underline flex items-center gap-0.5"
                                    >
                                        Kuponu Kaldır
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
