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

const features = [
  {
    number: "01",
    title: "Practice with purpose",
    description:
      "Choose your target role and difficulty. Every question is shaped around the interview you actually want to pass.",
  },
  {
    number: "02",
    title: "Answer out loud",
    description:
      "Build confidence in a realistic, focused session instead of silently memorizing perfect answers.",
  },
  {
    number: "03",
    title: "Improve with evidence",
    description:
      "Get clear feedback on structure, relevance, and delivery—then know exactly what to try next.",
  },
];

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
          <a className="button button-small button-dark" href="#get-started">
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
            feedback you can use before the real interview begins.
          </p>
          <div className="hero-actions" id="get-started">
            <a className="button button-primary" href="#how-it-works">
              Start a practice session
              <ArrowIcon />
            </a>
            <p>No credit card · Start in 60 seconds</p>
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
            <span className="live-indicator">Live</span>
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

      <section className="process shell" id="how-it-works">
        <div className="section-heading">
          <p className="eyebrow">A better practice loop</p>
          <h2>From nervous to ready, one answer at a time.</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article key={feature.number} className="feature">
              <span className="feature-number">{feature.number}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
