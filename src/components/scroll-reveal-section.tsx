"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

type ScrollRevealSectionProps = {
  children: ReactNode;
  className: string;
  id?: string;
  visibleClassName: string;
};

export function ScrollRevealSection({
  children,
  className,
  id,
  visibleClassName,
}: ScrollRevealSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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
      { threshold: 0, rootMargin: "0px 0px -40% 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`${className}${isVisible ? ` ${visibleClassName}` : ""}`}
      id={id}
    >
      {children}
    </section>
  );
}
