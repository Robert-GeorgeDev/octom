"use client";

import Link from "next/link";
import {
  ArrowRight, Bell, Briefcase, CalendarDays, Check, Download, FileText, Lock, Minus, Server,
  Sun, Trash2, UserPlus, User, Users, type LucideIcon,
} from "lucide-react";
import Logo from "@/components/logo";
import Mascot from "@/components/mascot";
import LanguageSwitcher from "@/components/language-switcher";
import HeroDemo from "@/components/hero-demo";
import ScrollProgress from "@/components/scroll-progress";
import { CookieSettingsButton } from "@/components/consent";
import AnpcSal from "@/components/anpc-sal";
import { useLanguage } from "@/components/language-provider";
import SocialLinks from "@/components/social-links";
import type { Key } from "@/lib/dictionaries";
import "./landing.css";

const mq = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => `lp.mq.${n}` as Key);

const steps: { Icon: LucideIcon; title: Key; text: Key }[] = [
  { Icon: UserPlus, title: "landing.s1.title", text: "landing.s1.text" },
  { Icon: CalendarDays, title: "landing.s2.title", text: "landing.s2.text" },
  { Icon: Sun, title: "landing.s3.title", text: "landing.s3.text" },
];

const rows: { label: Key; a: Key; b: Key }[] = [
  { label: "lp.cmp.r1", a: "lp.cmp.r1a", b: "lp.cmp.r1b" },
  { label: "lp.cmp.r2", a: "lp.cmp.r2a", b: "lp.cmp.r2b" },
  { label: "lp.cmp.r3", a: "lp.cmp.r3a", b: "lp.cmp.r3b" },
  { label: "lp.cmp.r4", a: "lp.cmp.r4a", b: "lp.cmp.r4b" },
  { label: "lp.cmp.r5", a: "lp.cmp.r5a", b: "lp.cmp.r5b" },
];

const who: { Icon: LucideIcon; title: Key; text: Key }[] = [
  { Icon: User, title: "lp.who.1t", text: "lp.who.1p" },
  { Icon: Users, title: "lp.who.2t", text: "lp.who.2p" },
  { Icon: Briefcase, title: "lp.who.3t", text: "lp.who.3p" },
];

const privacy: { Icon: LucideIcon; text: Key }[] = [
  { Icon: Server, text: "land.sec.1" },
  { Icon: Download, text: "land.sec.2" },
  { Icon: Trash2, text: "land.sec.3" },
  { Icon: Lock, text: "land.sec.4" },
];

const plans: { name: Key; line: Key; price: string; feats: Key[]; slug: "free" | "pro" | "business"; pick: boolean }[] = [
  { name: "plans.free", line: "site.plan.free", price: "0", slug: "free", pick: false, feats: ["plans.free.f1", "plans.free.f2", "plans.free.f3", "plans.free.f4", "plans.free.f5"] },
  { name: "plans.pro", line: "site.plan.pro", price: "7.99", slug: "pro", pick: true, feats: ["plans.pro.f1", "plans.pro.f2", "plans.pro.f3", "plans.pro.f4"] },
  { name: "plans.business", line: "site.plan.business", price: "14.99", slug: "business", pick: false, feats: ["plans.business.f1", "plans.business.f2", "plans.business.f3"] },
];

const faq: { q: Key; a: Key }[] = [
  { q: "land.q1", a: "land.a1" }, { q: "land.q2", a: "land.a2" }, { q: "land.q3", a: "land.a3" },
  { q: "land.q4", a: "land.a4" }, { q: "land.q5", a: "land.a5" }, { q: "land.q6", a: "land.a6" },
];

const tick = <Check className="tk" strokeWidth={2.8} aria-hidden="true" />;

function Lines({ text }: { text: string }) {
  const parts = text.split("\n");
  return <>{parts.map((p, i) => (<span key={i}>{p}{i < parts.length - 1 && <br />}</span>))}</>;
}

