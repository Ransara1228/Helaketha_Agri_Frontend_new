import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./main-home/globals.css";
import LayoutSwitcher from "@/components/LayoutSwitcher";
import SessionProvider from "@/components/SessionProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Helaketha Agri | Agricultural Excellence Platform",
  description:
    "Connect farmers, tractor drivers, harvester drivers, and fertilizer suppliers in one powerful platform for smarter agriculture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased">
        <SessionProvider>
          <LayoutSwitcher>{children}</LayoutSwitcher>
        </SessionProvider>
      </body>
    </html>
  );
}
