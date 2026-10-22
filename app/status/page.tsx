import { SitePageRoute, siteMetadata } from "@/components/site-routes";

export const metadata = siteMetadata("status", "en");

export default function Page() {
  return <SitePageRoute slug="status" lang="en" />;
}
