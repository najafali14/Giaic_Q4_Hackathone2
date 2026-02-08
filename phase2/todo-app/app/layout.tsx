import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Import Inter font
import "./globals.css";
import { SWRProvider } from "./components/SWRProvider";
import { ToastProvider } from "./components/ToastProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" }); // Initialize Inter font

export const metadata: Metadata = {
  title: "Next.js Todo App",
  description: "A production-ready Todo application using Next.js 14, TypeScript, Tailwind CSS, and NeonDB.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen`}
      >
        <SWRProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </SWRProvider>
      </body>
    </html>
  );
}
