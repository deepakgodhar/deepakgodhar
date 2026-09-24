"use client";

import { useEffect, useRef } from "react";

// Prototype 2 — "you're the presenter". The avatar doesn't scroll away with the hero:
// it glides from its hero spot down into the bottom-left corner and stays there for
// the rest of the page, still following the cursor. Whenever a new section (or the
// next work card) arrives, it turns to look at it for a moment, as if presenting it.
//
// Wraps the page; finds the hero's .head-stage and drives it with fixed positioning.
export default function Presenter({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const stage = root?.querySelector<HTMLElement>(".head-stage");
    if (!root || !stage) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Hero placement (from the CSS) and the docked corner placement, in px.
    const heroBox = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mobile = vw < 768;
      const h = (mobile ? 0.58 : 0.9) * vh;
      const w = (h * 16) / 9;
      const cx = (mobile ? 0.5 : 0.63) * vw;
      return { left: cx - w / 2, top: vh * 1.02 - h, w, h };
    };
    const dockBox = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = vw < 768 ? vw * 0.62 : Math.min(vw * 0.36, 620);
      const h = (w * 9) / 16;
      return { left: -w * 0.18, top: vh - h * 0.96, w, h };
    };
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    stage.classList.add("presenter-stage");
    let raf = 0;
    const place = () => {
      raf = 0;
      const t = reduce ? (window.scrollY > 10 ? 1 : 0) : ease(Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.85))));
      const a = heroBox();
      const b = dockBox();
      const lerp = (x: number, y: number) => x + (y - x) * t;
      stage.style.left = `${lerp(a.left, b.left)}px`;
      stage.style.top = `${lerp(a.top, b.top)}px`;
      stage.style.height = `${lerp(a.h, b.h)}px`;
      stage.style.width = `${lerp(a.w, b.w)}px`;
      root.dataset.docked = t > 0.98 ? "true" : "false";
    };
    const request = () => {
      if (!raf) raf = requestAnimationFrame(place);
    };
    place();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);

    // Look at each section / card as it arrives.
    const look = (el: Element, ms = 1600) => {
      const r = el.getBoundingClientRect();
      window.dispatchEvent(
        new CustomEvent("head:look", { detail: { x: r.left + r.width / 2, y: r.top + Math.min(r.height / 2, 200), ms } }),
      );
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting && window.scrollY > window.innerHeight * 0.5) look(e.target);
      },
      { threshold: 0.35 },
    );
    root.querySelectorAll(".section-title, .about-statement, .principles, .toolbox, .contact-title, .contact-actions").forEach((el) => io.observe(el));

    // Work cards: look at the front card whenever it changes.
    let lastFront = -1;
    const cards = [...root.querySelectorAll<HTMLElement>(".deck-card")];
    const watch = window.setInterval(() => {
      const front = cards.findIndex((c) => c.style.pointerEvents === "auto");
      if (front >= 0 && front !== lastFront && window.scrollY > window.innerHeight * 0.5) {
        lastFront = front;
        look(cards[front], 1300);
      }
    }, 150);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(watch);
      io.disconnect();
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, []);

  return (
    <div ref={rootRef} className="presenter" data-docked="false">
      {children}
    </div>
  );
}
