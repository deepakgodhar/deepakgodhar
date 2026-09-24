"use client";

import { useEffect, useRef, useState } from "react";
import { content } from "@/content";

// View-only resume. Opens whenever the URL hash is #resume (so any link to "#resume"
// opens it and the browser back button closes it). There is no file to download:
// the resume is rendered as page content, text selection and the context menu are
// disabled inside it, and it is hidden from print. (Screenshots can't be prevented.)
export default function ResumeModal() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const sync = () => setOpen(window.location.hash === "#resume");
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const close = () => {
    if (window.location.hash === "#resume") history.back();
    setOpen(false);
  };

  return (
    <dialog
      ref={dialogRef}
      className="resume"
      aria-label={`Resume of ${content.name}`}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <article className="resume-sheet">
        <button type="button" className="resume-close" onClick={close} aria-label="Close resume">
          ×
        </button>

        <header className="resume-head">
          <h2>{content.name}</h2>
          <p>{content.resume.title}, 12 years of experience</p>
        </header>

        <p className="resume-summary">{content.resume.summary}</p>

        <h3>Experience</h3>
        <ol className="resume-jobs">
          {content.work.map((job) => (
            <li key={job.company}>
              <div className="resume-job-head">
                <p className="resume-job-role">
                  {job.role}, {job.company}
                </p>
                <p className="resume-job-years">{job.years}</p>
              </div>
              <ul>
                {job.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <h3>Projects</h3>
        <ul className="resume-projects">
          {content.projects.map((p) => (
            <li key={p.name}>
              <p className="resume-job-role">
                {p.name} <span className="resume-job-years">— {p.role}</span>
              </p>
              <p>{p.about}</p>
              <p className="resume-job-years">{p.stack}</p>
            </li>
          ))}
        </ul>

        <h3>Education</h3>
        {content.resume.education.map((e) => (
          <p key={e.degree}>
            {e.degree}, {e.school} ({e.years})
          </p>
        ))}

        <h3>Skills</h3>
        <p>{content.about.toolbox.join(", ")}</p>

        <p className="resume-note">
          Want a copy? <a href="#contact" onClick={() => setOpen(false)}>Get in touch</a> and I’ll send one over.
        </p>
      </article>
    </dialog>
  );
}
