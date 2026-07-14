"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui-icons";

const links: Array<{
  href: string;
  label: string;
  description: string;
  icon: IconName;
  matches: (pathname: string) => boolean;
}> = [
  {
    href: "/dashboard",
    label: "Library",
    description: "Manage live codes",
    icon: "grid",
    matches: (pathname) => pathname === "/dashboard" || (pathname.startsWith("/qr/") && !pathname.startsWith("/qr/new")),
  },
  {
    href: "/qr/new",
    label: "New QR",
    description: "Create a code",
    icon: "plus",
    matches: (pathname) => pathname.startsWith("/qr/new"),
  },
  {
    href: "/templates",
    label: "Templates",
    description: "Brand presets",
    icon: "palette",
    matches: (pathname) => pathname.startsWith("/templates"),
  },
];

export function AppNavLinks({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className={compact ? "flex items-center gap-1 overflow-x-auto" : "space-y-1.5"} aria-label="Primary navigation">
      {links.map((link) => {
        const active = link.matches(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? "app-nav-link app-nav-link-active" : "app-nav-link"}
            aria-current={active ? "page" : undefined}
          >
            <span className="app-nav-icon">
              <Icon name={link.icon} className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate">{link.label}</span>
              {!compact ? <span className="app-nav-description">{link.description}</span> : null}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
