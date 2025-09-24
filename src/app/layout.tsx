import type { Metadata } from "next";
import "./globals.css";
import "antd/dist/reset.css";
import { Toaster } from "@/components/ui/toaster";

import { Inter, Roboto, Lato, Montserrat } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const roboto = Roboto({ subsets: ["latin"], variable: "--font-roboto", weight: ["400", "700"] });
const lato = Lato({ subsets: ["latin"], variable: "--font-lato", weight: ["400", "700"] });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "LabelForge Pro",
  description: "Design and export printable labels with dynamic data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${roboto.variable} ${lato.variable} ${montserrat.variable} font-body antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
