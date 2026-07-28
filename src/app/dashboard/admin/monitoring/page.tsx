import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function MonitoringPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const [
    { count: failedEmails }, { count: pendingEmails }, { count: billingAttention },
    { data: events }, { data: audits }, { data: rateLimits },
  ] = await Promise.all([
    admin.from("email_outbox").select("id", { count: "exact", head: true }).eq("status", "failed"),
    admin.from("email_outbox").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("subscriptions").select("id", { count: "exact", head: true }).in("status", ["pending", "halted"]),
    admin.from("operational_events").select("*").order("created_at", { ascending: false }).limit(30),
    admin.from("admin_audit_logs").select("*").order("created_at", { ascending: false }).limit(20),
    admin.from("api_rate_limits").select("request_count"),
  ]);
  const requests = (rateLimits ?? []).reduce((sum, item) => sum + item.request_count, 0);
  return <section className={styles.section}>
    <header className={styles.heading}>
      <p><Link href="/dashboard/admin">Administration</Link> / Monitoring</p>
      <h1>Operational health</h1>
      <span>Billing, email, API protection, application events, and administrator actions.</span>
    </header>
    <div className={styles.summary}>
      <article><span>Billing needs attention</span><strong>{billingAttention ?? 0}</strong></article>
      <article><span>Pending emails</span><strong>{pendingEmails ?? 0}</strong></article>
      <article><span>Failed emails</span><strong>{failedEmails ?? 0}</strong></article>
      <article><span>Requests in tracked windows</span><strong>{requests}</strong></article>
    </div>
    <h2>Recent operational events</h2>
    <div className={styles.tableWrap}><table><thead><tr><th>Level</th><th>Key</th><th>Message</th><th>Trace</th><th>Time</th></tr></thead>
      <tbody>{(events ?? []).map((item) => <tr key={item.id}><td>{item.severity}</td><td>{item.event_key}</td><td>{item.message}</td><td>{item.trace_id ?? "—"}</td><td>{new Date(item.created_at).toLocaleString("en-IN")}</td></tr>)}</tbody>
    </table></div>
    <h2>Admin audit trail</h2>
    <div className={styles.tableWrap}><table><thead><tr><th>Action</th><th>Administrator</th><th>Target</th><th>Time</th></tr></thead>
      <tbody>{(audits ?? []).map((item) => <tr key={item.id}><td>{item.action}</td><td>{item.admin_user_id}</td><td>{item.target_user_id ?? "—"}</td><td>{new Date(item.created_at).toLocaleString("en-IN")}</td></tr>)}</tbody>
    </table></div>
  </section>;
}
