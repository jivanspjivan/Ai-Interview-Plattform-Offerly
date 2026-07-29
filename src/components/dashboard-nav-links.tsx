"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/history", label: "History" },
  { href: "/dashboard/progress", label: "Progress" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/account", label: "Account" },
];

export function DashboardNavLinks({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const items = isAdmin
    ? [...links, { href: "/dashboard/admin", label: "Admin" }]
    : links;

  return (
    <div className={styles.navLinks}>
      {items.map((item) => {
        const active = item.href === "/dashboard"
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            className={active ? styles.activeNavLink : undefined}
            href={item.href}
            key={item.href}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
