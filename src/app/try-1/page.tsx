import About from "@/components/About";
import Contact from "@/components/Contact";
import Cursor from "@/components/Cursor";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import ResumeModal from "@/components/ResumeModal";
import { GitDeck, GitRest } from "@/components/try/GitThread";
import { heads } from "@/content";

// Prototype 1: the career as a git branch drawn down the page.
export default function Try1() {
  return (
    <main id="top" className="page">
      <Cursor />
      <Nav />
      <Hero head={heads.video} />
      <GitDeck />
      <GitRest>
        <About />
        <Contact />
      </GitRest>
      <ResumeModal />
      <div className="grain" aria-hidden />
    </main>
  );
}
