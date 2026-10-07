import { FlaskConical } from "lucide-react";

export function DemoBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`demo-label ${className}`}>
      <FlaskConical size={12} aria-hidden />
      Sản phẩm minh họa trong bản local
    </span>
  );
}
