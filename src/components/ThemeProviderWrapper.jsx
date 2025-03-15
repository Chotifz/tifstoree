"use client";

import { ThemeProvider } from "next-themes";

export default function ThemeProviderWrapper({ children }) {
  return (
    <ThemeProvider 
      attribute="class" 
      enableSystem 
      defaultTheme="system"
      // These props help avoid hydration mismatch
      enableColorScheme={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}