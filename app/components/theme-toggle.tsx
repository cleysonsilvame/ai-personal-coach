"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Theme, useTheme } from "remix-themes";
import { Button } from "~/components/ui/button";



export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useTheme()

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT)}
      aria-label="Toggle theme"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
