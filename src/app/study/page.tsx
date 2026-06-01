'use client';

import Link from 'next/link';
import { GraduationCap, ArrowRight } from 'lucide-react';

export default function StudyPage() {
  return (
    <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-xl bg-[#135bec]/15 border border-[#135bec]/25 flex items-center justify-center mx-auto mb-6">
          <GraduationCap size={26} className="text-[#135bec]" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Çalışmaya Hazır mısın?</h1>
        <p className="text-[#6b7a94] text-sm mb-8 leading-relaxed">
          Birçok farklı çalışma modundan sana en uygun olanını seç ve öğrenmeye başla.
        </p>
        <Link
          href="/study/select"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#135bec] text-white rounded-lg text-sm font-medium hover:bg-[#1a6ef5] transition-colors"
        >
          Mod Seç
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
