import { SitePageRoute, siteMetadata } from "@/components/site-routes";

export const metadata = siteMetadata("roadmap", "en");

export default function Page() {
  return <SitePageRoute slug="roadmap" lang="en" />;
}
