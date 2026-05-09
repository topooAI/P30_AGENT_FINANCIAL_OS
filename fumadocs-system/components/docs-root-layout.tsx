import type { ReactNode } from "react";
import { RootProvider } from "fumadocs-ui/provider/next";

export function DocsRootLayout({
  children,
  lang = "en",
  searchEnabled = false,
  className,
}: {
  children: ReactNode;
  lang?: string;
  searchEnabled?: boolean;
  className?: string;
}) {
  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={["group/body min-h-screen overscroll-none antialiased", className].filter(Boolean).join(" ")}>
        <RootProvider search={{ enabled: searchEnabled }}>{children}</RootProvider>
      </body>
    </html>
  );
}
