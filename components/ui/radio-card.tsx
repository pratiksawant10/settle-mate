import * as React from "react";

import { cn } from "@/lib/utils";

type RadioCardProps = {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  label: string;
  description?: string;
};

export function RadioCard({
  name,
  value,
  checked,
  onChange,
  label,
  description,
}: RadioCardProps) {
  return (
    <label
      className={cn(
        "flex min-h-20 cursor-pointer flex-col justify-center rounded-lg border bg-white p-4 transition-colors",
        checked ? "border-primary bg-sky-50" : "border-border hover:bg-muted",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      <span className="text-sm font-semibold">{label}</span>
      {description ? <span className="mt-1 text-xs leading-5 text-muted-foreground">{description}</span> : null}
    </label>
  );
}
