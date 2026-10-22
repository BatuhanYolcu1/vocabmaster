import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isStudyMode, STUDY_MODE_INFO, DEFAULT_SESSION_SIZE } from '@/lib/study-modes';
import { StudySession } from '@/components/study/session';

type Props = {
  params: Promise<{ mode: string }>;
  searchParams: Promise<{ source?: string; size?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mode } = await params;
  return { title: isStudyMode(mode) ? STUDY_MODE_INFO[mode].name : 'Çalış' };
}

export default async function StudyModePage({ params, searchParams }: Props) {
  const { mode } = await params;
  if (!isStudyMode(mode)) notFound();
  const { source = 'daily', size } = await searchParams;
  const n = Math.min(50, Math.max(4, Number(size) || DEFAULT_SESSION_SIZE));
  return <StudySession key={`${mode}-${source}-${n}`} mode={mode} source={source} size={n} />;
}
