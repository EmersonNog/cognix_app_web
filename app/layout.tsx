import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Cognix",
    template: "%s | Cognix",
  },
  description:
    "Versao web do Cognix com autenticacao modular, interface profissional e base pronta para crescimento por modulos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full scroll-smooth">
      <body className="min-h-full overflow-x-hidden bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
