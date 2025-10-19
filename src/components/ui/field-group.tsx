import { ReactNode } from "react";

interface FieldGroupProps {
  children: ReactNode;
  className?: string;
}

export function FieldGroup({ children, className = "" }: FieldGroupProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      {children}
    </div>
  );
}

interface FieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, children, className = "" }: FieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div>{children}</div>
    </div>
  );
}
