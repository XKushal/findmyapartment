import Link from "next/link";

import { buttonVariants } from "@/features/ui/button";
import { Card, Eyebrow } from "@/features/ui/card";
import { Container } from "@/features/ui/container";
import {
  ArrowRightIcon,
  BedIcon,
  HeartIcon,
  HomeMarkIcon,
  PinIcon,
} from "@/features/ui/icons";

const FEATURES = [
  {
    icon: BedIcon,
    title: "Every kind of place",
    body: "Full apartments, private rooms, and roommate leads — all on one warm, easy board.",
  },
  {
    icon: PinIcon,
    title: "Filter to your fit",
    body: "Narrow by price, beds, baths, move-in date, and pet policy until it feels like home.",
  },
  {
    icon: HeartIcon,
    title: "Save & compare",
    body: "Keep a shortlist of the places you love and revisit them whenever you're ready.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Browse the board",
    body: "Search active listings near campus and open the ones that catch your eye.",
  },
  {
    step: "02",
    title: "Reach out safely",
    body: "Send a structured contact request — no public phone numbers required.",
  },
  {
    step: "03",
    title: "Post your own place",
    body: "List an apartment, room, or roommate lead in minutes and manage it from your profile.",
  },
];

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="surface-grain border-b border-stone-200/60">
        <Container>
          <div className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
                <HomeMarkIcon width={14} height={14} />
                Local-first housing
              </span>
              <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-stone-950 sm:text-6xl">
                Find a place that
                <span className="text-brand-700"> feels like home.</span>
              </h1>
              <p className="max-w-xl text-lg leading-8 text-stone-600">
                Browse trusted apartments, rooms, and roommate leads near
                campus. Compare rent, save your favorites, and reach posters
                without the noise.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/listings" className={buttonVariants({ size: "lg" })}>
                  Browse listings
                  <ArrowRightIcon width={18} height={18} />
                </Link>
                <Link
                  href="/listings/new"
                  className={buttonVariants({ variant: "secondary", size: "lg" })}
                >
                  Post a place
                </Link>
              </div>
              <dl className="flex flex-wrap gap-x-10 gap-y-4 pt-4">
                {[
                  ["3 in 1", "Apartments · rooms · roommates"],
                  ["Free", "To browse and to post"],
                  ["Local", "Built around campus life"],
                ].map(([stat, label]) => (
                  <div key={label}>
                    <dt className="font-display text-2xl font-semibold text-stone-950">
                      {stat}
                    </dt>
                    <dd className="text-sm text-stone-500">{label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Hero visual — a warm stacked "listing" motif, pure CSS */}
            <div className="relative hidden lg:block" aria-hidden="true">
              <div className="absolute -right-4 top-6 h-64 w-64 rounded-full bg-brand-200/50 blur-3xl" />
              <Card className="relative overflow-hidden p-0">
                <div className="flex h-44 items-end bg-gradient-to-br from-brand-300 via-brand-400 to-brand-700 p-5">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-900">
                    Apartment
                  </span>
                </div>
                <div className="space-y-3 p-6">
                  <div className="flex items-baseline justify-between">
                    <p className="font-display text-lg font-semibold text-stone-950">
                      Sunny 2BR near campus
                    </p>
                    <p className="font-semibold text-brand-800">$1,150</p>
                  </div>
                  <p className="text-sm text-stone-500">
                    2 bed · 1 bath · 0.4 mi to campus
                  </p>
                  <div className="flex gap-2 pt-1">
                    {["Laundry", "Parking", "Furnished"].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="max-w-2xl">
            <Eyebrow>Why AllApartments</Eyebrow>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
              Housing search, minus the headache.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="p-6" interactive>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-800">
                  <feature.icon width={22} height={22} />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-stone-950">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {feature.body}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="pb-16 sm:pb-24">
        <Container>
          <Card className="surface-grain overflow-hidden p-8 sm:p-12">
            <div className="max-w-2xl">
              <Eyebrow>How it works</Eyebrow>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-stone-950">
                Three steps to your next place.
              </h2>
            </div>
            <ol className="mt-10 grid gap-8 sm:grid-cols-3">
              {STEPS.map((item) => (
                <li key={item.step}>
                  <span className="font-display text-3xl font-semibold text-brand-300">
                    {item.step}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-stone-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/listings" className={buttonVariants()}>
                Start browsing
                <ArrowRightIcon width={18} height={18} />
              </Link>
              <Link
                href="/register"
                className={buttonVariants({ variant: "secondary" })}
              >
                Create an account
              </Link>
            </div>
          </Card>
        </Container>
      </section>
    </main>
  );
}
