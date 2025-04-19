import { cn } from "@/lib/utils";
import "./globals.css";
import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import Navbar from "@/components/Navbar";
import { Provider } from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";

// Configure Source Sans 3 with variable font option
const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  // For variable fonts (recommended):
  // For static fonts (alternative):
  // weight: ['300', '400', '600', '700'],
});

export const metadata: Metadata = {
  title: "Learning Journey",
  description: "Your AI-powered learning companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sourceSans.variable}`}>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        sourceSans.className
      )}>
        <Provider>
          <Navbar />
            {children}
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}