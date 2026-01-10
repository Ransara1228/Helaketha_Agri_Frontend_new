import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Helaketha Agri Frontend",
  description: "Helaketha Agriculture Frontend Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

