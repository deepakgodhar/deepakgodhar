import About from "@/components/About";
import Contact from "@/components/Contact";
import Cursor from "@/components/Cursor";
import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import Nav from "@/components/Nav";
import ResumeModal from "@/components/ResumeModal";
import Timeline from "@/components/Timeline";
import type { HeadConfig } from "@/content";

// Hero → About → What I do (one scroll scene) → Career → How I work → Contact.
export default function Portfolio({ head }: { head: HeadConfig }) {
  return (
    <main id="top" className="page">
      <Cursor />
      <Nav />
      <Intro>
        <Hero head={head} />
      </Intro>
      <div className="rest">
        <Timeline />
        <About variant="how" />
        <Contact />
      </div>
      <ResumeModal />
      <div className="grain" aria-hidden />
    </main>
  );
}
