import Image from "next/image";
import Link from "next/link";
import { properties } from "@/lib/data";
import Reveal from "@/components/Reveal";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="pt-28 sm:pt-32">
      <div className="container-page">
        <Reveal>
          <p className="eyebrow mb-3">About Nivaas</p>
          <h1 className="h-display max-w-3xl text-4xl sm:text-6xl">
            We got tired of surprise washrooms.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fog">
            Every Dhaka house-hunt has the same story: three photos of the
            living room, one of the building gate, and a two-hour trip through
            traffic to discover the kitchen was a corridor. Nivaas exists so
            that never happens again.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="img-frame mt-12 aspect-[21/9] shadow-lift sm:mt-14">
            <Image
              src={properties[4].cover}
              alt="A Nivaas home"
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-evergreen/40 to-transparent" />
          </div>
        </Reveal>

        <div className="mt-16 grid gap-5 md:mt-20 md:grid-cols-3 md:gap-6">
          {[
            {
              n: "01",
              t: "We shoot every space",
              d: "Living, dining, kitchen, each bedroom, each washroom, the balcony, the pool — photographed and measured. If a home has seven spaces, its listing has seven chapters.",
            },
            {
              n: "02",
              t: "We publish the truth",
              d: "Real sizes, real facing, real notes — including the honest ones, like which room gets the afternoon heat. Buyers trust listings that admit things.",
            },
            {
              n: "03",
              t: "You visit once, well",
              d: "Because you've already walked through online, your one physical visit is confirmation, not discovery. Most Nivaas buyers shortlist in a single weekend.",
            },
          ].map((x, i) => (
            <Reveal key={x.n} delay={i * 100}>
              <div className="card card-hover h-full p-7 sm:p-8">
                <p className="font-mono text-sm text-brass">{x.n}</p>
                <h2 className="mt-4 font-display text-2xl tracking-tight">
                  {x.t}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-fog">{x.d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="glass mt-16 rounded-3xl px-8 py-12 text-center sm:mt-20 sm:px-12 sm:py-16">
            <p className="font-display text-3xl tracking-tight sm:text-4xl">
              “The first visit should feel like the second.”
            </p>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-widest2 text-brass">
              The Nivaas principle
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link href="/properties" className="btn-brass">
                Browse homes
              </Link>
              <Link href="/contact" className="btn-ghost">
                Talk to us
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
