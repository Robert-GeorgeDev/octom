"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import LoadingScreen from "@/components/loading-screen";
import { useLanguage } from "@/components/language-provider";
import { supabase } from "@/lib/supabase";

export default function RequireAuth({
  children,
  requireWorkspace = true,
}: {
  children: React.ReactNode;
  requireWorkspace?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!requireWorkspace) {
      setReady(true);
      return;
    }
    let cancelled = false;
    supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setFailed(true);
        } else if (data) {
          setReady(true);
        } else {
          router.replace("/onboarding");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [loading, user, requireWorkspace, router]);

  if (failed) {
    return (
      <p role="alert" className="p-8 text-slate-600">
        {t("common.error")}
      </p>
    );
  }

  if (loading || !user || !ready) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
