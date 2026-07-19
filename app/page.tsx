"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card } from "@heroui/react";
import {
  Bell,
  LineChart,
  Users,
  Pill,
  ShieldCheck,
  Clock,
  ArrowRight,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

export default function HomePage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const { data } = await authClient.getSession();
        if (isMounted && data?.session) {
          router.replace("/dashboard");
          return;
        }
      } catch {
        // No session found — safe to show the landing page.
      } finally {
        if (isMounted) setCheckingSession(false);
      }
    }

    checkSession();
    return () => {
      isMounted = false;
    };
  }, [router]);

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* ---------- NAVBAR ---------- */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <Pill size={18} />
            </div>
            <span className="text-lg font-semibold text-neutral-900">
              MedTrack
            </span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-600 md:flex">
            <a href="#features" className="hover:text-neutral-900">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-neutral-900">
              How it works
            </a>
            <a href="#caregivers" className="hover:text-neutral-900">
              For families
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button className="font-medium rounded-lg text-neutral-700 hover:bg-neutral-100">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="rounded-lg bg-primary font-medium text-white hover:bg-primary/90">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ---------- HERO ---------- */}
      <section className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 pb-16 pt-16 text-center md:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <ShieldCheck size={16} />
          Built for daily peace of mind
        </span>

        <h1 className="max-w-2xl text-4xl font-bold leading-tight text-neutral-900 md:text-5xl">
          Never miss a dose.
          <br />
          <span className="text-primary">Stay close to the people</span> who
          depend on you.
        </h1>

        <p className="max-w-xl text-lg text-neutral-600">
          MedTrack helps you keep track of daily medicines and lets family
          members check in on care — without a single phone call.
        </p>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Link href="/signup">
            <Button
              size="lg"
              className="rounded-lg bg-primary px-8 font-semibold text-white hover:bg-primary/90"
            >
              Get started free
              <ArrowRight size={18} className="ml-2 inline" />
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              className="rounded-lg border border-neutral-300 px-8 font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              I already have an account
            </Button>
          </Link>
        </div>

        {/* Simple visual placeholder for hero imagery / product preview */}
        <div className="mt-10 w-full max-w-3xl rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2 border-b border-neutral-100 px-3 pb-3">
            <span className="h-3 w-3 rounded-full bg-red-300" />
            <span className="h-3 w-3 rounded-full bg-amber-300" />
            <span className="h-3 w-3 rounded-full bg-accent/60" />
          </div>
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
            {[
              { time: "8:00 AM", name: "Metformin", tone: "accent" },
              { time: "2:00 PM", name: "Lisinopril", tone: "warning" },
              { time: "9:00 PM", name: "Vitamin D", tone: "accent" },
            ].map((dose) => (
              <div
                key={dose.name}
                className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 text-left"
              >
                <p className="text-xs font-medium text-neutral-500">
                  {dose.time}
                </p>
                <p className="mt-1 font-semibold text-neutral-900">
                  {dose.name}
                </p>
                <span
                  className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${dose.tone === "accent"
                    ? "bg-accent/10 text-accent"
                    : "bg-warning/10 text-warning"
                    }`}
                >
                  {dose.tone === "accent" ? "Taken" : "Due soon"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-neutral-900">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="mt-3 text-neutral-600">
            Three simple tools that fit into a real daily routine.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <FeatureCard
            icon={<Bell size={22} />}
            title="Daily Reminders"
            description="Get a clear, timely nudge for every dose — grouped by morning, afternoon, evening, and night, so nothing slips through."
          />
          <FeatureCard
            icon={<LineChart size={22} />}
            title="Adherence Tracking"
            description="See your consistency over time with a simple 30-day view, streaks, and refill alerts before you run out."
          />
          <FeatureCard
            icon={<Users size={22} />}
            title="Caregiver Access"
            description="Invite a family member to view your schedule and progress — read-only, always with your permission."
          />
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section id="how-it-works" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-neutral-900">
              How MedTrack works
            </h2>
            <p className="mt-3 text-neutral-600">
              Set up once, then it just runs alongside your day.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <StepCard
              step="1"
              title="Add your medicines"
              description="Enter dosage, frequency, and timing in under a minute per medicine."
            />
            <StepCard
              step="2"
              title="Get reminded, log it"
              description="Mark each dose taken or skipped right when the reminder appears."
            />
            <StepCard
              step="3"
              title="Invite family, if you want"
              description="Share read-only access with someone who checks in on your care."
            />
          </div>
        </div>
      </section>

      {/* ---------- FOR CAREGIVERS ---------- */}
      <section id="caregivers" className="mx-auto max-w-6xl px-6 py-20">
        <Card>
          <Card.Content className="flex flex-col items-center gap-4 p-10 text-center md:p-14">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Clock size={22} />
            </div>
            <h3 className="max-w-lg text-2xl font-bold text-neutral-900">
              For families keeping an eye on a loved one&apos;s care
            </h3>
            <p className="max-w-xl text-neutral-600">
              Once invited, caregivers see today&apos;s schedule and
              adherence history for a linked patient — nothing more, and
              only with the patient&apos;s explicit approval.
            </p>
            <Link href="/signup">
              <Button
                className="mt-2 rounded-lg bg-primary px-8 font-semibold text-white hover:bg-primary/90"
              >
                Create a free account
              </Button>
            </Link>
          </Card.Content>
        </Card>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10 text-center text-sm text-neutral-500">
          <p>© {new Date().getFullYear()} MedTrack. Built to help daily care go a little smoother.</p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <Card.Content className="p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="mt-4 font-semibold text-neutral-900">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          {description}
        </p>
      </Card.Content>
    </Card>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
        {step}
      </div>
      <h4 className="mt-4 font-semibold text-neutral-900">{title}</h4>
      <p className="mt-2 text-sm text-neutral-600">{description}</p>
    </div>
  );
}