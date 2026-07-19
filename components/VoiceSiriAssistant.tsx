"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { properties, type Property } from "@/lib/data";
import {
  matchProperties,
  parseVoiceCommand,
  speakResults,
  type VoiceFilters,
} from "@/lib/voice-search";

type Phase = "idle" | "listening" | "thinking" | "speaking";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }>;
};

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

const examples = [
  "Find a 3 bedroom in Gulshan for sale",
  "Show apartments for rent",
  "Homes with a swimming pool",
  "Villa in Banani",
  "Open first result",
];

/** Open voice panel from hero / other CTAs */
export function openNivaasVoice(autoListen = true) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("nivaas-voice-open", { detail: { autoListen } })
  );
}

export default function VoiceSiriAssistant() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [reply, setReply] = useState(
    "Hi — I'm Nivaas Voice. Tap the orb and tell me what home you want."
  );
  const [matches, setMatches] = useState<Property[]>([]);
  const [supported, setSupported] = useState(true);
  const [lastFilters, setLastFilters] = useState<VoiceFilters | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const lastMatches = useRef<Property[]>([]);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      onEnd?.();
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.02;
    u.pitch = 1;
    u.lang = "en-US";
    // Prefer a smoother English voice when available
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => /en-US|en-GB/i.test(v.lang) && /female|samantha|google/i.test(v.name)) ||
      voices.find((v) => /en/i.test(v.lang));
    if (preferred) u.voice = preferred;
    setPhase("speaking");
    u.onend = () => {
      setPhase("idle");
      onEnd?.();
    };
    u.onerror = () => {
      setPhase("idle");
      onEnd?.();
    };
    window.speechSynthesis.speak(u);
  }, []);

  const handleCommand = useCallback(
    (text: string) => {
      setPhase("thinking");
      setTranscript(text);
      setInterim("");

      const intent = parseVoiceCommand(text);

      if (intent.type === "greeting" || intent.type === "help" || intent.type === "unknown") {
        setReply(intent.reply);
        setMatches([]);
        speak(intent.reply);
        return;
      }

      if (intent.type === "compare") {
        setReply(intent.reply);
        setMatches([]);
        speak(intent.reply, () => router.push("/compare"));
        return;
      }

      if (intent.type === "open") {
        const target = lastMatches.current[0];
        if (!target) {
          const msg = "I don't have a result yet. Ask me to find a home first.";
          setReply(msg);
          speak(msg);
          return;
        }
        setReply(`Opening ${target.title}.`);
        speak(`Opening ${target.title}.`, () =>
          router.push(`/properties/${target.slug}`)
        );
        return;
      }

      // search
      setLastFilters(intent.filters);
      const found = matchProperties(properties, intent.filters);
      lastMatches.current = found;
      setMatches(found.slice(0, 4));
      const spoken = speakResults(found, intent.filters);
      setReply(`${intent.reply} ${spoken}`);
      speak(spoken);
    },
    [router, speak]
  );

  const stopListening = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
  }, []);

  const startListening = useCallback(() => {
    const rec = getRecognition();
    if (!rec) {
      setSupported(false);
      setReply(
        "Voice isn't supported in this browser. Try Chrome or Safari, or type a search on Properties."
      );
      return;
    }

    window.speechSynthesis?.cancel();
    recRef.current = rec;
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = true;

    rec.onresult = (ev) => {
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < ev.results.length; i++) {
        const row = ev.results[i];
        const piece = row[0]?.transcript ?? "";
        if ((row as { isFinal?: boolean }).isFinal) finalText += piece;
        else interimText += piece;
      }
      if (interimText) setInterim(interimText);
      if (finalText.trim()) {
        handleCommand(finalText.trim());
      }
    };

    rec.onerror = (ev) => {
      setPhase("idle");
      if (ev.error === "not-allowed") {
        setReply("Microphone blocked. Allow mic access, then try again.");
      } else if (ev.error !== "aborted") {
        setReply("I didn't catch that. Tap the orb and try again.");
      }
    };

    rec.onend = () => {
      setPhase((p) => (p === "listening" ? "idle" : p));
    };

    try {
      setPhase("listening");
      setInterim("");
      setTranscript("");
      rec.start();
    } catch {
      setPhase("idle");
      setReply("Could not start the microphone. Please try again.");
    }
  }, [handleCommand]);

  const toggleListen = () => {
    if (phase === "listening") {
      stopListening();
      setPhase("idle");
      return;
    }
    if (phase === "speaking") {
      window.speechSynthesis?.cancel();
      setPhase("idle");
    }
    startListening();
  };

  useEffect(() => {
    setSupported(!!getRecognition());
    // Warm voices list
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
    return () => {
      try {
        recRef.current?.abort();
      } catch {
        /* ignore */
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Keyboard: Cmd/Ctrl+Shift+V · hero CTA event
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        setOpen(true);
        startListening();
      }
    };
    const onOpen = (e: Event) => {
      const auto =
        (e as CustomEvent<{ autoListen?: boolean }>).detail?.autoListen !== false;
      setOpen(true);
      if (auto) {
        // slight delay so panel paints before mic prompt
        window.setTimeout(() => startListening(), 180);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("nivaas-voice-open", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("nivaas-voice-open", onOpen);
    };
  }, [startListening]);

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="voice-fab group"
        aria-label="Open Nivaas Voice assistant"
        title="Nivaas Voice (Siri-style)"
      >
        <span className="voice-fab-ring" />
        <span className="voice-fab-core">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 3a3 3 0 0 0-3 3v6a3 3 0 1 0 6 0V6a3 3 0 0 0-3-3Z"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M7 11a5 5 0 0 0 10 0M12 16v4M9 20h6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className="sr-only">Voice search</span>
      </button>

      {/* Panel */}
      {open && (
        <div className="voice-overlay" role="dialog" aria-modal="true" aria-label="Nivaas Voice">
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-sm"
            aria-label="Close voice assistant"
            onClick={() => {
              stopListening();
              window.speechSynthesis?.cancel();
              setOpen(false);
              setPhase("idle");
            }}
          />

          <div className="voice-sheet">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest2 text-brass">
                  Nivaas Voice
                </p>
                <p className="mt-1 font-display text-2xl text-ivory">
                  {phase === "listening"
                    ? "Listening…"
                    : phase === "thinking"
                      ? "Finding homes…"
                      : phase === "speaking"
                        ? "Speaking…"
                        : "How can I help?"}
                </p>
              </div>
              <button
                type="button"
                className="btn-icon"
                aria-label="Close"
                onClick={() => {
                  stopListening();
                  window.speechSynthesis?.cancel();
                  setOpen(false);
                  setPhase("idle");
                }}
              >
                ✕
              </button>
            </div>

            {/* Siri-like orb */}
            <div className="relative mx-auto my-8 flex h-36 w-36 items-center justify-center">
              <div
                className={`voice-orb ${phase === "listening" ? "is-listening" : ""} ${
                  phase === "speaking" ? "is-speaking" : ""
                } ${phase === "thinking" ? "is-thinking" : ""}`}
              />
              <button
                type="button"
                onClick={toggleListen}
                className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-evergreen/80 text-brass shadow-glow backdrop-blur transition hover:scale-105"
                aria-label={phase === "listening" ? "Stop listening" : "Start listening"}
              >
                {phase === "listening" ? (
                  <span className="h-5 w-5 rounded-sm bg-brass" />
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M12 3a3 3 0 0 0-3 3v6a3 3 0 1 0 6 0V6a3 3 0 0 0-3-3Z"
                      fill="currentColor"
                    />
                    <path
                      d="M7 11a5 5 0 0 0 10 0M12 16v4M9 20h6"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
            </div>

            <p className="min-h-[1.25rem] text-center font-mono text-xs text-brass">
              {interim || (phase === "listening" ? "Say your request…" : "")}
            </p>
            {transcript && (
              <p className="mt-1 text-center text-sm text-fog">
                You: “{transcript}”
              </p>
            )}
            <p className="mt-3 text-center text-base leading-relaxed text-ivory/95">
              {reply}
            </p>

            {!supported && (
              <p className="mt-3 rounded-xl border border-brass/30 bg-brass/10 px-3 py-2 text-center text-xs text-brass">
                Speech recognition needs Chrome, Edge, or Safari with mic permission.
              </p>
            )}

            {/* Results */}
            {matches.length > 0 && (
              <div className="mt-6 space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-fog">
                  Matches
                </p>
                {matches.map((p, i) => (
                  <Link
                    key={p.slug}
                    href={`/properties/${p.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-2.5 transition hover:border-brass/40"
                  >
                    <span className="relative h-14 w-16 shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={p.cover}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-ivory">
                        {i === 0 ? "★ " : ""}
                        {p.title}
                      </span>
                      <span className="block text-xs text-fog">
                        {p.city} · {p.beds} bed · {p.price}
                      </span>
                    </span>
                    <span className="font-mono text-[10px] text-brass">Open</span>
                  </Link>
                ))}
                {lastFilters?.city || lastFilters?.status ? (
                  <Link
                    href={`/properties?${new URLSearchParams({
                      ...(lastFilters.city ? { city: lastFilters.city } : {}),
                      ...(lastFilters.status ? { status: lastFilters.status } : {}),
                      ...(lastFilters.type ? { type: lastFilters.type } : {}),
                    }).toString()}`}
                    onClick={() => setOpen(false)}
                    className="btn-ghost mt-2 w-full text-xs"
                  >
                    View all filtered results
                  </Link>
                ) : null}
              </div>
            )}

            {/* Suggestions */}
            <div className="mt-6">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-fog">
                Try saying
              </p>
              <div className="flex flex-wrap gap-2">
                {examples.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    className="rounded-full border border-white/10 px-3 py-1.5 text-left text-xs text-fog transition hover:border-brass/40 hover:text-brass"
                    onClick={() => handleCommand(ex)}
                  >
                    “{ex}”
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-6 text-center font-mono text-[9px] text-fog/60">
              Shortcut: ⌘/Ctrl + Shift + V · Tap orb to talk
            </p>
          </div>
        </div>
      )}
    </>
  );
}
