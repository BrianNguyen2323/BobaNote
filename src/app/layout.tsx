import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boba Note",
  description: "Log your boba drinks and see your habits over time.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3fb" },
    { media: "(prefers-color-scheme: dark)", color: "#17121f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="font-sans">{children}</body>
    </html>
  );
}
