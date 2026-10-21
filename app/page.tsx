"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
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

const steps: { title: Key; text: Key }[] = [
  { title: "landing.s1.title", text: "landing.s1.text" },
  { title: "landing.s2.title", text: "landing.s2.text" },
  { title: "landing.s3.title", text: "landing.s3.text" },
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

        <section className="sec" id="problem">
          <div className="wrap cen">
            <span className="eyebrow">{t("lp.prob.eyebrow")}</span>
            <h2 className="h2" style={{ maxWidth: 820, marginLeft: "auto", marginRight: "auto" }}><Lines text={t("lp.prob.title")} /></h2>
            <p className="lead">{t("lp.prob.lead")}</p>
            <div className="pchips">
              <span>{t("lp.prob.c1")}</span><span>{t("lp.prob.c2")}</span><span>{t("lp.prob.c3")}</span>
            </div>
          </div>
        </section>

        <section className="sec gray" id="product">
          <div className="wrap">
            <div className="cen">
              <span className="eyebrow">{t("lp.prod.eyebrow")}</span>
              <h2 className="h2">{t("lp2.prod.title")}</h2>
              <p className="lead">{t("lp2.prod.lead")}</p>
            </div>

            <div className="fr">
              <div className="ft1">
                <span className="fn">01</span>
                <h3 className="bt">{t("lp.b1.t")}</h3><p className="bp">{t("lp.b1.p")}</p>
              </div>
              <div className="fv" aria-hidden="true">
                <div className="mr hot"><span className="dot d-r" /><b>Marian Dobre</b><span className="pl" style={{ background: "#FEE2E2", color: "#991B1B" }}>{t("lp.b1.late")}</span></div>
                <div className="mr"><span className="dot d-a" /><b>Maria Ionescu</b><span className="pl" style={{ background: "#FFF1D6", color: "#8A4B00" }}>{t("lp.demo.tagDue")}</span></div>
                <div className="mr"><span className="dot" style={{ background: "#94A3B8" }} /><b>Elena Radu</b><span className="pl" style={{ background: "#E2E8F0", color: "#334155" }}>{t("lp.b1.thu")}</span></div>
              </div>
            </div>

            <div className="fr rev">
              <div className="ft1">
                <span className="fn">02</span>
                <h3 className="bt">{t("lp.b3.t")}</h3><p className="bp">{t("lp.b3.p")}</p>
              </div>
              <div className="fv" aria-hidden="true">
                <div className="hi"><i />{t("site.hist.1")}</div><div className="hi"><i />{t("site.hist.2")}</div><div className="hi"><i />{t("site.hist.3")}</div>
              </div>
            </div>

            <div className="fr">
              <div className="ft1">
                <span className="fn">03</span>
                <h3 className="bt">{t("lp.b2.t")}</h3><p className="bp">{t("lp.b2.p")}</p>
              </div>
              <div className="fv" aria-hidden="true">
                <div className="chs"><span className="ch">{t("card.tomorrow")}</span><span className="ch">{t("card.nextWeek")}</span><span className="ch">{t("card.pickDate")}</span></div>
              </div>
            </div>

            <div className="inc">
              <h3 className="inch">{t("lp2.inc.title")}</h3>
              <ul>
                {(["ai", "team", "csv", "eu"] as const).map((k) => (
                  <li key={k}><b>{t(`lp2.inc.${k}.t` as Key)}</b><span>{t(`lp2.inc.${k}.p` as Key)}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="sec" id="how">
          <div className="wrap cen">
            <span className="eyebrow">{t("lp.how.eyebrow")}</span>
            <h2 className="h2">{t("lp.how.title")}</h2>
            <ol className="hw2">
              {steps.map(({ title, text }, i) => (
                <li key={title}>
                  <span className="num">{i + 1}</span>
                  <h3 className="ht">{t(title)}</h3>
                  <p className="hp">{t(text)}</p>
                </li>
              ))}
            </ol>
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

            <h2 className="h3faq" id="faq">{t("land.faq.title")}</h2>
            <div className="fq" style={{ textAlign: "left" }}>
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
