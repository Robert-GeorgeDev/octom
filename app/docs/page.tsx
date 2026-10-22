import { SitePageRoute, siteMetadata } from "@/components/site-routes";

export const metadata = siteMetadata("docs", "en");

export default function Page() {
  return <SitePageRoute slug="docs" lang="en" />;
}
