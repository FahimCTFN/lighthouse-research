export function KeyRiskPull({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <div className="rounded-r border-l-[3px] border-brand-gold bg-brand-gold-light px-5 py-4">
      <div className="mb-1.5 text-[10px] font-medium uppercase tracking-label text-brand-gold-ink">
        Key risk
      </div>
      <p className="font-serif text-[15px] leading-[1.65] text-[#5a4010]">
        {text}
      </p>
    </div>
  );
}
