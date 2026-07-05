import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/config/site";
import { mainNav } from "@/lib/config/site";

export function SiteFooter() {
  const t = useTranslations("Nav");
  const tf = useTranslations("Footer");
  const year = 2026; // build-time constant; bump via CI/date lib later

  return (
    <footer className="border-t border-line bg-void">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:px-10">
        <div>
          <p className="font-heading text-lg font-bold tracking-tight text-white">
            {siteConfig.name}
          </p>
          <p className="label-tight mt-2 text-xs text-red">{siteConfig.tagline}</p>
          <p className="mt-6 max-w-xs text-sm text-ink-muted">
            {tf("builtWith")}
          </p>
        </div>

        <nav className="flex flex-col gap-3">
          {mainNav.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="label-tight text-xs text-silver transition-colors hover:text-white"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3 text-sm text-ink-muted">
          <a href={siteConfig.phoneHref} className="hover:text-white">
            {siteConfig.phone}
          </a>
          <a href={`mailto:${siteConfig.email}`} className="hover:text-white">
            {siteConfig.email}
          </a>
          <span>{siteConfig.city}</span>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-6 py-6 text-xs text-ink-faint md:flex-row md:items-center md:justify-between md:px-10">
          <span>
            © {year} {siteConfig.name}. {tf("rights")}
          </span>
          <span className="label-tight">{tf("nip")}</span>
        </div>
      </div>
    </footer>
  );
}
