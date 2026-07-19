"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/compare", label: "Compare" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-400 ease-smooth ${
        scrolled || open
          ? "border-b border-white/[0.06] bg-evergreen/85 shadow-soft backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container-page flex h-[4.25rem] items-center justify-between sm:h-[4.5rem]">
        <Link
          href="/"
          className="group flex items-baseline gap-2.5 transition-opacity hover:opacity-90"
        >
          <span className="font-display text-[1.65rem] font-medium leading-none tracking-tight text-ivory">
            Nivaas
          </span>
          <span className="hidden font-mono text-[9px] uppercase tracking-widest2 text-brass/90 sm:block">
            Dhaka
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-300 ${
                  active
                    ? "text-brass"
                    : "text-ivory/70 hover:text-ivory"
                }`}
              >
                {l.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-brass to-transparent" />
                )}
              </Link>
            );
          })}
          <Link
            href="/add-property"
            className="btn-brass ml-3 !px-5 !py-2.5 text-[13px]"
          >
            List your property
          </Link>
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="btn-icon md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span className="relative flex h-3.5 w-4 flex-col justify-between">
            <span
              className={`h-px w-full origin-center bg-current transition-all duration-300 ease-smooth ${
                open ? "translate-y-[6.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-px w-full bg-current transition-all duration-300 ease-smooth ${
                open ? "scale-x-0 opacity-0" : ""
              }`}
            />
            <span
              className={`h-px w-full origin-center bg-current transition-all duration-300 ease-smooth ${
                open ? "-translate-y-[6.5px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      <div
        className={`overflow-hidden border-t border-white/[0.06] bg-evergreen/95 backdrop-blur-xl transition-all duration-400 ease-smooth md:hidden ${
          open ? "max-h-[28rem] opacity-100" : "max-h-0 border-transparent opacity-0"
        }`}
      >
        <nav className="container-page flex flex-col gap-1 py-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-xl px-4 py-3.5 text-base transition-colors ${
                isActive(l.href)
                  ? "bg-brass/10 text-brass"
                  : "text-ivory/85 hover:bg-white/[0.04]"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/add-property" className="btn-brass mt-2 w-full">
            List your property
          </Link>
        </nav>
      </div>
    </header>
  );
}
