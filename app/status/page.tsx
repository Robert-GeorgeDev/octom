import StatusView from "@/components/status-view";

export const metadata = {
  title: "Status – OCTOM One",
  description: "Live availability of the OCTOM One website, app and database.",
  alternates: { canonical: "/status" },
};

export default function Page() {
  return <StatusView />;
}
