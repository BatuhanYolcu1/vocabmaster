export function ProsePage({ title, updated, intro, children }: { title: string; updated?: string; intro?: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
      <h1 className="font-display text-4xl font-extrabold tracking-tight">{title}</h1>
      {updated && <p className="mt-2 text-sm text-subtle">Son güncelleme: {updated}</p>}
      {intro && <p className="mt-6 text-lg text-muted">{intro}</p>}
      <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-muted [&_a]:font-medium [&_a]:text-primary hover:[&_a]:underline [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-fg [&_strong]:text-fg [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        {children}
      </div>
    </article>
  );
}
