"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/insights.module.css";

type HistoryFiltersProps = {
  initialSearch: string;
  initialType: string;
  initialStatus: string;
  initialSort: string;
};

export function HistoryFilters({
  initialSearch,
  initialType,
  initialStatus,
  initialSort,
}: HistoryFiltersProps) {
  const router = useRouter();
  const firstRender = useRef(true);
  const [search, setSearch] = useState(initialSearch);
  const [type, setType] = useState(initialType);
  const [status, setStatus] = useState(initialStatus);
  const [sort, setSort] = useState(initialSort);

  function update(next: {
    search?: string;
    type?: string;
    status?: string;
    sort?: string;
  }) {
    const params = new URLSearchParams();
    const values = {
      search: next.search ?? search,
      type: next.type ?? type,
      status: next.status ?? status,
      sort: next.sort ?? sort,
    };
    Object.entries(values).forEach(([key, value]) => {
      if (value && !(key === "sort" && value === "newest")) {
        params.set(key, value);
      }
    });
    const query = params.toString();
    router.replace(query ? `/dashboard/history?${query}` : "/dashboard/history");
  }

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const timeout = window.setTimeout(() => update({ search }), 350);
    return () => window.clearTimeout(timeout);
    // Other controls navigate immediately in their change handlers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className={styles.filters} aria-label="Filter interview history">
      <label className={styles.searchField}>
        <span aria-hidden="true">⌕</span>
        <span className={styles.srOnly}>Search by target role</span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by target role"
        />
      </label>
      <select
        value={type}
        onChange={(event) => {
          setType(event.target.value);
          update({ type: event.target.value });
        }}
        aria-label="Interview type"
      >
        <option value="">All formats</option>
        <option value="behavioral">Behavioral</option>
        <option value="technical">Technical</option>
        <option value="mixed">Mixed</option>
      </select>
      <select
        value={status}
        onChange={(event) => {
          setStatus(event.target.value);
          update({ status: event.target.value });
        }}
        aria-label="Session status"
      >
        <option value="">All statuses</option>
        <option value="completed">Completed</option>
        <option value="in_progress">In progress</option>
        <option value="abandoned">Abandoned</option>
      </select>
      <select
        value={sort}
        onChange={(event) => {
          setSort(event.target.value);
          update({ sort: event.target.value });
        }}
        aria-label="Sort order"
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>
    </div>
  );
}
