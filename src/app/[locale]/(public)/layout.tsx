import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CookieConsent } from "@/components/consent/CookieConsent";

// Public site chrome (header + footer). The admin lives outside this group and
// renders its own shell. setRequestLocale keeps these pages statically rendered.
export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tc = await getTranslations("Cookies");

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <CookieConsent
        labels={{
          title: tc("title"),
          body: tc("body"),
          acceptAll: tc("acceptAll"),
          essential: tc("essential"),
          privacy: tc("privacy"),
        }}
      />
    </div>
  );
}
