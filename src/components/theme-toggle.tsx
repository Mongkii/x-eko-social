
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    // This component is typically used within another DropdownMenu as an item
    // So, it doesn't need its own DropdownMenuTrigger if used as planned in AppHeader.
    // For standalone use, it would.
    // The button text will be handled by the parent DropdownMenuItem.
    <>
      <Button variant="ghost" size="sm" className="w-full justify-start text-sm" onClick={() => setTheme("light")}>
        <Sun className="rtl:ml-2 ltr:mr-2 h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        فاتح
      </Button>
      <Button variant="ghost" size="sm" className="w-full justify-start text-sm" onClick={() => setTheme("dark")}>
        <Moon className="rtl:ml-2 ltr:mr-2 h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        داكن
      </Button>
      <Button variant="ghost" size="sm" className="w-full justify-start text-sm" onClick={() => setTheme("system")}>
        {/* No specific icon for system, or use a generic settings icon if desired */}
        النظام
      </Button>
    </>
  )
}

// If used as a standalone toggle button, it would be:
/*
export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          فاتح
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          داكن
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          النظام
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
*/
