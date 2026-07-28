import type { Metadata } from "next";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth";
import { planCatalog } from "@/lib/plans";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SubscriptionRow } from "@/types/database";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: "Admin users | Offerly",
  description: "Review Offerly users and subscription status.",
};

type AdminPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const PAGE_SIZE = 12;

function valueOf(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function pageHref(search: string, page: number) {
  const query = new URLSearchParams();
  if (search) query.set("search", search);
  query.set("page", String(page));
  return `/dashboard/admin?${query.toString()}`;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const search = valueOf(params.search).trim().slice(0, 120);
  const requestedPage = Number(valueOf(params.page));
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const from = (page - 1) * PAGE_SIZE;
  const admin = createAdminClient();

  let profilesQuery = admin
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });
  if (search) {
    const escapedSearch = search.replace(/[^a-zA-Z0-9@._+\-\s]/g, "");
    profilesQuery = profilesQuery.or(
      `email.ilike.%${escapedSearch}%,full_name.ilike.%${escapedSearch}%`,
    );
  }

  const [
    { data: profiles, count: filteredCount, error: profilesError },
    { count: totalUsers },
    { count: activeSubscriptions },
    { count: allPaidSubscriptions },
  ] = await Promise.all([
    profilesQuery.range(from, from + PAGE_SIZE - 1),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    admin
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .in("plan_tier", ["premium", "premium_plus"]),
  ]);

  if (profilesError) {
    throw new Error(`Unable to load users: ${profilesError.message}`);
  }

  const users = profiles ?? [];
  const userIds = users.map((profile) => profile.id);
  const [{ data: subscriptions }, { data: sessions }, authUsers] =
    userIds.length
      ? await Promise.all([
          admin.from("subscriptions").select("*").in("user_id", userIds),
          admin.from("interview_sessions").select("user_id").in("user_id", userIds),
          Promise.all(
            userIds.map(async (userId) => {
              const { data } = await admin.auth.admin.getUserById(userId);
              return data.user;
            }),
          ),
        ])
      : [
          { data: [] as SubscriptionRow[] },
          { data: [] as { user_id: string }[] },
          [],
        ];

  const subscriptionsByUser = new Map(
    (subscriptions ?? []).map((subscription) => [
      subscription.user_id,
      subscription,
    ]),
  );
  const sessionsByUser = new Map<string, number>();
  for (const session of sessions ?? []) {
    sessionsByUser.set(
      session.user_id,
      (sessionsByUser.get(session.user_id) ?? 0) + 1,
    );
  }
  const authUsersById = new Map<string, User>();
  for (const authUser of authUsers) {
    if (authUser) authUsersById.set(authUser.id, authUser);
  }
  const total = filteredCount ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section className={styles.section}>
      <header className={styles.heading}>
        <p>Administration</p>
        <h1>Users and subscriptions</h1>
        <span>
          Review account activity, interview usage, and current billing status.
        </span>
      </header>

      <div className={styles.summary}>
        <article>
          <span>Total users</span>
          <strong>{totalUsers ?? 0}</strong>
        </article>
        <article>
          <span>Active subscribers</span>
          <strong>{activeSubscriptions ?? 0}</strong>
        </article>
        <article>
          <span>Paid records</span>
          <strong>{allPaidSubscriptions ?? 0}</strong>
        </article>
        <article>
          <span>Free users</span>
          <strong>{Math.max(0, (totalUsers ?? 0) - (activeSubscriptions ?? 0))}</strong>
        </article>
      </div>

      <form className={styles.search}>
        <input
          aria-label="Search users"
          defaultValue={search}
          name="search"
          placeholder="Search by name or email"
        />
        <button type="submit">Search</button>
        {search && <Link href="/dashboard/admin">Clear</Link>}
        <Link href="/dashboard/admin/monitoring">Monitoring</Link>
        <Link href="/api/admin/export">Export CSV</Link>
      </form>

      <div className={styles.resultMeta}>
        <span>
          {total} {total === 1 ? "user" : "users"}
          {search ? " found" : ""}
        </span>
      </div>

      {users.length ? (
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Account</th>
                <th>Plan</th>
                <th>Subscription</th>
                <th>Sessions</th>
                <th>Joined</th>
                <th>Last sign-in</th>
              </tr>
            </thead>
            <tbody>
              {users.map((profile) => {
                const subscription = subscriptionsByUser.get(profile.id);
                const authUser = authUsersById.get(profile.id);
                const accountEnabled = !authUser?.banned_until;
                const tier =
                  subscription?.status === "active"
                    ? subscription.plan_tier
                    : "basic";
                return (
                  <tr key={profile.id}>
                    <td>
                      <strong><Link href={`/dashboard/admin/users/${profile.id}`}>
                        {profile.full_name || "Unnamed user"}
                      </Link></strong>
                      <span>{profile.email}</span>
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          accountEnabled ? styles.active : styles.inactive
                        }`}
                      >
                        {accountEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </td>
                    <td>
                      <strong>{planCatalog[tier].name}</strong>
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          subscription?.status === "active"
                            ? styles.active
                            : styles.neutral
                        }`}
                      >
                        {subscription?.status ?? "Not subscribed"}
                      </span>
                      {subscription?.current_period_end && (
                        <small>
                          Until {formatDate(subscription.current_period_end)}
                        </small>
                      )}
                    </td>
                    <td>{sessionsByUser.get(profile.id) ?? 0}</td>
                    <td>{formatDate(profile.created_at)}</td>
                    <td>{formatDate(authUser?.last_sign_in_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.empty}>
          <strong>No users found.</strong>
          <p>Try another name or email address.</p>
        </div>
      )}

      {pageCount > 1 && (
        <nav className={styles.pagination} aria-label="Admin user pages">
          {page > 1 ? (
            <Link href={pageHref(search, page - 1)}>← Previous</Link>
          ) : (
            <span>← Previous</span>
          )}
          <span>
            Page {page} of {pageCount}
          </span>
          {page < pageCount ? (
            <Link href={pageHref(search, page + 1)}>Next →</Link>
          ) : (
            <span>Next →</span>
          )}
        </nav>
      )}
    </section>
  );
}
