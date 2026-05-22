import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app/", "/api/", "/auth/", "/login", "/signup", "/forgot-password", "/r/"],
      },
    ],
    sitemap: "https://reevo.io/sitemap.xml",
  };
}
