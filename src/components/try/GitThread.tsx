"use client";

import { useEffect, useRef } from "react";
import WorkDeck from "@/components/WorkDeck";
import { content } from "@/content";

// Prototype 1 — "commit history". A glowing line leaves the avatar at the bottom of
// the hero, curves into the left gutter and runs down the whole page like a git
// branch. In Work it becomes a commit log (one commit per job, lit as the cards
// flip); in About and Contact it keeps drawing as you scroll and ends on HEAD.

const jobs = content.work;

// --- Work: commit log + the branch drawn over the deck stage ---------------------
export function GitDeck() {
  const svgRef = useRef<SVGSVGElement>(null);
  const curveRef = useRef<SVGPathElement>(null);
  const trackRef = useRef<SVGLineElement>(null);
  const fillRef = useRef<SVGLineElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const progress = useRef(0);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const svg = svgRef.current;
      const list = listRef.current;
      const curve = curveRef.current;
      if (svg && list && curve && trackRef.current && fillRef.current) {
        const stage = svg.getBoundingClientRect();
        const dots = [...list.querySelectorAll<HTMLElement>(".git-dot")].map((d) => {
          const r = d.getBoundingClientRect();
          return { x: r.left + r.width / 2 - stage.left, y: r.top + r.height / 2 - stage.top };
        });
        if (dots.length) {
          const gx = dots[0].x;
          const headX = window.innerWidth * (window.innerWidth < 768 ? 0.5 : 0.63) - stage.left;
          const y0 = dots[0].y - 90;
          // Curve from under the avatar (top of this stage = bottom of the hero) into the gutter.
          curve.setAttribute("d", `M ${headX} 0 C ${headX} ${y0 * 0.55}, ${gx} ${y0 * 0.45}, ${gx} ${y0}`);
          const len = curve.getTotalLength();
          // Draw the curve as the deck slides up to meet the hero's bottom edge.
          const enter = Math.min(1, Math.max(0, 1 - stage.top / window.innerHeight));
          curve.style.strokeDasharray = `${len}`;
          curve.style.strokeDashoffset = `${len * (1 - enter)}`;

          const t = trackRef.current;
          const f = fillRef.current;
          for (const l of [t, f]) {
            l.setAttribute("x1", `${gx}`);
            l.setAttribute("x2", `${gx}`);
            l.setAttribute("y1", `${y0}`);
          }
          t.setAttribute("y2", `${stage.height}`);
          // Fill down to the active commit, then on to the bottom after the last one.
          const c = progress.current;
          const i = Math.floor(c);
          const a = dots[Math.min(i, dots.length - 1)].y;
          const b = i + 1 < dots.length ? dots[i + 1].y : stage.height;
          const end = enter < 1 ? y0 : a + (b - a) * (c - i);
          f.setAttribute("y2", `${Math.max(y0, end)}`);
          list.querySelectorAll("li").forEach((li, k) => {
            li.dataset.state = k < Math.round(c) ? "done" : k === Math.round(c) ? "head" : "todo";
          });
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <WorkDeck
      onProgress={(c) => (progress.current = c)}
      overlay={
        <svg ref={svgRef} className="git-svg" aria-hidden>
          <path ref={curveRef} className="git-line" />
          <line ref={trackRef} className="git-track" />
          <line ref={fillRef} className="git-line" />
        </svg>
      }
      aside={
        <ol ref={listRef} className="git-log">
          {jobs.map((j) => (
            <li key={j.company}>
              <span className="git-dot" />
              <span className="git-years">{j.years}</span>
              <span className="git-msg">
                {j.role} at {j.company}
              </span>
            </li>
          ))}
        </ol>
      }
    />
  );
}

// --- About + Contact: the branch keeps drawing down the gutter ----------------------
export function GitRest({ children }: { children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const wrap = wrapRef.current;
      const fill = fillRef.current;
      if (wrap && fill) {
        const r = wrap.getBoundingClientRect();
        const gx = fill.getBoundingClientRect().left + 1;
        const drawn = Math.min(r.height, Math.max(0, window.innerHeight * 0.55 - r.top));
        fill.style.height = `${drawn}px`;
        wrap.querySelectorAll<HTMLElement>("[data-commit]").forEach((n) => {
          const nr = n.getBoundingClientRect();
          n.dataset.lit = nr.top + nr.height / 2 < window.innerHeight * 0.55 ? "true" : "false";
          n.style.setProperty("--dx", `${gx - nr.left}px`);
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={wrapRef} className="rest git-rest">
      <div className="git-rail" aria-hidden>
        <div ref={fillRef} className="git-rail-fill" />
      </div>
      {children}
    </div>
  );
}
