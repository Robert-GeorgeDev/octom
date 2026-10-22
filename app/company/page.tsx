import { SitePageRoute, siteMetadata } from "@/components/site-routes";

export const metadata = siteMetadata("company", "en");

export default function Page() {
  return <SitePageRoute slug="company" lang="en" />;
}
