import Contact from "@/components/Contact";
import Cursor from "@/components/Cursor";
import Hero from "@/components/Hero";
import HowChat from "@/components/HowChat";
import Intro from "@/components/Intro";
import Nav from "@/components/Nav";
import ResumeModal from "@/components/ResumeModal";
import Timeline from "@/components/Timeline";
import type { AnyHead } from "@/content";

// Hero → About → What I do (one scroll scene) → Career → How I work → Contact.
export default function Portfolio({ head }: { head: AnyHead }) {
  return (
    <main id="top" className="page">
      <Cursor />
      <Nav />
      <Intro deskHead={"kind" in head ? head.deskHead : undefined}>
        <Hero head={head} />
      </Intro>
      <div className="rest">
        <Timeline />
        <HowChat />
        <Contact avatar={head} />
      </div>
      <ResumeModal />
      <div className="grain" aria-hidden />
    </main>
  );
}
