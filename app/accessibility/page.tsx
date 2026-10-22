import { SitePageRoute, siteMetadata } from "@/components/site-routes";

export const metadata = siteMetadata("accessibility", "en");

export default function Page() {
  return <SitePageRoute slug="accessibility" lang="en" />;
}
