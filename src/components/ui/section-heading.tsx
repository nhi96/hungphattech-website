export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  dark = false,
  titleSize = "large",
  alignment = "left",
}: {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
  dark?: boolean;
  titleSize?: "small" | "medium" | "large";
  alignment?: "left" | "center" | "right";
}) {
  const titleSizeClass = {
    small: "text-2xl md:text-3xl",
    medium: "text-3xl md:text-4xl",
    large: "section-title",
  }[titleSize];
  const alignmentClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[alignment];

  return (
    <div className="grid gap-7 border-t border-current/15 pt-6 md:grid-cols-[100px_1fr]">
      <span className={`font-mono text-sm font-bold ${dark ? "text-[#8b929a]" : "text-[#697079]"}`}>
        {index}
      </span>
      <div className={alignmentClass}>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className={`${titleSizeClass} mt-3 font-black leading-tight ${dark ? "text-white" : "text-[#0b0f12]"}`}>
          {title}
        </h2>
        {description ? (
          <p className={`mt-5 max-w-2xl leading-7 ${alignment === "center" ? "mx-auto" : alignment === "right" ? "ml-auto" : ""} ${dark ? "text-[#b8bec7]" : "text-[#59616a]"}`}>
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
