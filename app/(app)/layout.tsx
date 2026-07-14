import Image from "next/image";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import brandLogo from "../../premierchoice brandign/Logo.webp";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen">
      <header className="app-header">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-4 text-white">
            <span className="flex h-11 items-center bg-black px-3">
              <Image src={brandLogo} alt="Premier Choice International" className="h-7 w-auto" priority />
            </span>
            <span>
              <span className="block font-serif text-[1.05rem] tracking-[-0.02em]">QR Studio</span>
              <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/55">
                Dynamic code management
              </span>
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            <Link href="/dashboard" className="app-nav-link">
              Library
            </Link>
            <Link href="/qr/new" className="app-nav-link">
              New QR
            </Link>
            <Link href="/templates" className="app-nav-link">
              Templates
            </Link>
            <span className="hidden max-w-44 truncate px-2 text-xs text-white/45 md:inline">
              {session?.user?.email}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button type="submit" className="ui-button min-h-0 border-white/20 bg-white/10 px-3 py-2 text-white hover:bg-white/15">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-8 lg:py-10">{children}</main>
    </div>
  );
}