export default function Home() {
  const { t, lang } = useLanguage();
  const year = new Date().getFullYear();
  const [h1a, h1b] = t("landing.title").split("\n");

  return (
    <div className="lp">
      <header className="hd">
        <div className="wrap hdin">
          <Link className="brandlink" href="/" aria-label="OCTOM One"><Logo light /></Link>
          <nav className="nav" aria-label="Main">
            <a href="#product">{t("lp.nav.product")}</a>
            <a href="#how">{t("lp.nav.how")}</a>
            <a href="#compare">{t("lp.nav.compare")}</a>
            <a href="#pricing">{t("land.nav.pricing")}</a>
            <a href="#faq">{t("land.nav.faq")}</a>
          </nav>
          <div className="hdr">
            <LanguageSwitcher />
            <Link className="lnk" href="/login">{t("landing.login")}</Link>
            <Link className="btn btn-p" href="/signup">{t("landing.cta")}</Link>
          </div>
        </div>
        <ScrollProgress />
      </header>

      <main>
        <section className="hero" id="top">
          <div className="wrap herogrid">
            <div className="herotxt">
              <span className="pill"><i />{t("lp.hero.pill")}</span>
              <h1 className="h1">{h1a}<br /><em>{h1b}</em></h1>
              <p className="sub">{t("lp.hero.sub")}</p>
              <div className="cta">
                <Link className="btn btn-p" href="/signup">{t("landing.cta")} <ArrowRight width={18} height={18} aria-hidden="true" /></Link>
                <a className="btn btn-g" href="#product">{t("lp.hero.cta2")}</a>
              </div>
              <div className="tr">
                {(["lp.trust.1", "lp.trust.2", "lp.trust.3", "lp.trust.4"] as Key[]).map((k) => (
                  <span key={k}>{tick}{t(k)}</span>
                ))}
              </div>
            </div>
            <div className="hm" aria-hidden="true">
              <Mascot wave />
              <span className="bubble">{t("lp.hero.bubble")}</span>
            </div>
          </div>
          <div className="wrap">
            <HeroDemo />
          </div>
        </section>

        <section className="mq" aria-label={t("lp.mq.title")}>
          <div className="mqh">{t("lp.mq.title")}</div>
          <div className="mqt" aria-hidden="true">
            {[0, 1].map((g) => (
              <div className="mqg" key={g}>{mq.map((k) => (<span className="mqi" key={k}>{t(k)}</span>))}</div>
            ))}
          </div>
        </section>

        <section className="sec dark" id="problem">
          <div className="wrap cen">
            <span className="eyebrow">{t("lp.prob.eyebrow")}</span>
            <h2 className="h2" style={{ maxWidth: 820, marginLeft: "auto", marginRight: "auto" }}><Lines text={t("lp.prob.title")} /></h2>
            <p className="lead">{t("lp.prob.lead")}</p>
            <div className="tl" aria-hidden="true">
              <div className="tlline"><div className="tlfill" /></div>
              <div className="st"><span className="nd">{t("lp.tl.d1")}</span><div className="sc"><b>{t("lp.tl.1t")}</b>{t("lp.tl.1p")}</div></div>
              <div className="st s1"><span className="nd">{t("lp.tl.d2")}</span><div className="sc"><b>{t("lp.tl.2t")}</b>{t("lp.tl.2p")}</div></div>
              <div className="st s2"><span className="nd">{t("lp.tl.d3")}</span><div className="sc"><b>…</b>{t("lp.tl.3p")}</div></div>
              <div className="st s3"><span className="nd">{t("lp.tl.d4")}</span><div className="sc"><b>…</b>{t("lp.tl.4p")}</div></div>
              <div className="st s4"><span className="nd">{t("lp.tl.d5")}</span><div className="sc"><Bell className="bell" aria-hidden="true" />{t("lp.tl.5p")}</div></div>
            </div>
            <div className="chips">
              <span>{t("lp.prob.c1")}</span><span>{t("lp.prob.c2")}</span><span>{t("lp.prob.c3")}</span>
            </div>
          </div>
        </section>

        <section className="sec gray" id="product">
          <div className="wrap">
            <div className="cen">
              <span className="eyebrow">{t("lp.prod.eyebrow")}</span>
              <h2 className="h2">{t("lp.prod.title")}</h2>
              <p className="lead">{t("lp.prod.lead")}</p>
            </div>
            <div className="bn">
              <div className="bc dk s7">
                <h3 className="bt">{t("lp.b1.t")}</h3><p className="bp">{t("lp.b1.p")}</p>
                <div className="bv" aria-hidden="true">
                  <div className="mr hot"><span className="dot d-r" /><b>Marian Dobre</b><span className="pl" style={{ background: "#FEE2E2", color: "#991B1B" }}>{t("lp.b1.late")}</span></div>
                  <div className="mr"><span className="dot d-a" /><b>Maria Ionescu</b><span className="pl" style={{ background: "#FFF1D6", color: "#8A4B00" }}>{t("lp.demo.tagDue")}</span></div>
                  <div className="mr"><span className="dot" style={{ background: "#94A3B8" }} /><b>Elena Radu</b><span className="pl" style={{ background: "#E2E8F0", color: "#334155" }}>{t("lp.b1.thu")}</span></div>
                </div>
              </div>
              <div className="bc s5">
                <h3 className="bt">{t("lp.b2.t")}</h3><p className="bp">{t("lp.b2.p")}</p>
                <div className="bv" aria-hidden="true"><div className="chs"><span className="ch">{t("card.tomorrow")}</span><span className="ch">{t("card.nextWeek")}</span><span className="ch">{t("card.pickDate")}</span></div></div>
              </div>
              <div className="bc s4c">
                <h3 className="bt">{t("lp.b3.t")}</h3><p className="bp">{t("lp.b3.p")}</p>
                <div className="bv" style={{ marginTop: 18 }} aria-hidden="true">
                  <div className="hi"><i />{t("site.hist.1")}</div><div className="hi"><i />{t("site.hist.2")}</div><div className="hi"><i />{t("site.hist.3")}</div>
                </div>
              </div>
              <div className="bc s4c">
                <h3 className="bt">{t("lp.b4.t")}</h3><p className="bp">{t("lp.b4.p")}</p>
                <div className="bv" aria-hidden="true">
                  <div className="pvs">
                    <span className="pv" style={{ background: "#E2E8F0", color: "#334155" }}>{t("lp.st.1")}</span>
                    <span className="pv" style={{ background: "#E0E7FF", color: "#3730A3" }}>{t("lp.st.2")}</span>
                    <span className="pv" style={{ background: "#FFF1D6", color: "#8A4B00" }}>{t("lp.st.3")}</span>
                    <span className="pv" style={{ background: "#DDF5EA", color: "#0F6B49" }}>{t("lp.st.4")}</span>
                  </div>
                  <div className="dts"><i /><i /><i /><i /></div>
                </div>
              </div>
              <div className="bc s4c">
                <h3 className="bt">{t("lp.b5.t")}</h3><p className="bp">{t("lp.b5.p")}</p>
                <div className="bv" aria-hidden="true">
                  <div className="fl"><FileText width={22} height={22} />clients.csv</div>
                  <div className="pbar"><div className="pf" /></div>
                  <div className="okk">{t("lp.b5.ok")}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec" id="how">
          <div className="wrap cen">
            <span className="eyebrow">{t("lp.how.eyebrow")}</span>
            <h2 className="h2">{t("lp.how.title")}</h2>
            <div className="hw">
              <div className="hline" aria-hidden="true"><span className="hdot" /></div>
              {steps.map(({ Icon, title, text }, i) => (
                <div className="hs" key={title}>
                  <div className="ic"><Icon aria-hidden="true" color="#fff" strokeWidth={2} /></div>
                  <div className="hn">{t("landing.step").toUpperCase()} {i + 1}</div>
                  <h3 className="ht">{t(title)}</h3>
                  <p className="hp">{t(text)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sec gray" id="compare">
          <div className="wrap">
            <div className="cen">
              <span className="eyebrow">{t("lp.cmp.eyebrow")}</span>
              <h2 className="h2">{t("lp.cmp.title")}</h2>
              <p className="lead">{t("lp.cmp.lead")}</p>
            </div>
            <div className="cmp"><div className="sx"><table>
              <thead><tr><th scope="col">{t("lp.cmp.c0")}</th><th scope="col">{t("lp.cmp.c1")}</th><th scope="col" className="o">{t("lp.cmp.c2")}</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label}>
                    <th scope="row">{t(r.label)}</th>
                    <td><span className="no"><Minus aria-hidden="true" strokeWidth={2.4} />{t(r.a)}</span></td>
                    <td className="o"><span className="yes"><Check aria-hidden="true" strokeWidth={2.8} />{t(r.b)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table></div></div>
            <p className="cn cen">{t("lp.cmp.note")}</p>
          </div>
        </section>

        <section className="sec dark" id="ai">
          <div className="wrap aig">
            <div>
              <span className="eyebrow">{t("lp.ai.eyebrow")}</span>
              <h2 className="h2"><Lines text={t("lp.ai.title")} /></h2>
              <p className="lead">{t("lp.ai.lead")}</p>
              <ul className="facts">
                {(["lp.ai.f1", "lp.ai.f2", "lp.ai.f3"] as Key[]).map((k) => (<li key={k}><Check aria-hidden="true" strokeWidth={2.6} color="#A5B4FC" />{t(k)}</li>))}
              </ul>
            </div>
            <div className="aic" aria-hidden="true">
              <div className="abil"><span>{t("lp.ai.a1")}</span><span>{t("lp.ai.a2")}</span><span>{t("lp.ai.a3")}</span></div>
              <div className="lb" style={{ marginTop: 14 }}>{t("lp.demo.draft")}</div>
              <div className="who">{t("lp.demo.for")} Maria Ionescu</div>
              <div className="tx"><span className="ty t1">{t("lp.ai.d1")}</span><span className="ty t2">{t("lp.ai.d2")}</span><span className="ty t3">{t("lp.ai.d3")}</span></div>
              <div className="mrow"><span className="mini p">{t("lp.demo.copy")}</span><span className="mini">{t("lp.demo.open")}</span><span className="mini">{t("lp.demo.rewrite")}</span></div>
              <div className="safe"><Lock width={14} height={14} />{t("lp.ai.safe")}</div>
            </div>
          </div>
        </section>

        <section className="sec" id="team">
          <div className="wrap two">
            <div>
              <span className="eyebrow">{t("lp.team.eyebrow")}</span>
              <h2 className="h2">{t("lp.team.title")}</h2>
              <p className="lead">{t("lp.team.lead")}</p>
              {(["lp.team.p1", "lp.team.p2", "lp.team.p3"] as Key[]).map((k) => (<div className="ck" key={k}><Check aria-hidden="true" strokeWidth={2.6} color="#4F46E5" />{t(k)}</div>))}
            </div>
            <div className="tcard" aria-hidden="true">
              <div className="tg"><div className="sl" /><span>{t("lp.team.mine")}</span><span>{t("lp.team.all")}</span></div>
              <div className="tlist">
                <div className="lst l1">
                  <div className="trw"><span className="av" style={{ background: "#E2E8F0" }}>T</span><b>Maria Ionescu</b><span className="pl">{t("lp.team.you")}</span></div>
                  <div className="trw"><span className="av" style={{ background: "#E2E8F0" }}>T</span><b>Andrei Pop</b><span className="pl">{t("lp.team.you")}</span></div>
                </div>
                <div className="lst l2">
                  <div className="trw"><span className="av" style={{ background: "#E2E8F0" }}>T</span><b>Maria Ionescu</b><span className="pl">{t("lp.team.you")}</span></div>
                  <div className="trw"><span className="av" style={{ background: "#E2E8F0" }}>I</span><b>Andrei Pop</b><span className="pl">Ioana</span></div>
                  <div className="trw"><span className="av" style={{ background: "#E2E8F0" }}>R</span><b>Elena Radu</b><span className="pl">Radu</span></div>
                  <div className="trw"><span className="av" style={{ background: "#E2E8F0" }}>I</span><b>Marian Dobre</b><span className="pl">Ioana</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec gray" id="who">
          <div className="wrap">
            <div className="cen"><span className="eyebrow">{t("lp.who.eyebrow")}</span><h2 className="h2">{t("lp.who.title")}</h2></div>
            <div className="who3">
              {who.map(({ Icon, title, text }) => (
                <div className="wc" key={title}>
                  <div className="wi"><Icon aria-hidden="true" color="#fff" strokeWidth={2} /></div>
                  <h3>{t(title)}</h3><p>{t(text)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sec" id="privacy">
          <div className="wrap">
            <h2 className="h2">{t("land.security.title")}</h2>
            <p className="lead">{t("site.priv.lead")}</p>
            <div className="pvg">
              {privacy.map(({ Icon, text }) => (
                <div className="pt" key={text}>
                  <div className="pi"><Icon aria-hidden="true" color="#0B1026" strokeWidth={2} /></div>
                  <p>{t(text)}</p>
                </div>
              ))}
            </div>
            <Link className="lnk2" href="/privacy">{t("land.sec.link")} <ArrowRight width={16} height={16} aria-hidden="true" /></Link>
          </div>
        </section>

        <section className="sec gray" id="pricing">
          <div className="wrap cen">
            <span className="eyebrow">{t("land.nav.pricing")}</span>
            <h2 className="h2">{t("land.pricing.title")}</h2>
            <p className="lead">{t("site.pricing.sub")}</p>
            <span className="beta">{t("site.beta")}</span>
            <div className="pg3" style={{ textAlign: "left" }}>
              {plans.map((p) => (
                <div key={p.name} className={`pc${p.pick ? " pro" : ""}`}>
                  {p.pick && <span className="badge">{t("site.plan.recommended")}</span>}
                  <div className="pn1">{t(p.name)}</div>
                  <div className="pl1">{t(p.line)}</div>
                  <div className="pr">€{p.price} <small>{t("plans.perMonth")}</small></div>
                  <ul className="pf1">
                    {p.feats.map((f) => (<li key={f}><Check aria-hidden="true" strokeWidth={2.6} color="#4F46E5" />{t(f)}</li>))}
                  </ul>
                  {p.slug === "free" ? (
                    <Link className="btn btn-k" href="/signup">{t("landing.cta")}</Link>
                  ) : (
                    <Link className={`btn ${p.pick ? "btn-p" : "btn-g"}`} href={`/signup?plan=${p.slug}`}>
                      {t("site.plan.choose").replace("{name}", t(p.name))}
                    </Link>
                  )}
                </div>
              ))}
            </div>
            <p className="plnote">{t("plans.betaNote")}</p>
          </div>
        </section>

        <section className="sec" id="faq">
          <div className="wrap">
            <div className="cen"><span className="eyebrow">{t("land.nav.faq")}</span><h2 className="h2">{t("land.faq.title")}</h2></div>
            <div className="fq">
              {faq.map(({ q, a }) => (
                <details key={q}>
                  <summary>{t(q)}<span className="pls" aria-hidden="true">+</span></summary>
                  <p>{t(a)}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="sec dark end">
          <div className="wrap endg">
            <div>
              <h2 className="h2" style={{ fontSize: "clamp(36px, 6vw, 56px)", color: "#fff" }}>{t("lp.final.title")}</h2>
              <p>{t("lp.final.text")}</p>
              <div className="endcta">
                <Link className="btn btn-p" href="/signup">{t("landing.cta")} <ArrowRight width={18} height={18} aria-hidden="true" /></Link>
                <span>{t("lp.final.note")}</span>
              </div>
            </div>
            <div className="bigm" aria-hidden="true"><Mascot wave /></div>
          </div>
        </section>
      </main>

      <footer className="ft">
        <div className="wrap ftg">
          <div>
            <Logo light />
            <p className="ftcopy">© {year} Octom. {t("site.footer.rights")}</p>
            <SocialLinks variant="dark" className="mt-5" />
            <AnpcSal className="mt-5" />
          </div>
          <div className="ftc">
            <div>
              <b>{t("site.footer.product")}</b>
              <a href="#product">{t("lp.nav.product")}</a>
              <a href="#pricing">{t("land.nav.pricing")}</a>
              <a href="#faq">{t("land.nav.faq")}</a>
              <Link href="/docs">{lang === "ro" ? "Documentație" : "Documentation"}</Link>
              <Link href="/status">Status</Link>
            </div>
            <div>
              <b>{t("site.footer.legal")}</b>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/cookies">Cookies</Link>
              <CookieSettingsButton className="text-left" />
              <Link href="/refunds">Refunds</Link>
              <Link href="/subprocessors">Subprocessors</Link>
              <Link href="/security">Security</Link>
              <Link href="/accessibility">Accessibility</Link>
              <Link href="/company">Company</Link>
              <Link href="/contact">{t("site.footer.contact")}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
