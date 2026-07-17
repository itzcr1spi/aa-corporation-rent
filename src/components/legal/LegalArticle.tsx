import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import type { LegalDoc } from "@/lib/legal/content";

export function LegalArticle({ doc }: { doc: LegalDoc }) {
  return (
    <Container className="py-16 md:py-24">
      <div className="max-w-3xl">
        <Reveal>
          <p className="label-tight text-[10px] text-ink-faint">
            {doc.updatedLabel}
          </p>
          <h1 className="mt-4 font-heading text-4xl font-bold md:text-5xl">
            {doc.title}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-ink-muted">
            {doc.intro}
          </p>
          <p className="mt-6 border-l-2 border-line-strong pl-4 text-xs italic text-ink-faint">
            {doc.note}
          </p>
        </Reveal>

        <div className="mt-14 space-y-12">
          {doc.sections.map((s, i) => (
            <Reveal key={s.h} delay={Math.min(i, 4) * 0.04}>
              <section>
                <h2 className="font-heading text-lg font-bold text-white">
                  {s.h}
                </h2>
                <div className="mt-3 space-y-3">
                  {s.p.map((para, j) => (
                    <p
                      key={j}
                      className="text-sm leading-relaxed text-ink-muted"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </section>
            </Reveal>
          ))}
        </div>
      </div>
    </Container>
  );
}
