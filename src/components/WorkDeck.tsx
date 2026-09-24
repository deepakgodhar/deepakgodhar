"use client";

import { useEffect, useRef } from "react";
import { content } from "@/content";

const jobs = content.work;

// Where each card sits for a given distance `d` from the front of the deck:
// d < 0 already pulled away, 0 front, > 0 waiting behind. Cards are solid paper:
// the ones behind are shaded darker rather than faded (so their text never shows
// through), and a card leaving the front stays solid until it's off the stage.
// Each card carries its own perspective and the stack order is explicit, so a
// moving card never cuts through the one behind it.
export function cardStyle(d: number, i: number) {
  if (d < 0) {
    const t = Math.min(1, -d);
    const e = t * t * (3 - 2 * t);
    return {
      transform: `perspective(1400px) translate3d(0, ${-e * 105}vh, ${e * 60}px) rotateX(${e * 32}deg)`,
      opacity: String(t < 0.92 ? 1 : Math.max(0, 1 - (t - 0.92) / 0.08)),
      filter: "",
      zIndex: String(200 + i),
    };
  }
  const shade = 1 - Math.min(d, 3) * 0.12;
  return {
    transform: `perspective(1400px) translate3d(0, ${-d * 30}px, ${-d * 100}px) rotateX(${-d * 3}deg)`,
    opacity: d > 3 ? "0" : "1",
    filter: shade < 1 ? `brightness(${shade})` : "",
    zIndex: String(100 - Math.round(d * 10)),
  };
}

// The deck's visible stage. `aside` replaces the lede under the title and `overlay`
// is drawn over the whole stage (both used by the prototype variants).
export function DeckStage({
  cardRef,
  aside,
  overlay,
}: {
  cardRef?: (i: number, el: HTMLElement | null) => void;
  aside?: React.ReactNode;
  overlay?: React.ReactNode;
}) {
  return (
    <div className="deck-stage">
      {overlay}
      <header className="deck-head">
        <h2 className="section-title">Where I’ve worked</h2>
        {aside ?? <p className="section-lede">Twelve years, three companies. Scroll to flip through them.</p>}
      </header>

      <ol className="deck-cards">
        {jobs.map((job, i) => (
          <li
            key={job.company}
            ref={cardRef ? (el) => cardRef(i, el) : undefined}
            className="deck-card"
            style={cardStyle(i, i)}
          >
            <div className="deck-card-top">
              <p className="deck-years">{job.years}</p>
              <p className="deck-count">
                {i + 1} of {jobs.length}
              </p>
            </div>
            <h3 className="deck-role">{job.role}</h3>
            <p className="deck-company">{job.company}</p>
            <p className="deck-summary">{job.summary}</p>
            <ul className="deck-highlights">
              {job.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <ul className="deck-stack" aria-label="Tech used">
              {job.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

// A stack of career cards in 3D. The section is tall and its stage is sticky;
// scrolling through it pulls the front card up and away to reveal the next.
// With reduced motion the cards are simply listed.
export default function WorkDeck({
  aside,
  overlay,
  onProgress,
}: {
  aside?: React.ReactNode;
  overlay?: React.ReactNode;
  // Called every frame with the deck position (0 = first card … n-1 = last).
  onProgress?: (current: number) => void;
} = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.dataset.static = "true";
      return;
    }

    let raf = 0;
    let current = 0;
    let target = 0;

    const measure = () => {
      const r = section.getBoundingClientRect();
      const travel = r.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(travel, 1)));
      // Hold the last card for a moment at the end of the section.
      target = Math.min(jobs.length - 1, p * (jobs.length - 0.6));
    };

    const render = () => {
      current += (target - current) * 0.14;
      if (Math.abs(target - current) < 0.0005) current = target;
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const d = i - current;
        Object.assign(card.style, cardStyle(d, i));
        card.style.pointerEvents = Math.abs(d) < 0.5 ? "auto" : "none";
      });
      onProgress?.(current);
      raf = requestAnimationFrame(render);
    };

    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onProgress is read live each frame
  }, []);

  return (
    <section id="work" ref={sectionRef} className="deck" style={{ "--cards": jobs.length } as React.CSSProperties}>
      <DeckStage
        aside={aside}
        overlay={overlay}
        cardRef={(i, el) => {
          cardRefs.current[i] = el;
        }}
      />
    </section>
  );
}
