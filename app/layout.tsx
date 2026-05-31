import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SafeAuthProvider } from "@/components/providers/SafeAuthProvider";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nebulist - Creative Acquisition OS",
  description: "AI-powered acquisition, CRM, and event planning platform for creative installations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} cinematic-bg`}>
        <SafeAuthProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </SafeAuthProvider>
      </body>
    </html>
  );
}
