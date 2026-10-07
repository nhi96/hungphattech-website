import Link from "next/link";

export function PageHero({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <section className="dark-grid border-b border-white/10 bg-[#0b0f12] py-16 md:py-24">
      <div className="container-shell">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-5 max-w-5xl text-[clamp(2.5rem,7vw,5.6rem)] font-black leading-[0.98] text-white">
          {title}
        </h1>
        <div className="mt-8 flex flex-col items-start justify-between gap-6 border-t border-white/15 pt-7 md:flex-row md:items-end">
          <p className="max-w-2xl text-base leading-7 text-[#b8bec7] md:text-lg">{description}</p>
          {action ? (
            <Link href={action.href} className="button-primary shrink-0">
              {action.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
