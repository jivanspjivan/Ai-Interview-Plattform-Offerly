import { TestimonialBrowser } from "@/components/testimonial-browser";

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

const CheckIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20">
    <path d="m4 10 4 4 8-9" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M12 3 5 6v5c0 4.6 2.8 8 7 10 4.2-2 7-5.4 7-10V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

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
            Great answers are
            <span>built, not memorized.</span>
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

        <div className="coach-card" aria-label="Example coaching feedback">
          <div className="card-topbar">
            <div className="window-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p>Live practice</p>
            <span className="live-indicator">
              <i aria-hidden="true" />
              Live
            </span>
          </div>
          <div className="question-panel">
            <span className="question-label">Question 03 of 08</span>
            <h2>Tell me about a time you handled a difficult stakeholder.</h2>
            <div className="answer-wave" aria-hidden="true">
              {[18, 29, 15, 38, 48, 24, 34, 58, 42, 22, 51, 65, 31, 45, 20].map(
                (height, index) => (
                  <span key={index} style={{ height }} />
                ),
              )}
            </div>
            <p className="recording-time">01:24</p>
          </div>
          <div className="feedback-panel">
            <div className="score">
              <strong>84</strong>
              <span>/ 100</span>
            </div>
            <div>
              <p className="feedback-title">Strong answer</p>
              <p className="feedback-copy">
                Your example was specific and your ownership was clear.
              </p>
            </div>
          </div>
          <div className="feedback-note">
            <span>
              <CheckIcon />
            </span>
            Add a measurable result to make the impact memorable.
          </div>
        </div>
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
        <div className="section-heading testimonials-heading">
          <p className="eyebrow">Illustrative candidate stories</p>
          <h2 id="stories-heading">See what focused practice can change.</h2>
          <p className="testimonial-disclaimer">
            Illustrative examples of the intended Offerly experience. Profiles
            and portraits are fictional.
          </p>
        </div>
        <TestimonialBrowser />
      </section>

      <section className="process shell" id="how-it-works">
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
      </section>

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
              <a href="/interview/new">Start an interview</a>
              <a href="#how-it-works">How it works</a>
              <a href="/plans">Plans</a>
            </div>
            <div>
              <strong>Account</strong>
              <a href="/login">Log in</a>
              <a href="/register">Create account</a>
            </div>
          </nav>
        </div>
        <div className="shell footer-bottom">
          <p>© 2026 Offerly. Private practice for better interviews.</p>
          <a href="/interview/new">
            Start practicing
            <ArrowIcon />
          </a>
        </div>
      </footer>
    </main>
  );
}
