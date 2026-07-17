import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth/config";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();

  // Real counts are wired when the reservations/fleet sections land.
  const stats = [
    { label: "Rezerwacje", value: "—" },
    { label: "Do potwierdzenia", value: "—" },
    { label: "Aktywne najmy", value: "—" },
    { label: "Auta w serwisie", value: "—" },
  ];

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold">Pulpit</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Witaj, {session?.user?.name}.
      </p>

      <div className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-void p-6">
            <p className="label-tight text-[10px] text-ink-faint">{s.label}</p>
            <p className="mt-3 font-heading text-3xl font-bold text-white">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-sm text-ink-muted">
        Kolejne sekcje panelu — rezerwacje, cennik i flota — są w budowie.
      </p>
    </div>
  );
}
