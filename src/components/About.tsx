import { content } from "@/content";

const { statement, principles, toolbox } = content.about;

// `variant="how"` is the "How I work" section used after the intro scene (the
// statement is already shown in the intro's About panel).
export default function About({ variant = "about" }: { variant?: "about" | "how" }) {
  const how = variant === "how";
  return (
    <section id={how ? "how" : "about"} className="about">
      <div className="about-inner">
        <h2 className="section-title" data-commit>
          {how ? "How I work" : "About"}
        </h2>
        {!how && <p className="about-statement">{statement}</p>}

        <div className="about-grid">
          <div>
            <h3 className="about-sub">How I lead</h3>
            <dl className="principles">
              {principles.map((p) => (
                <div key={p.title} className="principle">
                  <dt>{p.title}</dt>
                  <dd>{p.body}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h3 className="about-sub">What I bring</h3>
            <ul className="toolbox">
              {toolbox.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
