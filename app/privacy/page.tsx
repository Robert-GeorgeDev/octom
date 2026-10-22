import { SitePageRoute, siteMetadata } from "@/components/site-routes";

export const metadata = siteMetadata("privacy", "en");

export default function Page() {
  return <SitePageRoute slug="privacy" lang="en" />;
}
