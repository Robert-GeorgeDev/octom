import { SitePageRoute, siteMetadata } from "@/components/site-routes";

export const metadata = siteMetadata("security", "en");

export default function Page() {
  return <SitePageRoute slug="security" lang="en" />;
}
