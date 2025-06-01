
"use client";

import { useFontSize } from '@/contexts/font-size-context';
import { Button } from '@/components/ui/button';
import { Check, Pilcrow } from 'lucide-react'; // Using Pilcrow as a generic text size icon
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function FontSizeSwitcher() {
  const { fontSize, setFontSize } = useFontSize();

  const fontSizes = [
    { label: 'Small', value: 'sm' },
    { label: 'Medium', value: 'md' },
    { label: 'Large', value: 'lg' },
  ] as const;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Pilcrow className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle font size</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Font Size</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {fontSizes.map((sizeOption) => (
          <DropdownMenuItem key={sizeOption.value} onClick={() => setFontSize(sizeOption.value)}>
            <div className="flex items-center justify-between w-full">
              <span>{sizeOption.label}</span>
              {fontSize === sizeOption.value && <Check className="h-4 w-4 ml-2" />}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
