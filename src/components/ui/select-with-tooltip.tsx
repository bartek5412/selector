import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";

interface Option {
  id: string;
  name: string;
  description?: string;
}

interface SelectWithTooltipProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
}

export function SelectWithTooltip({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Wybierz opcję",
}: SelectWithTooltipProps) {
  const selectedOption = options.find((option) => option.id === value);

  return (
    <div>
      <Label className="text-sm font-medium mb-2 block">{label}</Label>
      <TooltipProvider>
        <Tooltip>
          <Select value={value} onValueChange={onValueChange}>
            <TooltipTrigger asChild>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </TooltipTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <TooltipContent
            className="bg-primary text-white"
            arrowClassName="bg-primary fill-primary"
          >
            <p>{selectedOption?.description || "Brak opisu"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
