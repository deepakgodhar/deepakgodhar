"use client";

import { useEffect, useRef } from "react";
import { DeckStage } from "@/components/WorkDeck";

// Prototype 3 — "pixels to code". Scrolling out of the hero, the avatar breaks into
// thousands of pixels that swirl across the screen and land as the "Where I’ve worked"
// heading. The hero sits on a sticky stage over a static copy of the Work deck; when
// the pixels have formed the heading, the copy's real heading and cards fade in and
// the real Work section (identical, sitting underneath) takes over.

type P = { sx: number; sy: number; tx: number; ty: number; cx: number; cy: number; r: number; g: number; b: number; d: number; keep: boolean };

const INK = [255, 247, 240];

export default function PixelShift({ children }: { children: React.ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const zstage = stageRef.current;
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    const copyEl = copyRef.current;
    if (!section || !zstage || !hero || !canvas || !copyEl) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.dataset.static = "true";
      return;
    }
    const ctx = canvas.getContext("2d")!;
    const heroCopy = hero.querySelector<HTMLElement>(".hero-copy");
    const cue = hero.querySelector<HTMLElement>(".scroll-cue");
    const headStage = hero.querySelector<HTMLElement>(".head-stage");
    const headCanvas = hero.querySelector<HTMLCanvasElement>(".head-canvas");
    const title = copyEl.querySelector<HTMLElement>(".section-title");
    const rest = [...copyEl.querySelectorAll<HTMLElement>(".section-lede, .deck-cards")];

    let parts: P[] = [];
    let cell = 3; // on-screen size of one sampled avatar pixel
    let captured = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const size = () => {
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
    };

    // Sample the avatar as it looks right now, and the heading's glyphs, into particles.
    const capture = () => {
      if (!headCanvas || !title) return false;
      const hr = headCanvas.getBoundingClientRect();
      const src = document.createElement("canvas");
      const SW = 260;
      const SH = Math.round((SW * hr.height) / hr.width);
      src.width = SW;
      src.height = SH;
      const sctx = src.getContext("2d")!;
      sctx.drawImage(headCanvas, 0, 0, SW, SH);
      const img = sctx.getImageData(0, 0, SW, SH).data;
      // The backdrop is a saturated orange-red; the avatar (hair, skin, glasses, shirt)
      // is much less saturated or much darker, so keep only those pixels.
      const sources: { x: number; y: number; r: number; g: number; b: number }[] = [];
      for (let y = 0; y < SH; y += 2) {
        for (let x = Math.round(SW * 0.2); x < SW * 0.8; x += 2) {
          const k = (y * SW + x) * 4;
          const R = img[k];
          const G = img[k + 1];
          const B = img[k + 2];
          const backdrop = R > 170 && G < 140 && B < 70 && R - G > 70;
          if (img[k + 3] > 200 && !backdrop) {
            sources.push({ x: hr.left + (x / SW) * hr.width, y: hr.top + (y / SH) * hr.height, r: img[k], g: img[k + 1], b: img[k + 2] });
          }
        }
      }

      // Heading glyphs: draw each rendered line of the title exactly where the browser
      // put it (word boxes from a Range), so the pixels land on the real heading.
      const cs = getComputedStyle(title);
      const tr = title.getBoundingClientRect();
      const txt = document.createElement("canvas");
      txt.width = Math.ceil(tr.width);
      txt.height = Math.ceil(tr.height);
      const tctx = txt.getContext("2d")!;
      const fontSize = parseFloat(cs.fontSize);
      tctx.font = `${cs.fontWeight} ${fontSize}px ${cs.fontFamily}`;
      tctx.fillStyle = "#fff";
      tctx.textBaseline = "alphabetic";
      const node = title.firstChild;
      const text = node?.textContent ?? "";
      const range = document.createRange();
      const m = tctx.measureText("Hg");
      const asc = m.fontBoundingBoxAscent;
      const desc = m.fontBoundingBoxDescent;
      let at = 0;
      for (const w of text.split(" ")) {
        const start = text.indexOf(w, at);
        at = start + w.length;
        if (!node || !w) continue;
        range.setStart(node, start);
        range.setEnd(node, at);
        const wr = range.getBoundingClientRect();
        const baseline = wr.top - tr.top + (wr.height - (asc + desc)) / 2 + asc;
        tctx.fillText(w, wr.left - tr.left, baseline);
      }
      const tdata = tctx.getImageData(0, 0, txt.width, txt.height).data;
      const targets: { x: number; y: number }[] = [];
      const step = Math.max(2, Math.round(fontSize / 22));
      for (let y = 0; y < txt.height; y += step) {
        for (let x = 0; x < txt.width; x += step) {
          if (tdata[(y * txt.width + x) * 4 + 3] > 128) targets.push({ x: tr.left + x, y: tr.top + y });
        }
      }
      if (!sources.length || !targets.length) return false;
      cell = (hr.width / SW) * 2;

      // Every target gets a source; spare sources drift off as dust.
      const shuffled = sources.map((s) => ({ s, k: Math.random() })).sort((a, b) => a.k - b.k).map((o) => o.s);
      const n = Math.max(targets.length, Math.min(shuffled.length, targets.length * 2));
      parts = [];
      for (let i = 0; i < n; i++) {
        const s = shuffled[i % shuffled.length];
        const keep = i < targets.length;
        const t = keep ? targets[i] : { x: s.x + (Math.random() - 0.5) * 600, y: s.y - 300 - Math.random() * 400 };
        // Swirl: bend each path through a point pushed out sideways.
        const mx = (s.x + t.x) / 2 + (Math.random() - 0.5) * window.innerWidth * 0.5;
        const my = (s.y + t.y) / 2 + (Math.random() - 0.5) * window.innerHeight * 0.5;
        parts.push({ sx: s.x, sy: s.y, tx: t.x, ty: t.y, cx: mx, cy: my, r: s.r, g: s.g, b: s.b, d: Math.random() * 0.35, keep });
      }
      return true;
    };

    const smooth = (a: number, b: number, v: number) => {
      const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };

    let raf = 0;
    const render = () => {
      raf = 0;
      const r = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(r.height - vh, 1)));

      const fade = String(1 - smooth(0, 0.1, p));
      if (heroCopy) heroCopy.style.opacity = fade;
      if (cue) cue.style.opacity = fade;
      zstage.style.visibility = p >= 0.999 ? "hidden" : "";

      const burst = 0.12;
      if (p < burst) {
        captured = false;
        hero.style.opacity = "1";
        if (headStage) headStage.style.opacity = "1";
        canvas.style.opacity = "0";
        if (title) title.style.opacity = "0";
        rest.forEach((e) => (e.style.opacity = "0"));
        return;
      }
      if (!captured) captured = capture();
      if (headStage) headStage.style.opacity = "0";
      // The hero's orange background melts away to the Work section's red underneath.
      hero.style.opacity = String(1 - smooth(burst, 0.45, p));
      canvas.style.opacity = "1";

      const q = (p - burst) / (0.88 - burst); // 0 → 1 across the flight
      const land = smooth(0.86, 0.97, p);
      if (title) title.style.opacity = String(land);
      rest.forEach((e) => (e.style.opacity = String(smooth(0.8, 0.97, p))));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const pt of parts) {
        const t = Math.min(1, Math.max(0, (q - pt.d) / (1 - 0.35)));
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const u = 1 - e;
        const x = u * u * pt.sx + 2 * u * e * pt.cx + e * e * pt.tx;
        const y = u * u * pt.sy + 2 * u * e * pt.cy + e * e * pt.ty;
        const c = pt.keep ? e : 0;
        const alpha = pt.keep ? 1 - land : Math.max(0, 1 - e * 1.4);
        if (alpha <= 0) continue;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgb(${pt.r + (INK[0] - pt.r) * c},${pt.g + (INK[1] - pt.g) * c},${pt.b + (INK[2] - pt.b) * c})`;
        // Start as full-size avatar pixels (so the portrait still reads), shrink in flight.
        const s = cell + (2.8 - cell) * Math.min(1, e * 2.5);
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
    };

    const request = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };
    const onResize = () => {
      size();
      captured = false;
      request();
    };
    size();
    render();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section ref={sectionRef} className="shift" aria-label="Introduction">
      <div ref={stageRef} className="shift-stage">
        <div ref={copyRef} className="shift-copy" aria-hidden inert>
          <DeckStage />
        </div>
        <div ref={heroRef} className="shift-hero">
          {children}
        </div>
        <canvas ref={canvasRef} className="shift-canvas" aria-hidden />
      </div>
    </section>
  );
}
