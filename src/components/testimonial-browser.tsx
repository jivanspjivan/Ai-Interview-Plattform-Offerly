"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { testimonials, type Testimonial } from "@/data/testimonials";

const categories = ["All", "Engineering", "Product & Design", "Data & Leadership"] as const;

const companyGroups = {
  Product: [
    "Google",
    "Microsoft",
    "Adobe",
    "Salesforce",
    "Atlassian",
    "Intuit",
    "Zoho",
    "Freshworks",
    "Postman",
    "BrowserStack",
  ],
  Enterprise: [
    "IBM",
    "Oracle",
    "Deloitte",
    "Capgemini",
    "Cognizant",
    "Druva",
    "InMobi",
  ],
  "IT Services": [
    "TCS",
    "Infosys",
    "Accenture",
    "Wipro",
    "HCLTech",
  ],
  Startup: [
    "Zepto",
    "Ather",
    "Urban Company",
    "Meesho",
    "Swiggy",
    "Mindtickle",
    "Whatfix",
    "Hasura",
  ],
  Fintech: ["Razorpay", "PhonePe", "CRED", "Groww", "Chargebee"],
} as const;

const companyDomains: Record<string, string> = {
  Google: "google.com",
  Microsoft: "microsoft.com",
  Adobe: "adobe.com",
  Salesforce: "salesforce.com",
  Atlassian: "atlassian.com",
  Intuit: "intuit.com",
  Zoho: "zoho.com",
  Freshworks: "freshworks.com",
  Razorpay: "razorpay.com",
  PhonePe: "phonepe.com",
  Postman: "postman.com",
  BrowserStack: "browserstack.com",
  Chargebee: "chargebee.com",
  Mindtickle: "mindtickle.com",
  Druva: "druva.com",
  Whatfix: "whatfix.com",
  Hasura: "hasura.io",
  InMobi: "inmobi.com",
  Meesho: "meesho.com",
  Swiggy: "swiggy.com",
  TCS: "tcs.com",
  Infosys: "infosys.com",
  Accenture: "accenture.com",
  IBM: "ibm.com",
  Oracle: "oracle.com",
  Deloitte: "deloitte.com",
  Capgemini: "capgemini.com",
  Cognizant: "cognizant.com",
  Wipro: "wipro.com",
  HCLTech: "hcltech.com",
  CRED: "cred.club",
  Zepto: "zeptonow.com",
  Groww: "groww.in",
  Ather: "atherenergy.com",
  "Urban Company": "urbancompany.com",
};

const localCompanyLogos: Record<string, string> = {
  TCS: "/company-logos/tcs.svg",
  HCLTech: "/company-logos/hcltech.svg",
};

const companies = Object.entries(companyGroups).flatMap(([group, names]) =>
  names.map((name) => ({ name, group })),
);

const companyRows = [
  companies.filter((_, index) => index % 2 === 0),
  companies.filter((_, index) => index % 2 === 1),
];

type Category = (typeof categories)[number];

function getCategory(testimonial: Testimonial): Category {
  if (
    /Product|Design|UX|Marketing/i.test(testimonial.role)
  ) {
    return "Product & Design";
  }

  if (/Data|Manager|Leadership/i.test(testimonial.role)) {
    return "Data & Leadership";
  }

  return "Engineering";
}

function getTag(role: string) {
  if (/Data|Backend|DevOps|QA|Engineer|Developer/i.test(role)) {
    return "Technical clarity";
  }

  if (/Product|Design|Marketing/i.test(role)) {
    return "Answer structure";
  }

  return "Confidence";
}

