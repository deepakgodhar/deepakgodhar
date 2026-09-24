"use client";

import { useEffect, useRef } from "react";
import { content } from "@/content";

// The opening scroll scene: Hero → About → What I do, on one sticky stage.
//
//  1. Hero: name on the left, head on the right following the cursor.
//  2. About: the name fades, the head glides to the left and grows, and the About
//     text comes in on the right — the head keeps watching the cursor.
//  3. What I do: the head shrinks and moves until it sits exactly where the desk
//     character's head is, looks down at the laptop, and cross-fades into the looping
//     video of the character typing. The services appear on the right, one by one.
//
// Positions are all computed from the viewport, so the match cut lines up at any size.

// Desk video frame (1920×1080): where the portrait head must land (tuned so the
// down-left-turned portrait face overlays the desk character's face), as fractions.
const DESK_HEAD = { x: 0.47, y: 0.215, h: 0.22 };
// Portrait frames: centre and height of the head, as fractions of the frame.
const HEAD = { x: 0.5, y: 0.37, h: 0.64 };

type Box = { left: number; top: number; w: number; h: number };

export default function Intro({ children }: { children: React.ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const whatRef = useRef<HTMLDivElement>(null);
  const deskRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const about = aboutRef.current;
    const what = whatRef.current;
    const desk = deskRef.current;
    const video = videoRef.current;
    if (!section || !about || !what || !desk || !video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) section.dataset.static = "true";

    const heroCopy = section.querySelector<HTMLElement>(".hero-copy");
    const cue = section.querySelector<HTMLElement>(".scroll-cue");
    const head = section.querySelector<HTMLElement>(".head-stage");
    const cards = [...what.querySelectorAll<HTMLElement>(".service")];

    const clamp = (v: number) => Math.min(1, Math.max(0, v));
    const smooth = (a: number, b: number, v: number) => {
      const t = clamp((v - a) / (b - a));
      return t * t * (3 - 2 * t);
    };
    const mix = (a: Box, b: Box, t: number): Box => ({
      left: a.left + (b.left - a.left) * t,
      top: a.top + (b.top - a.top) * t,
      w: a.w + (b.w - a.w) * t,
      h: a.h + (b.h - a.h) * t,
    });

    const boxes = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mobile = vw < 768;
      const frame = (h: number, cx: number, bottom: number): Box => {
        const w = (h * 16) / 9;
        return { left: cx - w / 2, top: bottom - h, w, h };
      };
      const hero = mobile ? frame(vh * 0.58, vw * 0.5, vh * 1.02) : frame(vh * 0.9, vw * 0.63, vh * 1.02);
      const aboutBox = mobile ? frame(vh * 0.5, vw * 0.5, vh * 0.56) : frame(vh * 1.02, vw * 0.27, vh * 1.04);
      // Desk video placement: character on the right, facing the services on the left.
      const dw = mobile ? vw * 1.7 : (vh * 16) / 9;
      const dh = (dw * 9) / 16;
      const deskBox: Box = mobile
        ? { left: vw * 0.5 - dw * 0.4, top: vh * 0.06, w: dw, h: dh }
        : { left: vw * 0.77 - dw * 0.36, top: 0, w: dw, h: dh };
      // Where the portrait must be for its head to sit exactly on the desk character's head.
      const hh = DESK_HEAD.h * deskBox.h;
      const ph = hh / HEAD.h;
      const pw = (ph * 16) / 9;
      const match: Box = {
        left: deskBox.left + DESK_HEAD.x * deskBox.w - HEAD.x * pw,
        top: deskBox.top + DESK_HEAD.y * deskBox.h - HEAD.y * ph,
        w: pw,
        h: ph,
      };
      return { hero, aboutBox, deskBox, match };
    };

    let raf = 0;
    // While landing on the desk, keep the head looking down-left at the laptop (like
    // the desk character) — re-sent every frame so the cursor can't pull it away.
    let lookDown = false;
    let lookRaf = 0;
    const holdLook = () => {
      if (lookDown && head) {
        const hb = head.getBoundingClientRect();
        window.dispatchEvent(
          new CustomEvent("head:look", {
            // Straight down-left (45°) so it lands squarely on the down-left pose.
            detail: { x: hb.left + hb.width * 0.5 - 700, y: hb.top + hb.height * 0.37 + 700, ms: 200 },
          }),
        );
      }
      lookRaf = requestAnimationFrame(holdLook);
    };
    lookRaf = requestAnimationFrame(holdLook);
    const render = () => {
      raf = 0;
      const r = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = reduce ? 0 : clamp(-r.top / Math.max(r.height - vh, 1));
      const { hero, aboutBox, deskBox, match } = boxes();

      // 1 → 2: hero copy out, head to the left, About in.
      const toAbout = smooth(0, 0.14, p);
      // 2 → 3: head onto the desk character's head, then cross-fade to the video.
      const toDesk = smooth(0.42, 0.55, p);
      const heroFade = String(1 - smooth(0, 0.08, p));
      if (heroCopy) heroCopy.style.opacity = heroFade;
      if (cue) cue.style.opacity = heroFade;

      if (head) {
        const b = toDesk > 0 ? mix(aboutBox, match, toDesk) : mix(hero, aboutBox, toAbout);
        head.style.left = `${b.left}px`;
        head.style.top = `${b.top}px`;
        head.style.width = `${b.w}px`;
        head.style.height = `${b.h}px`;
        head.style.opacity = String(1 - smooth(0.52, 0.57, p));
        // Once it leaves the bottom of the screen, fade the frame's edges on all sides
        // so it never shows as a box.
        head.style.maskImage = head.style.webkitMaskImage =
          toDesk > 0 ? "radial-gradient(ellipse 34% 46% at 50% 44%, #000 62%, transparent 100%)" : "";
      }

      lookDown = p > 0.4 && p < 0.6;

      const aboutIn = smooth(0.08, 0.2, p) * (1 - smooth(0.4, 0.47, p));
      about.style.opacity = String(aboutIn);
      about.style.transform = `translateY(${(1 - smooth(0.08, 0.2, p)) * 40 - smooth(0.4, 0.47, p) * 40}px)`;
      about.style.visibility = aboutIn > 0.01 ? "visible" : "hidden";

      desk.style.left = `${deskBox.left}px`;
      desk.style.top = `${deskBox.top}px`;
      desk.style.width = `${deskBox.w}px`;
      desk.style.height = `${deskBox.h}px`;
      const deskIn = smooth(0.5, 0.56, p);
      desk.style.opacity = String(deskIn);
      if (deskIn > 0 && video.paused) video.play().catch(() => {});
      if (deskIn === 0 && !video.paused) video.pause();

      const whatIn = smooth(0.56, 0.63, p);
      what.style.opacity = String(whatIn);
      what.style.visibility = whatIn > 0.01 ? "visible" : "hidden";
      cards.forEach((c, i) => {
        const t = smooth(0.62 + i * 0.08, 0.7 + i * 0.08, p);
        c.style.opacity = String(t);
        c.style.transform = `translateY(${(1 - t) * 50}px) rotateX(${(1 - t) * -20}deg)`;
      });
    };

    const request = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };
    render();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(lookRaf);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, []);

  return (
    <section ref={sectionRef} className="intro" aria-label="Introduction">
      {/* Nav targets at the scroll points where each part is fully on screen. */}
      <span id="about" className="intro-anchor" style={{ top: "30%" }} />
      <span id="what" className="intro-anchor" style={{ top: "66%" }} />

      <div className="intro-stage">
        <div ref={deskRef} className="intro-desk" aria-hidden>
          <video
            ref={videoRef}
            src="/scenes/desk.mp4"
            poster="/scenes/desk-poster.jpg"
            muted
            loop
            playsInline
            preload="auto"
          />
        </div>

        {children}

        <div ref={aboutRef} className="intro-panel intro-about">
          <h2 className="section-title">About</h2>
          <p className="intro-statement">{content.about.statement}</p>
          <p className="intro-note">
            {content.role} with 12 years across e-commerce, healthcare and brand websites — now building with AI and LLMs like Claude.
          </p>
        </div>

        <div ref={whatRef} className="intro-panel intro-what">
          <h2 className="section-title">What I do</h2>
          <ul className="services">
            {content.services.map((s) => (
              <li key={s.title} className="service">
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
