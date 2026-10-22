import { SitePageRoute, siteMetadata } from "@/components/site-routes";

export const metadata = siteMetadata("contact", "en");

export default function Page() {
  return <SitePageRoute slug="contact" lang="en" />;
}
