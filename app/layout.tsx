import type { Metadata } from "next";
import { ThemeProvider } from "@/src/shared/view/providers/theme-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Cognix",
    template: "%s | Cognix",
  },
  description:
    "Versao web do Cognix com autenticacao modular, interface profissional e base pronta para crescimento por modulos.",
};

// Runs before React hydration to avoid flash of wrong theme
const ANTI_FOUC = `(function(){try{var t=localStorage.getItem('cognix_theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ANTI_FOUC }} />
      </head>
      <body className="min-h-full overflow-x-hidden bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
