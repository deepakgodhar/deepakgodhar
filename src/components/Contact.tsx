"use client";

import { useState } from "react";
import { content } from "@/content";

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${content.email}`;
    }
  };

  return (
    <section id="contact" className="contact">
      <div className="contact-inner">
        <h2 className="contact-title" data-commit>Let’s talk</h2>
        <p className="contact-lede">
          Hiring an engineering leader, building a team, or just want to compare notes? I reply to every message.
        </p>

        <div className="contact-actions">
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
