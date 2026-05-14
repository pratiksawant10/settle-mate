import { ReactNode } from "react";

import { Label } from "@/components/ui/label";

type FieldProps = {
  id: string;
  label: string;
  children: ReactNode;
  helper?: string;
};

export function Field({ id, label, children, helper }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {helper ? <p className="text-xs leading-5 text-muted-foreground">{helper}</p> : null}
    </div>
  );
}
