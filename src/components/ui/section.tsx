import { ReactNode } from "react";
import { Card } from "./card";

interface SectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Section({
  title,
  icon,
  children,
  className = "",
}: SectionProps) {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        {icon && <div className="text-primary">{icon}</div>}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      <div className="space-y-4">{children}</div>
    </Card>
  );
}
