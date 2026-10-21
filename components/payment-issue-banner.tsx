"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import BillingButton from "@/components/billing-actions";
import { useOrgId } from "@/hooks/use-org-id";
import { supabase } from "@/lib/supabase";
import { resolveEntitlements } from "@/lib/entitlements";

// Shown at the top of the app while a payment has failed but the paid plan is
// still kept (grace period). Only owners and admins can open the billing portal;
// anyone else just reads the notice.
export default function PaymentIssueBanner() {
  const { t, lang } = useLanguage();
  const orgId = useOrgId();
  const [until, setUntil] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    supabase
      .from("subscriptions")
      .select("plan, status, grace_until")
      .eq("organization_id", orgId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const e = resolveEntitlements(data as { plan: string; status: string; grace_until: string | null } | null);
        setUntil(e.paymentIssue ? (e.graceUntil ?? null) : undefined);
      });
    return () => {
      cancelled = true;
    };
  }, [orgId]);

  if (until === undefined) return null;
  const date = until
    ? new Date(until).toLocaleDateString(lang === "ro" ? "ro-RO" : "en-GB", { day: "numeric", month: "long" })
    : null;

  return (
    <div role="alert" className="mx-4 mt-4 flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:flex-row sm:items-center md:mx-6">
      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold text-amber-900">{t("billing.pastDue.title")}</p>
        <p className="text-amber-800">
          {date ? t("billing.pastDue.text").replace("{date}", date) : t("billing.pastDue.textNoDate")}
        </p>
      </div>
      <BillingButton orgId={orgId} kind="manage" className="sm:w-56" />
    </div>
  );
}
