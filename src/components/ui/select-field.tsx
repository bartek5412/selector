import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Label } from "./label";

interface SelectFieldProps {
  label: string;
  options: Array<{ id: number; value: string; label: string }>;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  htmlFor?: string;
}

export function SelectField({
  label,
  options,
  value,
  onChange,
  placeholder = "Wybierz opcję",
  className = "",
  htmlFor,
}: SelectFieldProps) {
  return (
    <div className={`grid grid-cols-2 gap-4 ${className}`}>
      <Label htmlFor={htmlFor} className="text-sm font-medium pb-2">
        {label}
      </Label>
      <div className="flex items-center">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.id} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Wariant dla pełnej szerokości (label nad selectem)
export function SelectFieldFull({
  label,
  options,
  value,
  onChange,
  placeholder = "Wybierz opcję",
  className = "",
  htmlFor,
}: SelectFieldProps) {
  return (
    <div className={`col-span-2 ${className}`}>
      <Label htmlFor={htmlFor} className="text-sm font-medium pb-2">
        {label}
      </Label>
      <div className="mt-2">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.id} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
