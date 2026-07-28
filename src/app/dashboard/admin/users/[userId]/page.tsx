import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminUserAction } from "@/components/admin-user-action";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import styles from "../../admin.module.css";

export default async function AdminUserPage({
  params,
}: { params: Promise<{ userId: string }> }) {
  await requireAdmin();
  const { userId } = await params;
  const admin = createAdminClient();
  const [{ data: profile }, { data: subscription }, { data: sessions }, { data: auth }] =
    await Promise.all([
      admin.from("profiles").select("*").eq("id", userId).maybeSingle(),
      admin.from("subscriptions").select("*").eq("user_id", userId).maybeSingle(),
      admin.from("interview_sessions").select("*").eq("user_id", userId)
        .order("created_at", { ascending: false }).limit(12),
      admin.auth.admin.getUserById(userId),
    ]);
  if (!profile) notFound();
  return <section className={styles.section}>
    <header className={styles.heading}>
      <p><Link href="/dashboard/admin">Administration</Link> / User</p>
      <h1>{profile.full_name || "Unnamed user"}</h1>
      <span>{profile.email}</span>
    </header>
    <div className={styles.summary}>
      <article><span>Account</span><strong>{profile.is_suspended ? "Suspended" : "Enabled"}</strong></article>
      <article><span>Plan</span><strong>{subscription?.plan_tier ?? "basic"}</strong></article>
      <article><span>Billing</span><strong>{subscription?.status ?? "None"}</strong></article>
      <article><span>Sessions</span><strong>{sessions?.length ?? 0}</strong></article>
    </div>
    <div className={styles.search}>
      <AdminUserAction userId={userId} suspended={profile.is_suspended} />
    </div>
    <div className={styles.tableWrap}>
      <table><thead><tr><th>Session</th><th>Status</th><th>Score</th><th>Created</th></tr></thead>
      <tbody>{(sessions ?? []).map((session) => <tr key={session.id}>
        <td>{session.role} · {session.interview_type}</td>
        <td>{session.status}</td><td>Open report</td>
        <td>{new Date(session.created_at).toLocaleDateString("en-IN")}</td>
      </tr>)}</tbody></table>
    </div>
    <p className={styles.resultMeta}>Last sign-in: {auth.user?.last_sign_in_at ?? "Never"}</p>
  </section>;
}
