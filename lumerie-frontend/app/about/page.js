import CrownMark from "@/components/CrownMark";
import { aboutPage } from "@/lib/site-content";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 md:px-10 py-20">
      <div className="text-center mb-14">
        <CrownMark className="w-12 h-8 text-gold mx-auto mb-6" />
        <p className="label-caps text-gold mb-3">About Us</p>
        <h1 className="font-display text-4xl mb-4">{aboutPage.title}</h1>
        <p className="text-ink-muted text-lg">{aboutPage.intro}</p>
      </div>

      <div className="space-y-12">
        {aboutPage.sections.map((s) => (
          <div key={s.heading}>
            <h2 className="font-display text-2xl mb-3 text-gold">{s.heading}</h2>
            <p className="text-ink-muted leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
