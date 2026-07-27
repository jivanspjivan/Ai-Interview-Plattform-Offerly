"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { testimonials, type Testimonial } from "@/data/testimonials";

const categories = ["All", "Engineering", "Product & Design", "Data & Leadership"] as const;

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
  const [category, setCategory] = useState<Category>("All");
  const [page, setPage] = useState(0);
  const [expandedReviews, setExpandedReviews] = useState<string[]>([]);
  const filtered = useMemo(
    () =>
      category === "All"
        ? testimonials
        : testimonials.filter((testimonial) => getCategory(testimonial) === category),
    [category],
  );
  const pageCount = Math.ceil(filtered.length / 3);
  const visibleTestimonials = filtered.slice(page * 3, page * 3 + 3);

  function selectCategory(nextCategory: Category) {
    setCategory(nextCategory);
    setPage(0);
  }

  return (
    <>
      <div className="testimonial-toolbar">
        <div className="testimonial-filters" aria-label="Filter review examples">
          {categories.map((item) => (
            <button
              className={category === item ? "active" : ""}
              key={item}
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
        {visibleTestimonials.map((testimonial) => {
          const isExpanded = expandedReviews.includes(testimonial.name);
          const isLongReview = testimonial.quote.length > 80;

          return (
            <article
              className="testimonial-card"
              key={`${testimonial.name}-${testimonial.date}`}
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
    </>
  );
}
