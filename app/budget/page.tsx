import type { Metadata } from "next";

import { BudgetClient } from "@/components/budget-client";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Student Budget Calculator for Australia",
  description:
    "Estimate monthly living costs, rent share, part-time income, and budget pressure for international students in Australian cities.",
  path: "/budget",
  keywords: [
    "student budget calculator Australia",
    "international student cost of living Australia",
    "student rent budget Melbourne Sydney Brisbane",
    "Australia student living expenses",
  ],
});

export default function BudgetPage() {
  return <BudgetClient />;
}
