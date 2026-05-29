import type { Metadata } from "next";
import { AppFooter } from "@/app/app-footer";
import { AppNav } from "@/app/app-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RentNest — apartments, rooms & roommates",
    template: "%s · RentNest",
  },
  description:
    "Find apartments, rooms, and roommates anywhere. A warm, simple rental board for renters and posters alike.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <AppNav />
        <div className="flex-1">{children}</div>
        <AppFooter />
      </body>
    </html>
  );
}
