import HeadTracker from "@/components/HeadTracker";
import type { HeadConfig } from "@/content";
import { content } from "@/content";

export default function Hero({ head }: { head: HeadConfig }) {
  return (
    <div className="hero relative h-svh min-h-[560px] w-full overflow-hidden">
      {/* Character */}
      <div className="head-stage">
        <HeadTracker head={head} />
      </div>

      {/* Copy */}
      <div className="hero-copy relative z-10 flex h-full flex-col px-6 sm:px-12 lg:px-20">
        <p className="hero-greeting rise" style={{ animationDelay: "0.1s" }}>
          {content.greeting}
        </p>
        <h1 className="hero-name font-script rise" style={{ animationDelay: "0.2s" }}>
          {content.name}
        </h1>
        <p className="hero-role rise" style={{ animationDelay: "0.3s" }}>
          {content.role}
        </p>
        <p className="hero-tagline rise" style={{ animationDelay: "0.4s" }}>
          {content.tagline}
        </p>
        <div className="rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "0.5s" }}>
          <a href="https://www.linkedin.com/in/deepak-godhar" target="_blank" rel="noreferrer" className="btn btn-light">
            LinkedIn profile
          </a>
          <a href="#contact" className="btn btn-ghost">
            Let’s talk
          </a>
        </div>
      </div>

      <a href="#about" className="scroll-cue" aria-label="Scroll to about">
        <span />
      </a>
    </div>
  );
}
