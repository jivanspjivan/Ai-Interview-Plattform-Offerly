"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminUserAction({
  userId, suspended,
}: { userId: string; suspended: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function update() {
    const next = !suspended;
    if (!window.confirm(`${next ? "Suspend" : "Restore"} this user account?`)) return;
    setLoading(true);
    const response = await fetch(`/api/admin/users/${userId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suspended: next }),
    });
    setLoading(false);
    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      window.alert(result.error ?? "Account update failed.");
      return;
    }
    router.refresh();
  }
  return <button type="button" disabled={loading} onClick={update}>
    {loading ? "Updating…" : suspended ? "Restore access" : "Suspend user"}
  </button>;
}
