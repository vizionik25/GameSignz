"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  theme: "light",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Detect Whop theme from parent iframe context or computed styles
    function detectWhopTheme(): Theme | null {
      if (typeof window === "undefined") return null;

      const html = document.documentElement;
      const classList = html.classList;

      // Check for dark theme classes
      if (
        classList.contains("dark") ||
        classList.contains("dark-mode") ||
        classList.contains("theme-dark") ||
        classList.contains("whop-dark")
      ) {
        return "dark";
      }

      // Check data attributes
      const dataTheme = html.getAttribute("data-theme");
      const colorScheme = html.getAttribute("data-color-scheme");
      if (dataTheme === "dark" || colorScheme === "dark") {
        return "dark";
      }

      // Fallback: Check computed styles (specifically background color brightness)
      const computedStyle = getComputedStyle(html);
      const bgColor = computedStyle.backgroundColor;

      const rgb = bgColor.match(/\d+/g)?.map(Number);
      if (rgb && rgb.length >= 3) {
        const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
        return brightness < 128 ? "dark" : "light";
      }

      return null;
    }

    // Initial detection
    const detectedTheme = detectWhopTheme();
    if (detectedTheme) {
      setTheme(detectedTheme);
      document.documentElement.classList.toggle("dark", detectedTheme === "dark");
    }

    // Watch for theme changes from Whop
    const observer = new MutationObserver(() => {
      const newTheme = detectWhopTheme();
      if (newTheme && newTheme !== theme) {
        setTheme(newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "data-color-scheme", "style"],
    });

    return () => observer.disconnect();
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
