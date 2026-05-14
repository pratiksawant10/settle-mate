import { ReactNode } from "react";

import { SectionHeader } from "@/components/section-header";

type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function PageShell({ eyebrow, title, description, children }: PageShellProps) {
  return (
    <section className="settlemate-shell min-h-[calc(100vh-4rem)] py-10 md:py-14">
      <div className="container">
        <SectionHeader eyebrow={eyebrow} title={title} description={description} />
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
