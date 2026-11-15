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
      className="dark"
    >
      <body className="bg-[#0F172A] text-slate-100 font-sans antialiased selection:bg-blue-600/30 selection:text-blue-200 min-h-screen">
        <StudentProvider>
          <AppShellClient>{children}</AppShellClient>
        </StudentProvider>
      </body>
    </html>
  );
}
