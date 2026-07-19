"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="container-page pt-28 sm:pt-32">
      <Reveal>
        <p className="eyebrow mb-3">Contact</p>
        <h1 className="h-display max-w-2xl text-4xl sm:text-6xl">
          Tell us what home means to you.
        </h1>
        <p className="mt-4 max-w-lg text-fog">
          Share your area, budget, and must-haves — we reply with a shortlist
          you can walk through the same day.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-8 lg:mt-14 lg:grid-cols-[1fr_340px] lg:gap-10">
        <Reveal>
          {sent ? (
            <div className="card flex min-h-[420px] flex-col items-center justify-center p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brass/15 text-2xl text-brass">
                ✦
              </div>
              <h2 className="mt-5 font-display text-3xl tracking-tight">
                Message received.
              </h2>
              <p className="mt-3 max-w-sm text-fog">
                An advisor will reply within one working day — usually with a
                shortlist you can walk through the same evening.
              </p>
              <button className="btn-ghost mt-8" onClick={() => setSent(false)}>
                Send another message
              </button>
            </div>
          ) : (
            <form
              className="card space-y-5 p-6 sm:p-8"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="c-name">
                    Your name
                  </label>
                  <input
                    id="c-name"
                    required
                    className="field"
                    placeholder="Full name"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="c-phone">
                    Phone
                  </label>
                  <input
                    id="c-phone"
                    required
                    className="field"
                    placeholder="+880 …"
                    autoComplete="tel"
                  />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="c-email">
                  Email
                </label>
                <input
                  id="c-email"
                  type="email"
                  className="field"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="label" htmlFor="c-interest">
                  I&apos;m interested in
                </label>
                <select id="c-interest" className="field">
                  <option>Buying a home</option>
                  <option>Renting a home</option>
                  <option>Listing my property</option>
                  <option>Something else</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="c-msg">
                  Message
                </label>
                <textarea
                  id="c-msg"
                  rows={5}
                  required
                  className="field resize-none"
                  placeholder="Area, budget, must-haves — the more you tell us, the better the shortlist."
                />
              </div>
              <button type="submit" className="btn-brass w-full sm:w-auto">
                Send message
              </button>
            </form>
          )}
        </Reveal>

        <Reveal delay={100}>
          <div className="space-y-4">
            {[
              {
                label: "Office",
                body: (
                  <p className="text-sm leading-relaxed text-ivory/85">
                    House 7, Road 11, Banani
                    <br />
                    Dhaka 1213, Bangladesh
                  </p>
                ),
              },
              {
                label: "Direct",
                body: (
                  <>
                    <a
                      href="tel:+8801711000000"
                      className="block font-mono text-sm text-brass transition-colors hover:text-ivory"
                    >
                      +880 1711-000000
                    </a>
                    <a
                      href="mailto:hello@nivaas.homes"
                      className="mt-1.5 block font-mono text-sm text-brass transition-colors hover:text-ivory"
                    >
                      hello@nivaas.homes
                    </a>
                  </>
                ),
              },
              {
                label: "Hours",
                body: (
                  <>
                    <p className="text-sm text-ivory/85">Saturday – Thursday</p>
                    <p className="mt-1 text-sm text-fog">10:00 — 19:00</p>
                  </>
                ),
              },
            ].map((item) => (
              <div key={item.label} className="card p-6">
                <p className="eyebrow mb-3">{item.label}</p>
                {item.body}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
