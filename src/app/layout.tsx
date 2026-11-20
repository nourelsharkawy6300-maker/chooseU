import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Jost, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { StudentProvider } from "@/context/StudentContext";
import { AppShellClient } from "@/components/AppShellClient";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jost-next",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://choose-u.vercel.app"
).replace(/\/+$/, "");

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ChooseU | دليلك الأكاديمي والمالي للجامعات المصرية",
    template: "%s | ChooseU",
  },
  description:
    "نظام التوجيه الجامعي، حساب التكلفة الشاملة (TCO)، وتحليل المسارات المهنية لطلاب الثانوية العامة وSTEM في الجامعات المصرية الحكومية والأهلية والخاصة.",
  applicationName: "ChooseU",
  keywords: [
    "ChooseU",
    "تنسيق الجامعات المصرية",
    "الجامعات الأهلية في مصر",
    "حساب التكلفة الشاملة للجامعة",
    "التوجيه الجامعي",
    "الثانوية العامة",
    "مدارس STEM",
    "TCO الجامعات",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: SITE_URL,
    siteName: "ChooseU",
    title: "ChooseU | دليلك الأكاديمي والمالي للجامعات المصرية",
    description:
      "قارن بين الجامعات الحكومية والأهلية والخاصة، احسب التكلفة التقديرية لسنوات الدراسة، ورتّب رغباتك بوضوح قبل التنسيق.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChooseU | دليلك الأكاديمي والمالي للجامعات المصرية",
    description:
      "نظام التوجيه الجامعي وحساب التكلفة الشاملة (TCO) لطلاب الثانوية العامة وSTEM في مصر.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ChooseU",
  url: SITE_URL,
  inLanguage: "ar-EG",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  description:
    "نظام التوجيه الجامعي وحساب التكلفة الشاملة (TCO) وتحليل المسارات المهنية لطلاب الثانوية العامة وSTEM في مصر.",
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
      className={`${ibmPlexSansArabic.variable} ${jost.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-[var(--paper)] text-slate-900 font-sans antialiased selection:bg-blue-600/20 selection:text-blue-900 min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <StudentProvider>
          <AppShellClient>{children}</AppShellClient>
        </StudentProvider>
      </body>
    </html>
  );
}