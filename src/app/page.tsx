import Link from "next/link";
import { TestimonialBrowser } from "@/components/testimonial-browser";
import { AnimatedCoachCard } from "@/components/animated-coach-card";
import { ScrollRevealSection } from "@/components/scroll-reveal-section";

const ArrowIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20">
    <path d="M4 10h12M11 5l5 5-5 5" />
  </svg>
);

const SparkIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M12 2l1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z" />
    <path d="m19 17 .7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17Z" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M12 3 5 6v5c0 4.6 2.8 8 7 10 4.2-2 7-5.4 7-10V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const FooterIcon = ({
  kind,
}: {
  kind:
    | "practice"
    | "steps"
    | "plans"
    | "login"
    | "register"
    | "linkedin"
    | "instagram"
    | "x"
    | "youtube";
}) => {
  if (kind === "practice") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <path d="M10 13a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v4a3 3 0 0 0 3 3Z" />
        <path d="M5 10a5 5 0 0 0 10 0M10 15v3M7 18h6" />
      </svg>
    );
  }

  if (kind === "steps") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <circle cx="5" cy="5" r="2" />
        <circle cx="15" cy="10" r="2" />
        <circle cx="5" cy="15" r="2" />
        <path d="M7 5h3l3 3M13 12l-3 3H7" />
      </svg>
    );
  }

  if (kind === "plans") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <rect x="3" y="4" width="14" height="12" rx="2" />
        <path d="M3 8h14M7 12h3" />
      </svg>
    );
  }

  if (kind === "login") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <path d="M8 4H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3M11 6l4 4-4 4M6 10h9" />
      </svg>
    );
  }

  if (kind === "register") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <circle cx="8" cy="7" r="3" />
        <path d="M3 17c.5-3 2.2-5 5-5s4.5 2 5 5M15 6v5M12.5 8.5h5" />
      </svg>
    );
  }

  if (kind === "instagram") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <rect x="3" y="3" width="14" height="14" rx="4" />
        <circle cx="10" cy="10" r="3" />
        <path d="M14.5 5.5h.01" />
      </svg>
    );
  }

  if (kind === "youtube") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <path d="M17 7.2v5.6c0 1.2-.8 2-2 2.2-3.3.4-6.7.4-10 0-1.2-.2-2-1-2-2.2V7.2C3 6 3.8 5.2 5 5c3.3-.4 6.7-.4 10 0 1.2.2 2 1 2 2.2Z" />
        <path d="m8.5 8 4 2-4 2V8Z" />
      </svg>
    );
  }

  if (kind === "linkedin") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <path d="M5 8v7M5 5.5v.01M9 15V8m0 3c.7-2 5-2.3 5 1v3" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="m4 4 12 12M16 4 4 16" />
    </svg>
  );
};

const features = [
  {
    number: "01",
    kind: "focus",
    title: "Practice with purpose",
    description:
      "Choose your target role and difficulty. Every question is shaped around the interview you actually want to pass.",
  },
  {
    number: "02",
    kind: "record",
    title: "Answer out loud",
    description:
      "Build confidence in a realistic, focused session instead of silently memorizing perfect answers.",
  },
  {
    number: "03",
    kind: "feedback",
    title: "Improve with evidence",
    description:
      "Get clear feedback on structure, relevance, and delivery—then know exactly what to try next.",
  },
];

const StepIcon = ({ kind }: { kind: string }) => {
  if (kind === "focus") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
      </svg>
    );
  }

  if (kind === "record") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 15.5a4 4 0 0 0 4-4v-5a4 4 0 0 0-8 0v5a4 4 0 0 0 4 4Zm-6-4a6 6 0 0 0 12 0M12 17.5V21m-3 0h6" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 20V10m7 10V4m7 16v-7" />
      <path d="m4 6 4 3 5-5 6 3" />
    </svg>
  );
};

