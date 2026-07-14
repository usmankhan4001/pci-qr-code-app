import Image from "next/image";
import LoginForm from "./login-form";
import { Icon, type IconName } from "@/components/ui-icons";
import brandLogo from "../../../premierchoice brandign/Logo.webp";
import coverImage from "../../../premierchoice brandign/premier_choice_international_cover.jpeg";

const loginHighlights: Array<{ icon: IconName; text: string }> = [
  { icon: "qr", text: "Dynamic short links stay editable after print" },
  { icon: "palette", text: "PCI-approved templates keep exports on brand" },
  { icon: "barChart", text: "Scan analytics show campaign response" },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[1.25rem] border border-[var(--border)] bg-white shadow-[var(--shadow-float)] lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden min-h-[35rem] overflow-hidden bg-[#0f3156] text-white lg:block">
          <div className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(90deg,rgba(255,255,255,.28)_0_1px,transparent_1px)] [background-size:58px_58px]" />
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[var(--brand-gold)]/20 blur-3xl" />
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
              <div className="mt-8 grid max-w-md gap-3 text-sm text-white/78">
                {loginHighlights.map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.07] px-3 py-2">
                    <Icon name={icon} className="h-4 w-4 text-[var(--brand-gold)]" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.08] p-2">
              <Image
                src={coverImage}
                alt="Premier Choice International property development skyline"
                className="h-36 w-full rounded-xl object-cover"
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
