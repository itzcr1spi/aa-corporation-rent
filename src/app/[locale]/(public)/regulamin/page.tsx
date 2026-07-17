import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LegalArticle } from "@/components/legal/LegalArticle";
import { getLegalDoc } from "@/lib/legal/content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const doc = getLegalDoc("terms", locale);
  return { title: `${doc.title} — A&A Corporation`, description: doc.intro };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalArticle doc={getLegalDoc("terms", locale)} />;
}
