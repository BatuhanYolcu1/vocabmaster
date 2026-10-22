'use client';

import { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { useToast } from '@/components/ui/toast';
import { api, errorMessage, ApiClientError } from '@/lib/fetcher';
import { WORD_TYPES, WORD_TYPE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export interface WordDraft {
  word: string;
  turkishTranslation: string;
  definitionTr: string;
  exampleSentence: string;
  exampleSentenceTr: string;
  type: string;
  pronunciation: string;
}

export const emptyDraft: WordDraft = {
  word: '',
  turkishTranslation: '',
  definitionTr: '',
  exampleSentence: '',
  exampleSentenceTr: '',
  type: 'noun',
  pronunciation: '',
};

interface AiState {
  available: boolean;
  remaining: number | null; // null = unlimited
}

/**
 * Word editor used for adding and editing custom words.
 * "AI ile doldur" fills the empty fields from the English word.
 */
export function WordForm({
  initial = emptyDraft,
  ai,
  submitLabel,
  onSubmit,
  onCancel,
  compact,
  onAiUsed,
}: {
  initial?: WordDraft;
  ai: AiState;
  submitLabel: string;
  onSubmit: (draft: WordDraft) => Promise<boolean>;
  onCancel?: () => void;
  compact?: boolean;
  onAiUsed?: (remaining: number | null) => void;
}) {
  const toast = useToast();
  const [draft, setDraft] = useState<WordDraft>(initial);
  const [details, setDetails] = useState(!compact);
  const [filling, setFilling] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ word?: string; turkishTranslation?: string }>({});

  const set = (key: keyof WordDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setDraft((d) => ({ ...d, [key]: e.target.value }));
    if (key === 'word' || key === 'turkishTranslation') setErrors((er) => ({ ...er, [key]: undefined }));
  };

  async function fillWithAi() {
    if (!draft.word.trim()) {
      setErrors({ word: 'Önce İngilizce kelimeyi yaz.' });
      return;
    }
    setFilling(true);
    try {
      const res = await api<Omit<WordDraft, 'word'> & { aiRemaining: number | null }>('/api/ai/word', {
        method: 'POST',
        body: { word: draft.word },
      });
      // Only fill what the user hasn't typed themselves.
      setDraft((d) => ({
        ...d,
        turkishTranslation: d.turkishTranslation || res.turkishTranslation,
        definitionTr: d.definitionTr || res.definitionTr,
        exampleSentence: d.exampleSentence || res.exampleSentence,
        exampleSentenceTr: d.exampleSentenceTr || res.exampleSentenceTr,
        type: res.type || d.type,
        pronunciation: d.pronunciation || res.pronunciation,
      }));
      setDetails(true);
      setErrors({});
      onAiUsed?.(res.aiRemaining);
    } catch (error) {
      const upgrade = error instanceof ApiClientError && error.code === 'AI_LIMIT_REACHED';
      toast.error(upgrade ? 'Günlük AI hakkın doldu' : 'AI dolduramadı', errorMessage(error));
    } finally {
      setFilling(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!draft.word.trim()) next.word = 'İngilizce kelime gerekli.';
    if (!draft.turkishTranslation.trim()) next.turkishTranslation = 'Türkçe anlamı gerekli.';
    if (next.word || next.turkishTranslation) {
      setErrors(next);
      return;
    }
    setSaving(true);
    const ok = await onSubmit(draft);
    setSaving(false);
    if (ok && compact) {
      setDraft(emptyDraft);
      setDetails(false);
      document.getElementById('word-form-word')?.focus();
    }
  }

  const aiDisabled = !ai.available || ai.remaining === 0;
  const aiTitle = !ai.available
    ? 'Yapay zekâ şu an kullanılamıyor'
    : ai.remaining === 0
      ? 'Bugünkü AI hakkın doldu'
      : ai.remaining === null
        ? 'Çeviri, tanım, örnek cümle ve telaffuzu otomatik doldur'
        : `Kalan hakkın: ${ai.remaining}`;

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="İngilizce" error={errors.word}>
          {(p) => (
            <div className="flex gap-2">
              <Input {...p} id="word-form-word" value={draft.word} onChange={set('word')} placeholder="ör. resilient" autoComplete="off" lang="en" maxLength={80} />
            </div>
          )}
        </Field>
        <Field label="Türkçe anlamı" error={errors.turkishTranslation}>
          {(p) => <Input {...p} value={draft.turkishTranslation} onChange={set('turkishTranslation')} placeholder="ör. dayanıklı" autoComplete="off" maxLength={160} />}
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="soft" size="sm" onClick={fillWithAi} loading={filling} disabled={aiDisabled} title={aiTitle} className="!text-violet !bg-violet-soft">
          {!filling && <Sparkles />} AI ile doldur
          {ai.available && ai.remaining !== null && <span className="opacity-70">· {ai.remaining} hak</span>}
        </Button>
        {compact && (
          <button
            type="button"
            onClick={() => setDetails((v) => !v)}
            aria-expanded={details}
            className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-fg"
          >
            Örnek cümle ve tanım <ChevronDown className={cn('size-4 transition-transform', details && 'rotate-180')} />
          </button>
        )}
      </div>

      {details && (
        <div className="grid animate-fade-in gap-4 sm:grid-cols-2">
          <Field label="Türkçe tanım" optional className="sm:col-span-2">
            {(p) => <Input {...p} value={draft.definitionTr} onChange={set('definitionTr')} placeholder="Kısa bir açıklama" maxLength={500} />}
          </Field>
          <Field label="Örnek cümle" optional hint="Boşluk doldurma modu için kelimeyi içeren bir cümle yaz.">
            {(p) => <Textarea {...p} rows={2} value={draft.exampleSentence} onChange={set('exampleSentence')} lang="en" maxLength={400} className="min-h-0" />}
          </Field>
          <Field label="Cümlenin çevirisi" optional>
            {(p) => <Textarea {...p} rows={2} value={draft.exampleSentenceTr} onChange={set('exampleSentenceTr')} maxLength={400} className="min-h-0" />}
          </Field>
          <Field label="Kelime türü">
            {(p) => (
              <Select {...p} value={draft.type} onChange={set('type')}>
                {WORD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {WORD_TYPE_LABELS[t]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Telaffuz (IPA)" optional>
            {(p) => <Input {...p} value={draft.pronunciation} onChange={set('pronunciation')} placeholder="/rɪˈzɪliənt/" maxLength={80} className="font-mono" />}
          </Field>
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Vazgeç
          </Button>
        )}
        <Button type="submit" loading={saving}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
