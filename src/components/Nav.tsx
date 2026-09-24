"use client";

import { useEffect, useState } from "react";
import { content } from "@/content";

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
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
