export type Testimonial = {
  name: string;
  location: "India" | "United States";
  role: string;
  companyOutcome: string;
  rating: number;
  date: string;
  quote: string;
};

export const testimonials: Testimonial[] = [
  ["Aarav M.", "India", "Frontend Developer", "Product technology company", 5, "July 12, 2026", "The structured feedback helped me replace vague answers with clear examples and measurable results."],
  ["Ananya R.", "India", "Product Manager", "Consumer internet company", 5, "July 6, 2026", "Practicing the same competency twice made the gaps in my first answer immediately obvious."],
  ["Vivaan S.", "India", "Backend Engineer", "Financial services company", 5, "June 28, 2026", "The mock questions felt focused on my actual level instead of being generic interview prompts."],
  ["Diya P.", "India", "Data Analyst", "Analytics consulting company", 4, "June 19, 2026", "Recording my responses showed me where I rushed and where my explanation needed more context."],
  ["Arjun K.", "India", "Android Developer", "Mobile commerce company", 5, "June 10, 2026", "The improvement suggestions were specific enough to use in my very next practice answer."],
  ["Ishita N.", "India", "UX Designer", "Design-led SaaS company", 5, "May 29, 2026", "I learned to explain design decisions through outcomes instead of only walking through my process."],
  ["Rohan D.", "India", "DevOps Engineer", "Cloud infrastructure company", 4, "May 17, 2026", "The relevance score kept me from drifting into technical details that did not answer the question."],
  ["Meera T.", "India", "QA Engineer", "Enterprise software company", 5, "May 4, 2026", "It gave me a repeatable way to structure examples about quality, risk, and cross-team communication."],
  ["Kabir A.", "India", "Software Engineer", "Global services company", 5, "April 22, 2026", "Listening back and reading the transcript made my filler words and unclear transitions easy to fix."],
  ["Saanvi J.", "India", "Associate Software Engineer", "Technology consulting company", 4, "April 11, 2026", "The guided practice helped me prepare strong stories even without years of professional experience."],
  ["Maya C.", "United States", "Senior Product Designer", "Healthcare technology company", 5, "July 9, 2026", "The coach pushed me to connect every portfolio story to customer and business impact."],
  ["Ethan B.", "United States", "Full Stack Developer", "B2B software company", 5, "June 24, 2026", "It was the fastest way I found to turn passive preparation into realistic speaking practice."],
  ["Sophia L.", "United States", "Data Scientist", "Retail technology company", 4, "June 2, 2026", "The evidence score reminded me to quantify model impact rather than only describe the methodology."],
  ["Noah W.", "United States", "Engineering Manager", "Developer tools company", 5, "May 14, 2026", "The leadership prompts helped me communicate judgment, trade-offs, and team outcomes more clearly."],
  ["Olivia H.", "United States", "Product Marketing Manager", "Growth-stage SaaS company", 5, "April 26, 2026", "The feedback was concise, practical, and easy to apply before the next interview round."],
].map(([name, location, role, companyOutcome, rating, date, quote]) => ({
  name,
  location,
  role,
  companyOutcome,
  rating,
  date,
  quote,
})) as Testimonial[];
