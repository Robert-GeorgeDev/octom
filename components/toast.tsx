"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

type ToastInput = { message: string; actionLabel?: string; onAction?: () => void; ms?: number };
type ToastItem = ToastInput & { id: number };

const Ctx = createContext<{ show: (t: ToastInput) => void }>({ show: () => {} });

/** Small messages at the bottom of the screen, with an optional action such as Undo. */
export function useToast() {
  return useContext(Ctx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setItems((list) => list.filter((x) => x.id !== id));
  }, []);

  const show = useCallback(
    (input: ToastInput) => {
      const id = nextId.current++;
      setItems((list) => [...list.slice(-2), { ...input, id }]);
      timers.current.set(id, setTimeout(() => dismiss(id), input.ms ?? (input.onAction ? 8000 : 4000)));
    },
    [dismiss]
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((timer) => clearTimeout(timer));
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 md:bottom-6"
      >
        {items.map((it) => (
          <div
            key={it.id}
            className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-white shadow-lift [animation:crm-fade_.25s_ease-out]"
          >
            <span className="min-w-0 flex-1">{it.message}</span>
            {it.onAction && it.actionLabel && (
              <button
                type="button"
                onClick={() => {
                  it.onAction?.();
                  dismiss(it.id);
                }}
                className="shrink-0 rounded-lg px-2.5 py-1.5 font-semibold text-indigo-300 hover:bg-white/10"
              >
                {it.actionLabel}
              </button>
            )}
            <button
              type="button"
              onClick={() => dismiss(it.id)}
              aria-label={t("toast.close")}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
