'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Briefcase, Check, Cpu, GraduationCap, HeartPulse, MessageCircle, Plane, Sprout } from 'lucide-react';
import { LogoMark } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { api, errorMessage } from '@/lib/fetcher';
import { CEFR_INFO, CEFR_LEVELS, DAILY_GOAL_OPTIONS, type CefrLevel } from '@/lib/constants';
import { cn } from '@/lib/utils';

const INTERESTS = [
  { id: 'Genel', label: 'Günlük & genel', icon: MessageCircle },
  { id: 'İş', label: 'İş & kariyer', icon: Briefcase },
  { id: 'Akademik', label: 'Akademik & sınavlar', icon: GraduationCap },
  { id: 'Seyahat', label: 'Seyahat', icon: Plane },
  { id: 'Teknoloji', label: 'Teknoloji', icon: Cpu },
  { id: 'Sağlık', label: 'Sağlık', icon: HeartPulse },
];

const STEPS = ['Seviye', 'İlgi alanları', 'Günlük hedef'];

export function OnboardingFlow({ name }: { name: string }) {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<CefrLevel>('B1');
  const [interests, setInterests] = useState<string[]>(['Genel']);
  const [goal, setGoal] = useState(10);
  const [saving, setSaving] = useState(false);

  const toggleInterest = (id: string) =>
    setInterests((all) => (all.includes(id) ? all.filter((i) => i !== id) : [...all, id]));

  async function finish() {
    setSaving(true);
    try {
      await api('/api/profile', {
        method: 'PATCH',
        body: { languageLevel: level, interests, dailyGoal: goal, onboardingComplete: true },
      });
      router.replace('/dashboard');
      router.refresh();
    } catch (error) {
      toast.error('Kaydedilemedi', errorMessage(error));
      setSaving(false);
    }
  }

  const canContinue = step !== 1 || interests.length > 0;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-4 px-5 py-5 sm:px-8">
        <LogoMark />
        <div className="flex flex-1 items-center gap-2" aria-label={`Adım ${step + 1} / ${STEPS.length}`}>
          {STEPS.map((s, i) => (
            <div key={s} className={cn('h-1.5 flex-1 rounded-full transition-colors', i <= step ? 'bg-primary' : 'bg-surface-3')} />
          ))}
        </div>
        <span className="text-sm tabular text-muted">
          {step + 1}/{STEPS.length}
        </span>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-32 pt-6 sm:px-8 sm:pt-12">
        <div key={step} className="animate-fade-in">
          {step === 0 && (
            <>
              <p className="text-sm font-semibold text-primary">Merhaba {name} 👋</p>
              <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">İngilizce seviyen ne?</h1>
              <p className="mt-2 text-muted">Sana uygun kelimeleri seçmek için kullanacağız. Emin değilsen B1 iyi bir başlangıç.</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {CEFR_LEVELS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLevel(l)}
                    aria-pressed={level === l}
                    className={cn(
                      'flex items-center gap-4 rounded-2xl border-2 bg-surface p-4 text-left transition-colors',
                      level === l ? 'border-primary' : 'border-border hover:border-border-strong',
                    )}
                  >
                    <span
                      className={cn(
                        'grid size-11 shrink-0 place-items-center rounded-xl font-mono text-sm font-bold',
                        level === l ? 'bg-primary text-primary-fg' : 'bg-surface-2 text-muted',
                      )}
                    >
                      {l}
                    </span>
                    <span>
                      <span className="block font-semibold text-fg">{CEFR_INFO[l].label}</span>
                      <span className="block text-sm text-muted">{CEFR_INFO[l].description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="font-display text-3xl font-extrabold tracking-tight">Neler için öğreniyorsun?</h1>
              <p className="mt-2 text-muted">Birden fazla seçebilirsin. Daha sonra ayarlardan değiştirebilirsin.</p>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {INTERESTS.map(({ id, label, icon: Icon }) => {
                  const on = interests.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleInterest(id)}
                      aria-pressed={on}
                      className={cn(
                        'relative flex flex-col items-start gap-3 rounded-2xl border-2 bg-surface p-4 text-left transition-colors',
                        on ? 'border-primary' : 'border-border hover:border-border-strong',
                      )}
                    >
                      <span className={cn('grid size-10 place-items-center rounded-xl', on ? 'bg-primary-soft text-primary-soft-fg' : 'bg-surface-2 text-muted')}>
                        <Icon className="size-5" />
                      </span>
                      <span className="font-semibold text-fg">{label}</span>
                      {on && (
                        <span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-primary text-primary-fg">
                          <Check className="size-3.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {(level === 'A1' || level === 'A2') && (
                <p className="mt-4 flex items-center gap-2 text-sm text-muted">
                  <Sprout className="size-4 text-success" /> Seviyene uygun temel kelimeleri de ekleyeceğiz.
                </p>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="font-display text-3xl font-extrabold tracking-tight">Günde kaç kelime?</h1>
              <p className="mt-2 text-muted">Az ama her gün çalışmak, arada bir çok çalışmaktan daha etkilidir.</p>
              <div className="mt-8 space-y-3">
                {DAILY_GOAL_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setGoal(o.value)}
                    aria-pressed={goal === o.value}
                    className={cn(
                      'flex w-full items-center gap-4 rounded-2xl border-2 bg-surface p-4 text-left transition-colors',
                      goal === o.value ? 'border-primary' : 'border-border hover:border-border-strong',
                    )}
                  >
                    <span className="font-display text-2xl font-extrabold tabular text-fg">{o.value}</span>
                    <span className="flex-1">
                      <span className="block font-semibold text-fg">{o.label}</span>
                      <span className="block text-sm text-muted">günde yaklaşık {o.minutes} dakika</span>
                    </span>
                    {o.value === 10 && <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary-soft-fg">Önerilen</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="safe-bottom fixed inset-x-0 bottom-0 border-t border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0 || saving} className={step === 0 ? 'invisible' : ''}>
            <ArrowLeft /> Geri
          </Button>
          {step < STEPS.length - 1 ? (
            <Button size="lg" onClick={() => setStep((s) => s + 1)} disabled={!canContinue}>
              Devam <ArrowRight />
            </Button>
          ) : (
            <Button size="lg" onClick={finish} loading={saving}>
              Başlayalım <ArrowRight />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
