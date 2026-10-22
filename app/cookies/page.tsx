import { SitePageRoute, siteMetadata } from "@/components/site-routes";

export const metadata = siteMetadata("cookies", "en");

export default function Page() {
  return <SitePageRoute slug="cookies" lang="en" />;
}
