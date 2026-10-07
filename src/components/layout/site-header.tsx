"use client";

import { Menu, Phone, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { SiteContent, SiteSettings } from "@/lib/content/content-schema";

export function BrandMark({ brandName }: { brandName: string }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3" aria-label={`${brandName} - Trang chủ`}>
      <Image
        src="/images/hung-phat-logo-transparent.png"
        alt=""
        width={96}
        height={70}
        loading="eager"
        className="shrink-0"
      />
      <span className="text-[1rem] font-black leading-none text-white md:text-[1.08rem]">
        {brandName}
      </span>
    </Link>
  );
}

export function SiteHeader({
  site,
  navigation,
}: {
  site: SiteSettings;
  navigation: SiteContent["navigation"];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0f12]/95 backdrop-blur">
      <div className="container-shell flex min-h-20 items-center justify-between gap-4">
        <BrandMark brandName={site.brandName} />
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Điều hướng chính">
          {navigation.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-[#d7dbe0] transition-colors hover:text-[#ffc400]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:block">
          <a className="button-primary text-sm" href={`tel:${site.phones[0].value}`}>
            <Phone size={17} aria-hidden />
            {site.phones[0].display}
          </a>
        </div>
        <button
          type="button"
          className="grid size-11 place-items-center border border-white/20 text-white lg:hidden"
          aria-label={open ? "Đóng menu" : "Mở menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden /> : <Menu aria-hidden />}
        </button>
      </div>
      {open ? (
        <nav
          aria-label="Điều hướng di động"
          className="border-t border-white/10 bg-[#171c21] px-4 py-5 lg:hidden"
        >
          <div className="container-shell grid gap-1">
            {navigation.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/10 px-2 py-3 font-semibold text-white"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={`tel:${site.phones[0].value}`}
              className="button-primary mt-4"
              onClick={() => setOpen(false)}
            >
              <Phone size={18} aria-hidden />
              Gọi {site.phones[0].display}
            </a>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
