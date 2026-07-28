import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import styles from "../insights.module.css";

export const metadata: Metadata = {
  title: "Session history | Offerly",
  description: "Review your saved Offerly practice sessions.",
};

type HistoryPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const PAGE_SIZE = 8;

function valueOf(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function queryHref(
  params: Record<string, string>,
  page: number,
) {
  const query = new URLSearchParams(params);
  query.set("page", String(page));
  return `/dashboard/history?${query.toString()}`;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  await requireUser();
  const params = await searchParams;
  const search = valueOf(params.search).trim().slice(0, 120);
  const type = valueOf(params.type);
  const status = valueOf(params.status);
  const sort = valueOf(params.sort) === "oldest" ? "oldest" : "newest";
  const requestedPage = Number(valueOf(params.page));
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const supabase = await createClient();

  let query = supabase
    .from("interview_sessions")
    .select("*", { count: "exact" });
  if (search) query = query.ilike("role", `%${search}%`);
  if (type === "behavioral" || type === "technical" || type === "mixed") {
    query = query.eq("interview_type", type);
  }
  if (
    status === "completed" ||
    status === "in_progress" ||
    status === "abandoned"
  ) {
    query = query.eq("status", status);
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await query
    .order("created_at", { ascending: sort === "oldest" })
    .range(from, from + PAGE_SIZE - 1);
  const sessions = data ?? [];
  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const activeParams = {
    ...(search ? { search } : {}),
    ...(type ? { type } : {}),
    ...(status ? { status } : {}),
    ...(sort ? { sort } : {}),
  };

  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>Session history</p>
        <h1>Every practice round, in one place.</h1>
        <span>
          Review completed and unfinished sessions, then return to the formats
          and roles that matter most.
        </span>
      </div>

      <form className={styles.filters}>
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by target role"
          aria-label="Search by target role"
        />
        <select name="type" defaultValue={type} aria-label="Interview type">
          <option value="">All formats</option>
          <option value="behavioral">Behavioral</option>
          <option value="technical">Technical</option>
          <option value="mixed">Mixed</option>
        </select>
        <select name="status" defaultValue={status} aria-label="Session status">
          <option value="">All statuses</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In progress</option>
          <option value="abandoned">Abandoned</option>
        </select>
        <select name="sort" defaultValue={sort} aria-label="Sort order">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
        <button type="submit">Apply</button>
      </form>

      <div className={styles.resultMeta}>
        <span>{total} saved {total === 1 ? "session" : "sessions"}</span>
        {(search || type || status) && (
          <Link href="/dashboard/history">Clear filters</Link>
        )}
      </div>

      {sessions.length ? (
        <div className={styles.sessionGrid}>
          {sessions.map((session) => (
            <Link
              className={styles.sessionCard}
              href={`/dashboard/history/${session.id}`}
              key={session.id}
            >
              <div>
                <h2>{session.role}</h2>
                <div className={styles.sessionMeta}>
                  <span>{session.interview_type}</span>
                  <span>{session.experience_level}</span>
                  <span>{session.planned_duration} minutes</span>
                  <span
                    className={`${styles.status} ${
                      session.status === "completed"
                        ? styles.statusCompleted
                        : session.status === "abandoned"
                          ? styles.statusAbandoned
                          : ""
                    }`}
                  >
                    {session.status.replace("_", " ")}
                  </span>
                </div>
              </div>
              <div className={styles.sessionAside}>
                <time dateTime={session.created_at}>
                  {new Intl.DateTimeFormat("en-IN", {
                    dateStyle: "medium",
                  }).format(new Date(session.created_at))}
                </time>
                <span>View details →</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <strong>No sessions match this view.</strong>
          <p>Start a new practice round or adjust the filters above.</p>
          <Link href="/interview/new">Start practicing →</Link>
        </div>
      )}

      {pageCount > 1 && (
        <nav className={styles.pagination} aria-label="History pages">
          {page > 1 ? (
            <Link href={queryHref(activeParams, page - 1)}>←</Link>
          ) : (
            <span>←</span>
          )}
          <span>{page} / {pageCount}</span>
          {page < pageCount ? (
            <Link href={queryHref(activeParams, page + 1)}>→</Link>
          ) : (
            <span>→</span>
          )}
        </nav>
      )}
    </section>
  );
}
