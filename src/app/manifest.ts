import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ChooseU | دليلك الأكاديمي والمالي للجامعات المصرية",
    short_name: "ChooseU",
    description:
      "نظام التوجيه الجامعي، حساب التكلفة الشاملة (TCO)، وتحليل المسارات المهنية لطلاب الثانوية العامة وSTEM في مصر.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#2563eb",
    lang: "ar",
    dir: "rtl",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}