export function TestimonialBrowser() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const filterButtonsRef = useRef(new Map<Category, HTMLButtonElement>());
  const [category, setCategory] = useState<Category>("All");
  const [page, setPage] = useState(0);
  const [expandedReviews, setExpandedReviews] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const filtered = useMemo(
    () =>
      category === "All"
        ? testimonials
        : testimonials.filter((testimonial) => getCategory(testimonial) === category),
    [category],
  );
  const pageCount = Math.ceil(filtered.length / 3);
  const visibleTestimonials = filtered.slice(page * 3, page * 3 + 3);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0,
        rootMargin: "0px 0px -25% 0px",
      },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateIndicator = () => {
      const filters = filtersRef.current;
      const activeButton = filterButtonsRef.current.get(category);
      if (!filters || !activeButton) return;

      filters.style.setProperty("--pill-left", `${activeButton.offsetLeft}px`);
      filters.style.setProperty("--pill-width", `${activeButton.offsetWidth}px`);
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [category]);

  function selectCategory(nextCategory: Category) {
    setCategory(nextCategory);
    setPage(0);
  }

  return (
    <div ref={sectionRef} className={isVisible ? "reviews-visible" : ""}>
      <div className="section-heading testimonials-heading">
        <p className="eyebrow">Illustrative candidate stories</p>
        <h2 id="stories-heading">
          <span>See what focused practice</span>
          <span>can change.</span>
        </h2>
        <p className="testimonial-disclaimer">
          Illustrative examples of the intended Offerly experience. Profiles
          and portraits are fictional.
        </p>
      </div>

      <div className="testimonial-toolbar">
        <div
          ref={filtersRef}
          className="testimonial-filters"
          aria-label="Filter review examples"
        >
          <span className="filter-indicator" aria-hidden="true" />
          {categories.map((item) => (
            <button
              className={category === item ? "active" : ""}
              key={item}
              ref={(button) => {
                if (button) filterButtonsRef.current.set(item, button);
                else filterButtonsRef.current.delete(item);
              }}
              type="button"
              onClick={() => selectCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="testimonial-pagination" aria-label="Review pages">
          <button
            type="button"
            aria-label="Previous reviews"
            disabled={page === 0}
            onClick={() => setPage((current) => current - 1)}
          >
            ←
          </button>
          <span>
            {page + 1} / {pageCount}
          </span>
          <button
            type="button"
            aria-label="Next reviews"
            disabled={page === pageCount - 1}
            onClick={() => setPage((current) => current + 1)}
          >
            →
          </button>
        </div>
      </div>

      <div className="testimonial-grid">
        {visibleTestimonials.map((testimonial, index) => {
          const isExpanded = expandedReviews.includes(testimonial.name);
          const isLongReview = testimonial.quote.length > 80;

          return (
            <article
              className="testimonial-card"
              key={`${testimonial.name}-${testimonial.date}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="testimonial-topline">
                <svg className="quote-icon" aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M9.5 7H5v5h4v5H4.5A2.5 2.5 0 0 1 2 14.5V12a7 7 0 0 1 7-7m12.5 2H17v5h4v5h-4.5a2.5 2.5 0 0 1-2.5-2.5V12a7 7 0 0 1 7-7" />
                </svg>
                <span className="review-tag">{getTag(testimonial.role)}</span>
              </div>
              <blockquote className={isExpanded ? "expanded" : ""}>
                “{testimonial.quote}”
              </blockquote>
              {isLongReview && (
                <button
                  className="review-toggle"
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() =>
                    setExpandedReviews((current) =>
                      isExpanded
                        ? current.filter((name) => name !== testimonial.name)
                        : [...current, testimonial.name],
                    )
                  }
                >
                  <span>{isExpanded ? "Show less" : "Read more"}</span>
                  <span aria-hidden="true">→</span>
                </button>
              )}
              <div className="testimonial-person">
                <Image
                  src={testimonial.avatar}
                  alt=""
                  width={44}
                  height={44}
                />
                <div>
                  <strong>{testimonial.name}</strong>
                  <small>
                    {testimonial.role} · {testimonial.location}
                  </small>
                </div>
              </div>
              <dl className="testimonial-outcome">
                <div>
                  <dt>Interview focus</dt>
                  <dd>{testimonial.companyOutcome}</dd>
                </div>
                <div>
                  <dt>Review date</dt>
                  <dd>{testimonial.date}</dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>

      <div className="company-showcase" aria-label="Example target companies">
        <div className="company-showcase-heading">
          <p>Prepare for opportunities across the industry</p>
          <span>
            35 example target companies across product, enterprise, IT
            services, startup, and fintech roles.
          </span>
        </div>
        <div className="company-marquee-rows">
          {companyRows.map((row, rowIndex) => (
            <div className="company-marquee" key={rowIndex}>
              <div
                className={`company-marquee-track${rowIndex === 1 ? " reverse" : ""}`}
              >
                {[0, 1].map((copy) => (
                  <div
                    className="company-marquee-set"
                    aria-hidden={copy === 1}
                    key={copy}
                  >
                    {row.map((company) => (
                      <div
                        className="company-wordmark"
                        key={`${copy}-${company.name}`}
                      >
                        <Image
                          className={
                            localCompanyLogos[company.name]
                              ? "company-logo-wide"
                              : undefined
                          }
                          src={
                            localCompanyLogos[company.name] ??
                            `https://www.google.com/s2/favicons?domain=${companyDomains[company.name]}&sz=64`
                          }
                          alt=""
                          width={42}
                          height={42}
                        />
                        <strong>{company.name}</strong>
                        <small>{company.group}</small>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <small className="company-disclaimer">
          Illustrative preparation targets, not verified hiring or placement
          claims.
        </small>
      </div>
    </div>
  );
}
