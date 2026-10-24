"use client";

import { useMemo, useState } from "react";
import { LeadListCard, type LeadListItem } from "@/components/LeadListCard";
import { inputClass } from "@/components/fields";
import { digitsOnly } from "@/lib/phone";

export function PendingLeadList({ leads }: { leads: LeadListItem[] }) {
  const [query, setQuery] = useState("");

  // Filters as you type: matches part of the mother's name, or part of the mobile number
  // (digits only, so "98765", "98 765" and "+91 98765" all work).
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    const qDigits = digitsOnly(q);
    return leads.filter(
      (l) =>
        l.motherName.toLowerCase().includes(q) ||
        (qDigits.length > 0 && digitsOnly(l.contactNumber).includes(qDigits))
    );
  }, [leads, query]);

  return (
    <div>
      <div className="relative mb-4">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or mobile number"
          aria-label="Search pending leads by name or mobile number"
          autoComplete="off"
          className={`${inputClass} pl-11`}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
          {leads.length === 0
            ? "No pending inquiries. Nice and caught up — add a new inquiry any time."
            : `No pending leads match “${query.trim()}”.`}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => (
            <LeadListCard key={lead.id} lead={lead} href={`/leads/${lead.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
