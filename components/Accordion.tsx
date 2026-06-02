// Section dépliable, basée sur <details> natif (accessible, sans JS).
export function Accordion({
  icon,
  title,
  meta,
  defaultOpen = false,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  meta?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="card group overflow-hidden">
      <summary className="flex cursor-pointer list-none items-center gap-3.5 px-5 py-4 transition-colors hover:bg-brand-cream/60 [&::-webkit-details-marker]:hidden">
        <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-ok-soft text-[#0a7c54]">
          {icon}
        </span>
        <span className="flex-1">
          <span className="block font-bold text-ink">{title}</span>
          {meta && <span className="block text-[0.8rem] text-muted">{meta}</span>}
        </span>
        <svg
          className="h-5 w-5 flex-none text-faint transition-transform duration-300 group-open:rotate-180"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div className="border-t border-line px-5 py-5 group-open:animate-reveal">{children}</div>
    </details>
  );
}
