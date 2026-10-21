import LegalLayout from "@/components/legal-layout";
import LegalDoc from "@/components/legal-doc";
import { loadLegalDoc } from "@/lib/legal-content";

export const metadata = { title: "Billing – Octom" };

export default function Page() {
  const doc = loadLegalDoc("refunds");
  return (
    <LegalLayout title="Billing" titleRo="Facturare">
      <LegalDoc ro={doc.ro} en={doc.en} />
    </LegalLayout>
  );
}
