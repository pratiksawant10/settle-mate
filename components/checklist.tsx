import { CheckCircle2 } from "lucide-react";

type ChecklistProps = {
  title: string;
  items: string[];
};

export function Checklist({ title, items }: ChecklistProps) {
  return (
    <div className="rounded-lg border bg-white p-5">
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
