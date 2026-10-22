'use client';

import { useState } from 'react';
import { Eye, EyeOff, RefreshCw, Sparkles, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Field, Select } from '@/components/ui/field';
import { useToast } from '@/components/ui/toast';
import { speak, canSpeak } from '@/components/study/speech';
import { api, errorMessage } from '@/lib/fetcher';
import { CEFR_INFO, CEFR_LEVELS, type CefrLevel } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface Story {
  title: string;
  story: string;
  storyTr: string;
  level: string;
  words: Array<{ id: string; word: string; turkishTranslation: string }>;
}

export function StoryView({ lists, defaultLevel }: { lists: Array<{ id: string; name: string }>; defaultLevel: CefrLevel }) {
  const toast = useToast();
  const [source, setSource] = useState('recent');
  const [level, setLevel] = useState<CefrLevel>(defaultLevel);
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTr, setShowTr] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setActive(null);
    setShowTr(false);
    try {
      const res = await api<Story>('/api/ai/story', {
        method: 'POST',
        body: { listId: source === 'recent' ? null : source, level },
      });
      setStory(res);
    } catch (error) {
      toast.error('Hikâye yazılamadı', errorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  const lookup = (token: string) =>
    story?.words.find((w) => token.toLocaleLowerCase('en-US').startsWith(w.word.toLocaleLowerCase('en-US')));

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Field label="Kelimeler">
            {(p) => (
              <Select {...p} value={source} onChange={(e) => setSource(e.target.value)}>
                <option value="recent">Son çalıştığım kelimeler</option>
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Seviye">
            {(p) => (
              <Select {...p} value={level} onChange={(e) => setLevel(e.target.value as CefrLevel)}>
                {CEFR_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l} — {CEFR_INFO[l].label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Button onClick={generate} loading={loading} size="lg" className="bg-violet hover:bg-violet hover:brightness-110">
            {!loading && (story ? <RefreshCw /> : <Sparkles />)} {story ? 'Yeni hikâye' : 'Hikâye yaz'}
          </Button>
        </CardBody>
      </Card>

      {loading && !story && (
        <Card>
          <CardBody className="space-y-3 py-8">
            {[100, 92, 96, 70].map((w, i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-surface-2" style={{ width: `${w}%` }} />
            ))}
            <p className="pt-2 text-center text-sm text-muted">Yapay zekâ hikâyeni yazıyor…</p>
          </CardBody>
        </Card>
      )}

      {story && (
        <Card className={cn('animate-fade-in transition-opacity', loading && 'opacity-50')}>
          <CardBody className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-violet">{story.level} seviyesi</p>
                <h2 className="mt-1 font-display text-2xl font-extrabold">{story.title}</h2>
              </div>
              {canSpeak() && (
                <Button variant="secondary" size="sm" onClick={() => speak(story.story.replace(/\*\*/g, ''), { rate: 0.9 })}>
                  <Volume2 /> Dinle
                </Button>
              )}
            </div>
            <p className="mt-6 font-[Georgia,serif] text-lg leading-[1.9] text-fg">
              {story.story.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
                if (!part.startsWith('**')) return <span key={i}>{part}</span>;
                const token = part.slice(2, -2);
                const w = lookup(token);
                const isActive = active === `${i}`;
                return (
                  <span key={i} className="relative inline-block">
                    <button
                      type="button"
                      onClick={() => {
                        setActive(isActive ? null : `${i}`);
                        speak(token);
                      }}
                      className="rounded bg-violet-soft px-1 font-sans font-semibold text-violet underline decoration-violet/40 decoration-dotted underline-offset-4"
                    >
                      {token}
                    </button>
                    {isActive && w && (
                      <span className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-surface px-3 py-1.5 font-sans text-sm shadow-md">
                        {w.turkishTranslation}
                      </span>
                    )}
                  </span>
                );
              })}
            </p>
            <p className="mt-4 text-xs text-subtle">Vurgulu kelimelere dokunarak anlamını görebilir ve dinleyebilirsin.</p>

            <div className="mt-6 border-t border-border pt-5">
              <Button variant="ghost" size="sm" onClick={() => setShowTr((v) => !v)}>
                {showTr ? <EyeOff /> : <Eye />} {showTr ? 'Çeviriyi gizle' : 'Türkçe çeviriyi göster'}
              </Button>
              {showTr && <p className="mt-3 animate-fade-in leading-relaxed text-muted">{story.storyTr}</p>}
            </div>
          </CardBody>
        </Card>
      )}

      {story && (
        <Card>
          <CardBody>
            <p className="mb-3 text-sm font-semibold">Hikâyedeki kelimeler</p>
            <div className="flex flex-wrap gap-2">
              {story.words.map((w) => (
                <span key={w.id} className="rounded-lg bg-surface-2 px-2.5 py-1 text-sm">
                  <span className="font-semibold">{w.word}</span> <span className="text-muted">· {w.turkishTranslation}</span>
                </span>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
