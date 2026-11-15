import type { Metadata } from "next";
import "./globals.css";
import { StudentProvider } from "@/context/StudentContext";
import { AppShellClient } from "@/components/AppShellClient";

export const metadata: Metadata = {
  title: "ChooseU | منصة التدقيق الأكاديمي والمالي للجامعات المصرية",
  description:
    "نظام التوجيه الجامعي، حساب التكلفة الشاملة (TCO)، وتحليل المسارات المهنية لطلاب الثانوية العامة وSTEM.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
    >
      <body className="bg-[var(--paper)] text-slate-900 font-sans antialiased selection:bg-blue-600/20 selection:text-blue-900 min-h-screen">
        <StudentProvider>
          <AppShellClient>{children}</AppShellClient>
        </StudentProvider>
      </body>
    </html>
  );
}
