import Image from "next/image";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth, signOut } from "@/lib/auth/config";

const NAV = [
  { href: "/admin", label: "Pulpit" },
  { href: "/admin/reservations", label: "Rezerwacje" },
  { href: "/admin/fleet", label: "Flota" },
  { href: "/admin/pricing", label: "Cennik" },
  { href: "/admin/audit", label: "Dziennik zdarzeń" },
] as const;

async function doSignOut() {
  "use server";
  await signOut({ redirectTo: "/admin/login" });
}

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Authoritative access check (defense in depth with the middleware guard).
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-void">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line md:flex">
        <div className="border-b border-line p-6">
          <Image
            src="/brand/aa-logo-dark.png"
            alt="A&A Corporation"
            width={200}
            height={110}
            className="h-8 w-auto"
          />
          <p className="label-tight mt-3 text-[10px] text-ink-faint">
            Panel administracyjny
          </p>
        </div>
        <nav className="flex-1 p-4">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="label-tight block px-2 py-3 text-[11px] text-silver transition-colors hover:text-white"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-line p-4">
          <p className="truncate text-xs text-white">{session.user.name}</p>
          <p className="truncate text-[10px] text-ink-faint">
            {session.user.email}
          </p>
          <form action={doSignOut}>
            <button className="label-tight mt-3 text-[10px] text-red transition-colors hover:text-white">
              Wyloguj
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="flex items-center justify-between border-b border-line p-4 md:hidden">
          <Image
            src="/brand/aa-logo-dark.png"
            alt="A&A Corporation"
            width={160}
            height={88}
            className="h-7 w-auto"
          />
          <form action={doSignOut}>
            <button className="label-tight text-[10px] text-red">Wyloguj</button>
          </form>
        </div>
        <div className="p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
}
