"use client";

import { DetailSkeleton } from "@/components/skeleton";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import RequireAuth from "@/components/require-auth";
import ContactDetail from "@/components/contact-detail";
import { useLanguage } from "@/components/language-provider";
import { useOrgId } from "@/hooks/use-org-id";

function ProfileView() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const orgId = useOrgId();

  return (
    <main className="mx-auto max-w-6xl px-5 pb-10 pt-8">
      <Link
        href="/contacts"
        className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 transition hover:text-brand"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        {t("profile.back").replace("← ", "")}
      </Link>
      <div className="mt-4">
        {orgId ? (
          <ContactDetail id={id} orgId={orgId} variant="page" onDeleted={() => router.replace("/contacts")} />
        ) : (
          <DetailSkeleton />
        )}
      </div>
    </main>
  );
}

export default function ContactProfilePage() {
  return (
    <RequireAuth>
      <ProfileView />
    </RequireAuth>
  );
}
