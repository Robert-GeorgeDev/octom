import DemoPage, { demoMetadata } from "@/components/demo-page";

export const metadata = demoMetadata("en");

export default function Page() {
  return <DemoPage lang="en" />;
}
