import { SitePageRoute, siteMetadata } from "@/components/site-routes";

export const metadata = siteMetadata("refunds", "en");

export default function Page() {
  return <SitePageRoute slug="refunds" lang="en" />;
}
