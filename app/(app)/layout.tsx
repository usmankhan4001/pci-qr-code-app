import { auth, signOut } from "@/lib/auth";
import { MantineShell } from "@/components/mantine-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <MantineShell email={session?.user?.email} signOutAction={signOutAction}>
      {children}
    </MantineShell>
  );
}
