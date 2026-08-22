"use client";

import { Select } from "@/components/ui/input";

const options = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "salary_high", label: "Highest salary" },
  { value: "salary_low", label: "Lowest salary" },
];

export function SortSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <Select
      name="sort"
      defaultValue={defaultValue}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      aria-label="Sort by"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          Sort: {opt.label}
        </option>
      ))}
    </Select>
  );
}
