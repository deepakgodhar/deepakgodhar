"use client";

import { useEffect, useState } from "react";
import { content } from "@/content";

// Tab-bar icons (shown on phones, where the nav becomes an app-style bottom bar).
const ICONS: Record<string, React.ReactNode> = {
  "#about": <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>,
  "#what": <><rect x="3" y="5" width="18" height="12" rx="2" /><path d="M2 20h20" /></>,
  "#career": <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M3 13h18" /></>,
  "#resume": <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /><path d="M8 13h8M8 17h5" /></>,
  "#contact": <><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.7A8 8 0 1 1 21 12z" /></>,
};

// Floating glass pill. Highlights the section currently in view: the last nav target
// whose top has scrolled above the middle of the screen.
export default function Nav() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const ids = content.nav.map((n) => n.href.slice(1)).filter((id) => id !== "resume");
    let raf = 0;
    const update = () => {
      raf = 0;
      let current = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.5) current = id;
      }
      setActive(current);
    };
    const request = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", request, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", request);
    };
  }, []);

  return (
    <nav className="nav" aria-label="Main">
      <ul className="glass nav-pill">
        {content.nav.map((item) => (
          <li key={item.label}>
            <a
              href={item.href}
              className="nav-link"
              aria-current={active && item.href === `#${active}` ? "true" : undefined}
            >
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                {ICONS[item.href]}
              </svg>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
