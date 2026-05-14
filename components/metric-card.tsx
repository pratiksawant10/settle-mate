import { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
};

export function MetricCard({ label, value, helper, icon }: MetricCardProps) {
  return (
    <div className="rounded-lg border bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
        {icon ? <span className="text-primary">{icon}</span> : null}
      </div>
      {helper ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{helper}</p> : null}
    </div>
  );
}
