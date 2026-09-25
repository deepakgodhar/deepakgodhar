"use client";

import { useEffect, useRef, useState } from "react";
import HeadTracker from "@/components/HeadTracker";
import { content, type AnyHead } from "@/content";

// With `avatar`, the head comes back at the end of the page: it rises into a glowing
// circle as the section scrolls in, follows the cursor again, and says a line when
// the buttons are hovered.
export default function Contact({ avatar }: { avatar?: AnyHead }) {
  const [copied, setCopied] = useState(false);
  const [hovering, setHovering] = useState(false);
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const orb = orbRef.current;
    if (!orb) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        orb.dataset.in = "true";
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    io.observe(orb);
    return () => io.disconnect();
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${content.email}`;
    }
  };

  const say = copied ? "Copied — talk soon!" : hovering ? "Drop me a line!" : "";

  return (
    <section id="contact" className={avatar ? "contact contact-with-avatar" : "contact"}>
      <div className="contact-inner">
        {avatar && (
          <div className="contact-avatar">
            <div ref={orbRef} className="contact-orb">
              <div className="head-stage contact-head">
                <HeadTracker head={avatar} />
              </div>
            </div>
            <p className="contact-say" data-show={say ? "true" : "false"} aria-live="polite">
              {say}
            </p>
          </div>
        )}
        <h2 className="contact-title" data-commit>Let’s talk</h2>
        <p className="contact-lede">
          Hiring an engineering leader, building a team, or just want to compare notes? I reply to every message.
        </p>

        <div
          className="contact-actions"
          onPointerOver={(e) => setHovering(!!(e.target as Element).closest(".btn"))}
          onPointerLeave={() => setHovering(false)}
        >
          <a href={`mailto:${content.email}`} className="btn btn-light btn-lg">
            Email me
          </a>
          <button type="button" onClick={copy} className="btn btn-ghost btn-lg" aria-live="polite">
            {copied ? "Email copied" : content.email}
          </button>
        </div>

        <ul className="socials">
          {content.socials.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <footer className="footer">
        <p>© {new Date().getFullYear()} {content.name}</p>
        <a href="#top">Back to top</a>
      </footer>
    </section>
  );
}
