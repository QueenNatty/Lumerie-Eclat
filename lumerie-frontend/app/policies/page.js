import { policiesPage, contact } from "@/lib/site-content";

export default function PoliciesPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 md:px-10 py-20">
      <div className="mb-14">
        <p className="label-caps text-gold mb-3">Good to Know</p>
        <h1 className="font-display text-4xl mb-4">{policiesPage.title}</h1>
        <p className="text-ink-muted text-lg">{policiesPage.intro}</p>
      </div>

      <div className="space-y-10">
        {policiesPage.sections.map((s) => (
          <div key={s.heading} className="border-t border-outline-soft pt-8">
            <h2 className="font-display text-xl mb-3">{s.heading}</h2>
            <p className="text-ink-muted leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 bg-surface-1 border border-outline-soft rounded-lg p-6">
        <p className="label-caps text-gold mb-3">Still Have Questions?</p>
        <p className="text-ink-muted text-sm">
          Email us at <span className="text-ink">{contact.email}</span> or reach out on Instagram{" "}
          <span className="text-ink">{contact.instagram}</span>.
        </p>
      </div>
    </div>
  );
}
