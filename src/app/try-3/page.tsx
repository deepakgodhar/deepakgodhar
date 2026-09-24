import About from "@/components/About";
import Contact from "@/components/Contact";
import Cursor from "@/components/Cursor";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import ResumeModal from "@/components/ResumeModal";
import PixelShift from "@/components/try/PixelShift";
import WorkDeck from "@/components/WorkDeck";
import { heads } from "@/content";

// Prototype 3: the avatar dissolves into pixels that form the Work heading.
export default function Try3() {
  return (
    <main id="top" className="page">
      <Cursor />
      <Nav />
      <PixelShift>
        <Hero head={heads.video} />
      </PixelShift>
      <WorkDeck />
      <div className="rest">
        <About />
        <Contact />
      </div>
      <ResumeModal />
      <div className="grain" aria-hidden />
    </main>
  );
}
