import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { LandingCalculator } from "@/components/LandingCalculator";
import { MODULES } from "@/lib/modules";

// Every page except the Dashboard itself — five pages total (decision 0040), so the grid shows the four that do the work.
const featured = MODULES.filter((m) => m.slug !== "overview");

export default function LandingPage() {
  return (
    <div className="min-h-full bg-bg text-text">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandMark size={30} />
            <span className="font-display text-lg">Amore Cost</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-text-muted">
            <a href="#features" className="hover:text-text transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-text transition-colors">
              How it works
            </a>
            <a href="#pricing" className="hover:text-text transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-text transition-colors">
              FAQ
            </a>
          </nav>
          <Link
            href="/dashboard"
            className="rounded-xl bg-accent text-accent-ink px-4 py-2 text-sm font-medium hover:bg-accent-strong transition-colors"
          >
            Open Dashboard →
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-16 sm:pt-24 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block text-xs font-medium text-accent-strong bg-accent-soft rounded-full px-3 py-1">
            Free recipe costing, no signup needed
          </span>
          <h1 className="font-display text-4xl sm:text-5xl mt-4 leading-tight">
            Cost your dish once.
            <br />
            Price your menu right.
            <br />
            Every time.
          </h1>
          <p className="mt-5 text-lg text-text-muted max-w-md">
            A free recipe costing and pricing calculator built for Philippine
            food businesses — home bakers, carinderias, food carts, and
            small eateries — the upgrade from a static spreadsheet, without
            a subscription to get started.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl bg-accent text-accent-ink px-6 py-3 text-sm font-medium hover:bg-accent-strong transition-colors"
            >
              Open Dashboard →
            </Link>
            <a
              href="#how-it-works"
              className="rounded-xl border border-border px-6 py-3 text-sm font-medium hover:border-accent transition-colors"
            >
              See how it works
            </a>
          </div>
        </div>

        <LandingCalculator />
      </section>

      <section id="features" className="max-w-6xl mx-auto px-6 py-20 border-t border-border">
        <h2 className="font-display text-3xl text-center">Everything you need to price your menu with confidence</h2>
        <p className="text-text-muted text-center mt-3 max-w-xl mx-auto">
          Five focused pages, built for how Filipino food businesses actually
          work — cost the recipe, cover your overhead, and see the real
          receipt and profit before you ever change a menu price.
        </p>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.slug} className="card p-5">
                <Icon className="w-5 h-5 text-accent" strokeWidth={2} aria-hidden="true" />
                <p className="font-medium mt-3">{m.name}</p>
                <p className="text-sm text-text-muted mt-1.5">{m.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20 border-t border-border">
        <h2 className="font-display text-3xl text-center">Three steps, not three spreadsheets</h2>
        <div className="mt-12 grid sm:grid-cols-3 gap-8">
          <div>
            <span className="font-display text-3xl text-accent">1</span>
            <p className="font-medium mt-2">Cost it</p>
            <p className="text-sm text-text-muted mt-1.5">
              Add every ingredient, labor, packaging, and overhead line — or
              link a shared Ingredient Library entry so one price change
              updates every recipe that uses it.
            </p>
          </div>
          <div>
            <span className="font-display text-3xl text-accent">2</span>
            <p className="font-medium mt-2">Price it</p>
            <p className="text-sm text-text-muted mt-1.5">
              Pick a markup %, margin %, or fixed-profit target, and a tax
              preset — VAT, Percentage Tax, or your own custom rate.
            </p>
          </div>
          <div>
            <span className="font-display text-3xl text-accent">3</span>
            <p className="font-medium mt-2">Track it</p>
            <p className="text-sm text-text-muted mt-1.5">
              Add your monthly OPEX, then run the Receipt and Margin &amp; POS
              Simulators to see VAT, Senior/PWD discounts, and break-even on
              that same true-cost number.
            </p>
          </div>
        </div>
      </section>

      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20 border-t border-border">
        <h2 className="font-display text-3xl text-center">Pricing</h2>
        <p className="text-text-muted text-center mt-3 max-w-xl mx-auto">
          <strong className="text-text">Nothing below is live yet</strong> —
          this is the direction being considered, not a bill you'll get.
          Everything in the app is free to use today, no account required.
        </p>
        <div className="mt-12 grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="card p-6">
            <p className="text-sm font-medium text-accent-strong">Free</p>
            <p className="font-display text-3xl mt-2">₱0</p>
            <p className="text-sm text-text-muted mt-1">Available right now</p>
            <ul className="mt-5 space-y-2.5 text-sm text-text-muted">
              <li>✓ All 5 pages, no limits</li>
              <li>✓ Ingredient Library with cost cascade</li>
              <li>✓ Receipt &amp; Margin simulators, full backup</li>
              <li>✓ No account, data stays in your browser</li>
            </ul>
            <Link
              href="/dashboard"
              className="mt-6 block text-center rounded-xl bg-accent text-accent-ink px-4 py-2.5 text-sm font-medium hover:bg-accent-strong transition-colors"
            >
              Open Dashboard →
            </Link>
          </div>
          <div className="card p-6 opacity-80">
            <p className="text-sm font-medium text-text-muted">Pro — proposed, not final</p>
            <p className="font-display text-3xl mt-2">₱199–499</p>
            <p className="text-sm text-text-muted mt-1">per month, if this ever ships</p>
            <ul className="mt-5 space-y-2.5 text-sm text-text-muted">
              <li>· Real accounts, cross-device sync</li>
              <li>· Staff accounts with real access control</li>
              <li>· A pooled ingredient stock across every recipe</li>
              <li>· Marketplace order sync (Shopee/Lazada)</li>
            </ul>
            <button
              type="button"
              disabled
              className="mt-6 w-full rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-muted cursor-not-allowed"
            >
              Coming soon
            </button>
          </div>
        </div>
      </section>

      <section id="faq" className="max-w-6xl mx-auto px-6 py-20 border-t border-border">
        <h2 className="font-display text-3xl text-center">Frequently asked questions</h2>
        <div className="mt-12 max-w-2xl mx-auto space-y-6">
          <div>
            <p className="font-medium">Do I need to create an account?</p>
            <p className="text-sm text-text-muted mt-1.5">
              No. Everything runs the moment you open the dashboard — no
              signup, no email, no password.
            </p>
          </div>
          <div className="pt-6 border-t border-border">
            <p className="font-medium">Where is my data stored — is it safe?</p>
            <p className="text-sm text-text-muted mt-1.5">
              Entirely in your own browser (nothing is sent to a server).
              The tradeoff: clearing your browser data or switching devices
              loses it unless you back up first — the Dashboard has a
              one-click full backup/restore for exactly this reason.
            </p>
          </div>
          <div className="pt-6 border-t border-border">
            <p className="font-medium">Does it handle VAT and other Philippine taxes correctly?</p>
            <p className="text-sm text-text-muted mt-1.5">
              You can pick VAT (12%), Percentage Tax (3%), a custom rate, or
              no tax at all. Like the rest of the app: pricing is an
              estimate to help you decide, not tax advice — confirm
              anything filing-related with an accountant.
            </p>
          </div>
          <div className="pt-6 border-t border-border">
            <p className="font-medium">Is this only for food businesses?</p>
            <p className="text-sm text-text-muted mt-1.5">
              Yes, by design — Amore Cost is built specifically for
              Philippine food businesses: recipe-level ingredient costing,
              food-cost % against the 28–32% industry target, and a receipt
              simulator that handles VAT and Senior/PWD rules. If you run a different kind of
              business, this isn't the right tool for you yet.
            </p>
          </div>
          <div className="pt-6 border-t border-border">
            <p className="font-medium">Can my staff use it too?</p>
            <p className="text-sm text-text-muted mt-1.5">
              Not yet — everything runs in one browser with no accounts, so
              anyone using that browser sees the same data. Separate staff
              logins with real access control need accounts, which don't
              exist yet.
            </p>
          </div>
          <div className="pt-6 border-t border-border">
            <p className="font-medium">Does it work on my phone?</p>
            <p className="text-sm text-text-muted mt-1.5">
              It'll load in a mobile browser, but the layout is still
              desktop-first — the sidebar navigation doesn't collapse yet,
              so it's usable but cramped on a small screen. Full mobile
              support isn't done yet.
            </p>
          </div>
          <div className="pt-6 border-t border-border">
            <p className="font-medium">Will there be a paid version?</p>
            <p className="text-sm text-text-muted mt-1.5">
              Maybe, eventually — see{" "}
              <a href="#pricing" className="text-accent hover:text-accent-strong font-medium">
                Pricing
              </a>{" "}
              above. Nothing is decided, and everything that's free today
              stays free regardless of what happens later.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-border text-center">
        <h2 className="font-display text-3xl">Stop guessing your price.</h2>
        <p className="text-text-muted mt-3 max-w-md mx-auto">
          No account, no credit card — your data stays in your browser.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-xl bg-accent text-accent-ink px-6 py-3 text-sm font-medium hover:bg-accent-strong transition-colors"
        >
          Open Dashboard →
        </Link>
      </section>

      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-muted">
          <div className="flex items-center gap-2">
            <BrandMark size={20} />
            <span>Amore Cost</span>
          </div>
          <p>Concept build — pricing is an estimate, not tax advice.</p>
        </div>
      </footer>
    </div>
  );
}
