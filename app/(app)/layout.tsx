import Image from "next/image";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Icon } from "@/components/ui-icons";
import { AppNavLinks } from "./app-nav-links";
import brandLogo from "../../premierchoice brandign/Logo.webp";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="app-shell">
      <aside className="app-sidebar hidden lg:flex">
        <div className="flex min-h-0 flex-1 flex-col gap-8">
          <Link href="/dashboard" className="app-brand-card">
            <span className="app-logo-lockup">
              <Image src={brandLogo} alt="Premier Choice International" className="h-7 w-auto" priority />
            </span>
            <span className="min-w-0">
              <span className="block font-serif text-[1.2rem] leading-none tracking-[-0.035em] text-white">QR Studio</span>
              <span className="mt-1 block text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white/48">Campaign control</span>
            </span>
          </Link>

          <div>
            <p className="app-sidebar-label">Workspace</p>
            <AppNavLinks />
          </div>

          <div className="app-sidebar-panel mt-auto">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white ring-1 ring-white/10">
                {(session?.user?.email?.[0] ?? "P").toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">PCI user</p>
                <p className="truncate text-xs text-white/48">{session?.user?.email}</p>
              </div>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button type="submit" className="ui-button mt-4 w-full border-white/10 bg-white/[0.07] text-white hover:bg-white/[0.12]">
                <Icon name="logOut" className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:pl-[18rem]">
        <header className="mobile-app-bar lg:hidden">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="flex h-10 items-center bg-black px-2.5">
                <Image src={brandLogo} alt="Premier Choice International" className="h-6 w-auto" priority />
              </span>
              <span>
                <span className="block font-serif text-[1.05rem] leading-none tracking-[-0.035em] text-white">QR Studio</span>
                <span className="mt-1 block text-[0.64rem] font-bold uppercase tracking-[0.18em] text-white/50">Campaign control</span>
              </span>
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button type="submit" className="ui-icon-button border-white/10 bg-white/[0.07] text-white" aria-label="Sign out">
                <Icon name="logOut" className="h-4 w-4" />
              </button>
            </form>
          </div>
          <div className="border-t border-white/10 px-3 py-2">
            <AppNavLinks compact />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
