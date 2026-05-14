import { ReactNode } from "react";
import { Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ResultPanelProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function ResultPanel({ title, children, className }: ResultPanelProps) {
  return (
    <Card className={cn("border-primary/20 shadow-soft", className)}>
      <CardHeader className="border-b bg-gradient-to-r from-sky-50 to-emerald-50">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">{children}</CardContent>
    </Card>
  );
}
