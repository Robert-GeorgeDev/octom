import { SitePageRoute, siteMetadata } from "@/components/site-routes";

export const metadata = siteMetadata("subprocessors", "en");

export default function Page() {
  return <SitePageRoute slug="subprocessors" lang="en" />;
}
