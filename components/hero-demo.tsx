"use client";

import { Lock, Check } from "lucide-react";
import Mark from "@/components/mark";
import { useLanguage } from "@/components/language-provider";

/**
 * Animated product window used in the hero. Purely decorative, all names and
 * companies are fictional. The 12 s loop is CSS only (see landing.css).
 */
export default function HeroDemo() {
  const { t } = useLanguage();
  return (
    <div className="stage" aria-hidden="true">
      <div className="win">
        <div className="winbar">
          <span className="dt" /><span className="dt" /><span className="dt" />
          <span className="url">one.octom.eu/dashboard</span>
        </div>
        <div className="wb">
          <div className="side">
            <div className="si on">{t("lp.demo.n1")}</div>
            <div className="si">{t("lp.demo.n2")}</div>
            <div className="si">{t("lp.demo.n3")}</div>
            <div className="si">{t("lp.demo.n4")}</div>
            <div className="si">{t("lp.demo.n5")}</div>
          </div>
          <div className="mainc">
            <div className="greet">{t("lp.demo.greet")}</div>
            <div className="cnt"><span className="c3">{t("lp.demo.c3")}</span><span className="c2">{t("lp.demo.c2")}</span></div>
            <ul className="rows">
              <li className="rw r1">
                <div className="row">
                  <span className="dot d-a" />
                  <div><div className="nm">Maria Ionescu <small>· Studio Nord</small></div><div className="nt">{t("lp.demo.r1")}</div></div>
                  <div className="rt">
                    <div className="tagbox"><span className="tag tg-a tagA">{t("lp.demo.tagToday")}</span><span className="tag tg-g tagB">{t("lp.demo.tagDone")}</span></div>
                    <span className="gata">{t("lp.demo.go")}</span>
                  </div>
                </div>
                <svg className="cursor" viewBox="0 0 24 24"><path d="M3 2l7.5 19 2.6-7.6L21 10.8z" fill="#0B1026" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" /></svg>
              </li>
              <li className="rw">
                <div className="row">
                  <span className="dot d-a" />
                  <div><div className="nm">Andrei Pop <small>· Pop &amp; Co</small></div><div className="nt">{t("lp.demo.r2")}</div></div>
                  <div className="rt"><span className="tag tg-a" style={{ position: "static" }}>{t("lp.demo.tagDue")}</span></div>
                </div>
              </li>
              <li className="rw r3">
                <div className="row">
                  <span className="dot d-g" />
                  <div><div className="nm">Elena Radu <small>· Radu Design</small></div><div className="nt">{t("lp.demo.r3")}</div></div>
                  <div className="rt"><span className="tag tg-g" style={{ position: "static" }}>{t("lp.demo.tagDone")}</span></div>
                </div>
              </li>
            </ul>
          </div>
          <div className="dr">
            <div className="emp"><Mark className="" />{t("lp.demo.empty")}</div>
            <div className="dc">
              <div className="lb">{t("lp.demo.draft")}</div>
              <div className="who">{t("lp.demo.for")} Andrei Pop</div>
              <div className="tx">
                <span className="ty ty1">{t("lp.demo.d1")}</span>
                <span className="ty ty2">{t("lp.demo.d2")}</span>
                <span className="ty ty3">{t("lp.demo.d3")}</span>
              </div>
              <div className="mrow"><span className="mini p">{t("lp.demo.copy")}</span><span className="mini">{t("lp.demo.open")}</span></div>
              <div className="safe"><Lock width={14} height={14} />{t("lp.demo.safe")}</div>
            </div>
          </div>
          <div className="toast"><i><Check width={12} height={12} strokeWidth={3.4} color="#fff" /></i>{t("lp.demo.toast")}</div>
        </div>
      </div>
    </div>
  );
}
