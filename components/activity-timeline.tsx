"use client";

import { ListSkeleton } from "@/components/skeleton";
import { useEffect, useState } from "react";
import { CalendarCheck, CalendarClock, CalendarPlus, CheckCircle2, Mail, MessageCircle, Phone, StickyNote, Users, Flag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/dates";
import { parseLogged } from "@/lib/contact-utils";
import { useLanguage } from "@/components/language-provider";
import type { Key } from "@/lib/dictionaries";

type Activity = {
  id: string;
  type: string;
  description: string;
  created_at: string;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const KIND_ICON: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Users,
  message: MessageCircle,
  note: StickyNote,
};

export default function ActivityTimeline({
  orgId,
  contactId,
  refreshKey,
  bare = false,
}: {
  orgId: string;
  contactId: string;
  refreshKey: string;
  /** Without its own heading, for use inside a tab. */
  bare?: boolean;
}) {
  const { t, lang } = useLanguage();
  const locale = lang === "ro" ? "ro-RO" : "en-GB";
  const [items, setItems] = useState<Activity[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("activities")
      .select("id, type, description, created_at")
      .eq("organization_id", orgId)
      .eq("contact_id", contactId)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setFailed(true);
          return;
        }
        setFailed(false);
        setItems((data ?? []) as Activity[]);
      });
    return () => {
      cancelled = true;
    };
  }, [orgId, contactId, refreshKey]);

  function dateText(value: string): string {
    return ISO_DATE.test(value) ? formatDate(value, locale) : value;
  }

  function view(a: Activity): { Icon: typeof Phone; tone: string; title: string; text: string } {
    switch (a.type) {
      case "status_changed": {
        const label = t(("status." + a.description) as Key) || a.description;
        return { Icon: Flag, tone: "bg-indigo-50 text-brand", title: `${t("activity.status_changed")} ${label}`, text: "" };
      }
      case "note": {
        const text = a.description;
        return { Icon: StickyNote, tone: "bg-amber-50 text-amber-600", title: text ? t("crm.kind.note") : t("activity.note"), text };
      }
      case "contacted": {
        const { kind, text } = parseLogged(a.description);
        const known = ["call", "email", "meeting", "message"].includes(kind);
        return {
          Icon: KIND_ICON[kind] ?? Phone,
          tone: "bg-sky-50 text-sky-600",
          title: known ? t(("crm.logged." + kind) as Key) : t("crm.logged.call"),
          text,
        };
      }
      case "follow_up_created":
        return { Icon: CalendarPlus, tone: "bg-violet-50 text-violet-600", title: `${t("activity.follow_up_created")} ${dateText(a.description)}`, text: "" };
      case "follow_up_completed":
        return { Icon: CheckCircle2, tone: "bg-emerald-50 text-done", title: t("activity.follow_up_completed"), text: "" };
      case "follow_up_snoozed":
        return { Icon: CalendarClock, tone: "bg-slate-100 text-slate-600", title: `${t("activity.follow_up_snoozed")} ${dateText(a.description)}`, text: "" };
      default:
        return { Icon: CalendarCheck, tone: "bg-slate-100 text-slate-600", title: a.description, text: "" };
    }
  }

  function dayLabel(d: Date): string {
    const today = new Date();
    const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const diff = Math.round((start(today) - start(d)) / 86400000);
    if (diff === 0) return t("crm.today");
    if (diff === 1) return t("crm.yesterday");
    return d.toLocaleDateString(locale, { day: "numeric", month: "long", year: d.getFullYear() === today.getFullYear() ? undefined : "numeric" });
  }

  let lastDay = "";

  return (
    <section className={bare ? "" : "mt-10"}>
      {!bare && <h2 className="text-lg font-semibold">{t("activity.title")}</h2>}

      {failed && (
        <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-overdue">
          {t("activity.loadError")}
        </p>
      )}
      {!failed && items === null && <ListSkeleton rows={2} />}
      {items && items.length === 0 && <p className="mt-3 text-sm text-slate-600">{t("activity.empty")}</p>}

      <ol className="mt-1">
        {(items ?? []).map((a) => {
          const d = new Date(a.created_at);
          const day = dayLabel(d);
          const showDay = day !== lastDay;
          lastDay = day;
          const v = view(a);
          return (
            <li key={a.id}>
              {showDay && <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">{day}</p>}
              <div className="flex gap-3 py-1.5">
                <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${v.tone}`}>
                  <v.Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-semibold text-ink">{v.title}</span>
                    <span className="ml-2 text-xs text-slate-400">
                      {d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </p>
                  {v.text && (
                    <p className="mt-1 whitespace-pre-wrap break-words rounded-xl border border-line bg-white px-3 py-2 text-sm text-slate-700">
                      {v.text}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
