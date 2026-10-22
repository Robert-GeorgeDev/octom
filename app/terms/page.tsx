import { SitePageRoute, siteMetadata } from "@/components/site-routes";

export const metadata = siteMetadata("terms", "en");

export default function Page() {
  return <SitePageRoute slug="terms" lang="en" />;
}
