import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusCare | Tagore International School",
  description: "Tagore International School — Student Portal powered by Entab CampusCare. Access notices, assignments, results and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
