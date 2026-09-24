"use client";

import { useEffect, useRef } from "react";
import { content } from "@/content";

// Career as a glowing timeline. The line fills from the top as you scroll and a bright
// dot rides its end (kept at the middle of the screen); each job lights up as the dot
// reaches it.
export default function Timeline() {
  const listRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const fill = fillRef.current;
    const dot = dotRef.current;
    if (!list || !fill || !dot) return;
    const items = [...list.querySelectorAll<HTMLElement>(".tl-item")];
    let raf = 0;
    const render = () => {
      raf = 0;
      const r = list.getBoundingClientRect();
      const y = Math.min(r.height, Math.max(0, window.innerHeight * 0.5 - r.top));
      fill.style.height = `${y}px`;
      dot.style.transform = `translateY(${y}px)`;
      dot.style.opacity = y > 0 && y < r.height ? "1" : "0.4";
      for (const it of items) {
        const top = it.offsetTop;
        it.dataset.lit = y >= top + 10 ? "true" : "false";
      }
    };
    const request = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };
    render();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, []);

  return (
    <section id="career" className="career">
      <div className="career-inner">
        <header className="career-head">
          <h2 className="section-title">Career</h2>
          <p className="section-lede">Twelve years, from writing the code to leading the teams that write it.</p>
        </header>

        <div ref={listRef} className="tl">
          <div className="tl-track" aria-hidden>
            <div ref={fillRef} className="tl-fill" />
            <div ref={dotRef} className="tl-dot" />
          </div>
          <ol className="tl-list">
          {content.work.map((job) => (
            <li key={job.company} className="tl-item" data-lit="false">
              <p className="tl-years">{job.years}</p>
              <div className="tl-body">
                <h3 className="tl-role">{job.role}</h3>
                <p className="tl-company">{job.company}</p>
                <p className="tl-summary">{job.summary}</p>
                {job.highlights.length > 0 && (
                <ul className="tl-highlights">
                  {job.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
                )}
                {job.stack.length > 0 && (
                <ul className="tl-stack" aria-label="Tech used">
                  {job.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                )}
              </div>
            </li>
          ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
