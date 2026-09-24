import About from "@/components/About";
import Contact from "@/components/Contact";
import Cursor from "@/components/Cursor";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import ResumeModal from "@/components/ResumeModal";
import Presenter from "@/components/try/Presenter";
import WorkDeck from "@/components/WorkDeck";
import { heads } from "@/content";

// Prototype 2: the avatar stays on screen and presents each section.
export default function Try2() {
  return (
    <main id="top" className="page">
      <Cursor />
      <Nav />
      <Presenter>
        <Hero head={heads.video} />
        <WorkDeck />
        <div className="rest">
          <About />
          <Contact />
        </div>
      </Presenter>
      <ResumeModal />
      <div className="grain" aria-hidden />
    </main>
  );
}
