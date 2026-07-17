import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ModelForm } from "../ModelForm";
import { createModel } from "../actions";

export default async function NewModelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/fleet"
        className="label-tight text-[10px] text-ink-faint transition-colors hover:text-white"
      >
        ← Flota
      </Link>
      <h1 className="mt-4 mb-8 font-display text-2xl text-white">Nowy model</h1>
      <ModelForm action={createModel} />
    </div>
  );
}
