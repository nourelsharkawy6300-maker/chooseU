import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChooseU | المنظومة الوطنية للتوجيه الجامعي والتحليل المالي 2026",
  description:
    "One Platform. Every Student. Every Major. Every Future. منصة التحليل المالي والأكاديمي الذكي لاختيار كليتك ومستقبلك وفق معايير التنسيق والـ GPA وتكلفة الـ 4 سنوات الحقيقية.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark" style={{ colorScheme: "dark" }}>
      <head>
        <meta name="color-scheme" content="dark only" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script async src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                darkMode: 'class',
                theme: {
                  extend: {
                    colors: {
                      obsidian: '#0F172A',
                      surface: '#1E293B',
                      borderSubtle: '#334155',
                      brand: {
                        dark: '#0F172A',
                        slate: '#1E293B',
                        primary: '#2563EB',
                        accent: '#3B82F6',
                      },
                      cluster: {
                        med: '#059669',
                        eng: '#2563EB',
                        media: '#9333EA',
                        biz: '#D97706',
                        law: '#4F46E5',
                        arts: '#0D9488',
                      }
                    },
                    boxShadow: {
                      '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
                      'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
                      'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
                      'md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
                    },
                    borderRadius: {
                      'none': '0px',
                      'sm': '4px',
                      'DEFAULT': '6px',
                      'md': '8px',
                      'lg': '10px',
                      'xl': '12px',
                      '2xl': '12px',
                      '3xl': '14px',
                      '4xl': '16px',
                      'full': '9999px',
                    }
                  }
                }
              }
            `,
          }}
        />
      </head>
      <body
        className="bg-[#0F172A] text-slate-100 antialiased selection:bg-blue-600 selection:text-white min-h-screen"
        style={{
          fontFamily:
            "'IBM Plex Sans Arabic', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
