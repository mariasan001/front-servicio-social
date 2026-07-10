import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/vacantes", "/vacantes/"],
      disallow: [
        "/panel/",
        "/login",
        "/registro",
        "/recuperar-contrasena",
        "/restablecer-contrasena",
        "/api/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