const StepPreview = ({ kind }: { kind: string }) => {
  if (kind === "focus") {
    return (
      <div className="step-preview role-preview" aria-hidden="true">
        <span>Target role</span>
        <strong>Frontend Developer</strong>
        <em>Entry level</em>
        <i>⌄</i>
      </div>
    );
  }

  if (kind === "record") {
    return (
      <div className="step-preview recording-preview" aria-hidden="true">
        <span className="preview-mic">●</span>
        <div>
          {[12, 22, 16, 31, 19, 27, 14, 24, 11].map((height, index) => (
            <i key={`${height}-${index}`} style={{ height }} />
          ))}
        </div>
        <strong>01:24</strong>
      </div>
    );
  }

  return (
    <div className="step-preview score-preview" aria-hidden="true">
      <span>
        <strong>84</strong>
        <small>/100</small>
      </span>
      <div>
        <strong>Strong answer</strong>
        <i>
          <b style={{ width: "84%" }} />
        </i>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <main>
      <nav className="nav shell" aria-label="Main navigation">
        <a className="brand" href="#" aria-label="Offerly home">
          <span className="brand-mark">
            <SparkIcon />
          </span>
          offerly
        </a>
        <div className="nav-actions">
          <Link className="text-link nav-home-link" href="/">
            Home
          </Link>
          <a className="text-link" href="#how-it-works">
            How it works
          </a>
          <a className="text-link" href="/plans">
            Plans
          </a>
          <a className="text-link" href="/login">
            Log in
          </a>
          <a className="button button-small button-dark" href="/interview/new">
            Start practicing
            <ArrowIcon />
          </a>
        </div>
      </nav>

      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">
            <span>
              <SparkIcon />
            </span>
            Your private interview room
          </p>
          <h1>
            <span className="hero-line">Great answers are</span>
            <span className="hero-line">built, not memorized.</span>
          </h1>
          <p className="hero-description">
            Practice the questions that matter, speak with confidence, and get
            feedback you can use before the real interview begins
          </p>
          <div className="hero-actions" id="get-started">
            <a className="button button-primary" href="/interview/new">
              Start a practice session
              <ArrowIcon />
            </a>
            <p>
              <ShieldCheckIcon />
              No credit card · Start in 60 seconds
            </p>
          </div>
        </div>

        <AnimatedCoachCard />
      </section>

      <section className="proof">
        <div className="shell proof-inner">
          <p>Built for the moments that move your career forward</p>
          <div className="roles" aria-label="Supported interview areas">
            <span>Product</span>
            <span>Engineering</span>
            <span>Design</span>
            <span>Data</span>
            <span>Leadership</span>
          </div>
        </div>
      </section>

      <section className="testimonials shell" aria-labelledby="stories-heading">
        <TestimonialBrowser />
      </section>

      <ScrollRevealSection
        className="process shell"
        id="how-it-works"
        visibleClassName="process-visible"
      >
        <div className="section-heading">
          <p className="eyebrow">A better practice loop</p>
          <h2>From nervous to ready, one answer at a time.</h2>
          <p className="process-description">
            Choose your role, answer realistic questions, and improve using
            specific feedback.
          </p>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article key={feature.number} className="feature">
              <div className="feature-topline">
                <span className="feature-icon">
                  <StepIcon kind={feature.kind} />
                </span>
                <span className="feature-number">{feature.number}</span>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <StepPreview kind={feature.kind} />
            </article>
          ))}
        </div>
        <div className="process-action">
          <a className="button button-dark" href="/interview/new">
            Start your first practice session
            <ArrowIcon />
          </a>
        </div>
      </ScrollRevealSection>

      <footer className="site-footer">
        <div className="shell footer-inner">
          <div className="footer-brand">
            <a className="brand" href="#" aria-label="Offerly home">
              <span className="brand-mark">
                <SparkIcon />
              </span>
              offerly
            </a>
            <p>
              Practice realistic interviews, strengthen every answer, and walk
              into the real conversation prepared.
            </p>
          </div>

          <nav className="footer-links" aria-label="Footer navigation">
            <div>
              <strong>Practice</strong>
              <a href="/interview/new">
                <FooterIcon kind="practice" />
                Start an interview
              </a>
              <a href="#how-it-works">
                <FooterIcon kind="steps" />
                How it works
              </a>
              <a href="/plans">
                <FooterIcon kind="plans" />
                Plans
              </a>
            </div>
            <div>
              <strong>Account</strong>
              <a href="/login">
                <FooterIcon kind="login" />
                Log in
              </a>
              <a href="/register">
                <FooterIcon kind="register" />
                Create account
              </a>
              <a href="/support">Support</a>
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
              <a href="/refund-policy">Refunds</a>
            </div>
            <div>
              <strong>Follow</strong>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noreferrer"
              >
                <FooterIcon kind="linkedin" />
                LinkedIn
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noreferrer"
              >
                <FooterIcon kind="instagram" />
                Instagram
              </a>
              <a href="https://x.com" target="_blank" rel="noreferrer">
                <FooterIcon kind="x" />X / Twitter
              </a>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noreferrer"
              >
                <FooterIcon kind="youtube" />
                YouTube
              </a>
            </div>
          </nav>
        </div>
        <div className="shell footer-bottom">
          <p>© 2026 Offerly. All rights reserved.</p>
          <a href="/interview/new">
            Start practicing
            <ArrowIcon />
          </a>
        </div>
      </footer>
    </main>
  );
}
