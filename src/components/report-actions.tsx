"use client";

export function ReportActions({ className }: { className: string }) {
  return <button className={className} type="button" onClick={() => window.print()}>
    Print or save PDF
  </button>;
}
