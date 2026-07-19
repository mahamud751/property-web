import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/[0.06] bg-pine/50 sm:mt-32">
      <div className="container-page grid gap-12 py-14 md:grid-cols-12 md:gap-10 md:py-16">
        <div className="md:col-span-5">
          <div className="flex items-baseline gap-2.5">
            <span className="font-display text-3xl font-medium tracking-tight">
              Nivaas
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest2 text-brass">
              Dhaka
            </span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-fog">
            Curated homes across Dhaka, each documented room by room — living,
            dining, kitchen, bedrooms, washrooms, balconies and pools — so you
            walk through before you ever visit.
          </p>
        </div>

        <div className="md:col-span-3 md:col-start-7">
          <p className="eyebrow mb-5">Explore</p>
          <ul className="space-y-3.5 text-sm text-ivory/75">
            {[
              ["/properties", "All properties"],
              ["/add-property", "List your property"],
              ["/about", "About Nivaas"],
              ["/contact", "Contact"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="transition-colors duration-300 hover:text-brass"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="eyebrow mb-5">Office</p>
          <ul className="space-y-3.5 text-sm leading-relaxed text-ivory/75">
            <li>House 7, Road 11, Banani</li>
            <li>Dhaka 1213, Bangladesh</li>
            <li>
              <a
                href="tel:+8801711000000"
                className="transition-colors hover:text-brass"
              >
                +880 1711-000000
              </a>
            </li>
            <li>
              <a
                href="mailto:hello@nivaas.homes"
                className="transition-colors hover:text-brass"
              >
                hello@nivaas.homes
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/[0.05]">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-fog/90 sm:flex-row">
          <span>© {new Date().getFullYear()} Nivaas. All rights reserved.</span>
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-fog/70">
            Walk through, then visit
          </span>
        </div>
      </div>
    </footer>
  );
}
