import { Phone } from "lucide-react";
import type { SiteSettings } from "@/lib/content/content-schema";

export function MobileCallBar({ phones }: { phones: SiteSettings["phones"] }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/20 bg-[#ffc400] p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
      <div className="grid grid-cols-2 gap-2">
        {phones.map((phone) => (
          <a
            key={phone.id}
            href={`tel:${phone.value}`}
            className="flex min-h-11 items-center justify-center gap-2 bg-[#0b0f12] px-2 text-sm font-bold text-white"
          >
            <Phone size={16} aria-hidden />
            {phone.display}
          </a>
        ))}
      </div>
    </div>
  );
}
