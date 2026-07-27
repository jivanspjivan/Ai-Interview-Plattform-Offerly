export type JobRole = {
  label: string;
  category: string;
  aliases: string[];
};

export const jobRoles: JobRole[] = [
  {
    label: "Frontend Developer",
    category: "Frontend",
    aliases: ["frontend", "front end"],
  },
  {
    label: "Senior Frontend Developer",
    category: "Frontend",
    aliases: ["senior frontend", "sr frontend"],
  },
  {
    label: "Junior Frontend Developer",
    category: "Frontend",
    aliases: ["junior frontend", "jr frontend"],
  },
  {
    label: "Full Stack Developer",
    category: "Software Engineering",
    aliases: ["fullstack", "full stack"],
  },
  {
    label: "Backend Developer",
    category: "Backend",
    aliases: ["backend", "back end"],
  },
  {
    label: "Software Engineer",
    category: "Software Engineering",
    aliases: ["software developer", "swe"],
  },
  {
    label: "Associate Software Engineer",
    category: "Software Engineering",
    aliases: ["associate software", "ase", "junior software engineer"],
  },
  {
    label: "Senior Software Engineer",
    category: "Software Engineering",
    aliases: ["senior software", "sr software engineer", "sernie"],
  },
  {
    label: "Member of Technical Staff",
    category: "Software Engineering",
    aliases: ["member of tech staff", "member of tch staff", "mts"],
  },
  {
    label: "Java Developer",
    category: "Backend",
    aliases: ["java engineer"],
  },
  {
    label: "Node.js Developer",
    category: "Backend",
    aliases: ["node developer", "node js", "nodejs"],
  },
  {
    label: "Android Developer",
    category: "Mobile",
    aliases: ["android dev", "kotlin developer", "mobile android"],
  },
  {
    label: "Flutter Developer",
    category: "Mobile",
    aliases: ["flutter engineer", "mobile flutter"],
  },
  {
    label: "Mobile App Developer",
    category: "Mobile",
    aliases: ["mobile developer"],
  },
  {
    label: "DevOps Engineer",
    category: "DevOps",
    aliases: ["devops", "site reliability"],
  },
  {
    label: "Data Analyst",
    category: "Data",
    aliases: ["analytics"],
  },
  {
    label: "Data Scientist",
    category: "Data",
    aliases: ["machine learning"],
  },
  {
    label: "Product Manager",
    category: "Product",
    aliases: ["product management"],
  },
  {
    label: "UX Designer",
    category: "Design",
    aliases: ["ui ux", "product designer"],
  },
  {
    label: "QA Engineer",
    category: "Quality Assurance",
    aliases: ["quality assurance", "test engineer"],
  },
];

export function findJobRoles(query: string, limit = 4) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return [];

  return jobRoles
    .filter((role) =>
      [role.label, role.category, ...role.aliases].some((searchTerm) =>
        searchTerm.toLowerCase().includes(normalizedQuery),
      ),
    )
    .slice(0, limit);
}
