import Image from "next/image";
import LoginForm from "./login-form";
import brandLogo from "../../../premierchoice brandign/Logo.webp";
import coverImage from "../../../premierchoice brandign/premier_choice_international_cover.jpeg";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-[var(--shadow-card)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden min-h-[35rem] overflow-hidden bg-[#0f3156] text-white lg:block">
          <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(90deg,rgba(255,255,255,.28)_0_1px,transparent_1px)] [background-size:58px_58px]" />
          <div className="relative flex h-full flex-col justify-between p-10">
            <div>
              <div className="mb-10 inline-flex bg-black px-4 py-3">
                <Image src={brandLogo} alt="Premier Choice International" className="h-9 w-auto" priority />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/58">Internal QR operations</p>
              <h1 className="mt-5 max-w-md font-serif text-5xl leading-[0.98] tracking-[-0.045em]">
                Dynamic QR control for premium real estate campaigns.
              </h1>
              <p className="mt-5 max-w-sm text-sm leading-6 text-white/72">
                Create, govern, export, and measure branded QR assets for Premier Choice International property marketing.
              </p>
            </div>
            <div className="overflow-hidden rounded-md border border-white/15 bg-white/[0.08]">
              <Image
                src={coverImage}
                alt="Premier Choice International property development skyline"
                className="h-32 w-full object-cover"
                priority
              />
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-10 lg:p-12">
          <div className="mb-8 inline-flex bg-black px-4 py-3 lg:hidden">
            <Image src={brandLogo} alt="Premier Choice International" className="h-8 w-auto" priority />
          </div>
          <div className="mb-7">
            <p className="ui-kicker">Staff sign in</p>
            <h1 className="mt-3 font-serif text-3xl leading-tight tracking-[-0.035em] text-[var(--foreground)]">
              Premier Choice International
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Access the QR Studio to create codes, edit destinations, and review scan activity.
            </p>
          </div>
          <LoginForm callbackUrl={callbackUrl} />
        </section>
      </div>
    </main>
  );
}
