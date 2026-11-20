import type { MetadataRoute } from "next";

const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://choose-u.vercel.app"
).replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/auth/",
          "/onboarding/",
          "/workspace",
          "/track-order",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}