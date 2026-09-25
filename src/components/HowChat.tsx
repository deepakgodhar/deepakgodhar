"use client";

import { Fragment, useEffect, useRef } from "react";
import { content } from "@/content";

const { principles, toolbox } = content.about;
const QUESTION = "How does Deepak work?";

// "How I work" as an AI chat: when the section comes into view the question types
// itself, the answer streams in word by word (one principle at a time), and the
// toolbox arrives as the answer's cited sources.
// All the text is in the page from the start; JS only hides it while it plays.
export default function HowChat() {
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chat = chatRef.current;
    if (!chat) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const q = chat.querySelector<HTMLElement>(".chat-q-text")!;
    const words = [...chat.querySelectorAll<HTMLElement>(".chat-a .w")];
    const points = [...chat.querySelectorAll<HTMLElement>(".chat-point")];
    const chips = [...chat.querySelectorAll<HTMLElement>(".chat-source")];
    chat.dataset.armed = "true";
    q.textContent = "";

    let cancelled = false;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const play = async () => {
      chat.dataset.stage = "asking";
      for (let i = 1; i <= QUESTION.length && !cancelled; i++) {
        q.textContent = QUESTION.slice(0, i);
        await wait(38);
      }
      chat.dataset.stage = "thinking";
      await wait(900);
      chat.dataset.stage = "answering";
      let w = 0;
      for (const point of points) {
        point.dataset.started = "true";
        point.dataset.streaming = "true";
        const n = point.querySelectorAll(".w").length;
        for (let i = 0; i < n && !cancelled; i++) {
          words[w++].classList.add("on");
          await wait(22);
        }
        delete point.dataset.streaming;
        await wait(260);
      }
      chat.dataset.stage = "sources";
      await wait(60); // let the chips render hidden first so they animate in
      for (const chip of chips) {
        if (cancelled) return;
        chip.classList.add("on");
        await wait(70);
      }
      chat.dataset.stage = "done";
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        play();
      },
      { threshold: 0.35 },
    );
    io.observe(chat);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, []);

  // Each word is its own span so it can be revealed in order.
  const split = (text: string) =>
    text.split(" ").map((word, i) => (
      <Fragment key={i}>
        {i > 0 && " "}
        <span className="w">{word}</span>
      </Fragment>
    ));

  return (
    <section id="how" className="about">
      <div className="about-inner">
        <h2 className="section-title">How I work</h2>

        <div ref={chatRef} className="chat" data-stage="idle">
          <div className="chat-bar">
            <span className="chat-dot" aria-hidden />
            Ask about Deepak
          </div>

          <p className="chat-q">
            <span className="chat-q-text">{QUESTION}</span>
          </p>

          <div className="chat-a">
            <span className="chat-mark" aria-hidden>
              DG
            </span>
            <div className="chat-body">
              <span className="chat-thinking" aria-hidden>
                <i />
                <i />
                <i />
              </span>
              <ol className="chat-points">
                {principles.map((p) => (
                  <li key={p.title} className="chat-point">
                    <strong>{split(p.title)}</strong> {split(p.body)}
                  </li>
                ))}
              </ol>
              <p className="chat-sources-label">What I bring</p>
              <ul className="chat-sources">
                {toolbox.map((t, i) => (
                  <li key={t} className="chat-source">
                    <span className="chat-cite">{i + 1}</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
