import { describe, expect, it } from "vitest";
import { dictionaries } from "@/lib/dictionaries";
import { whatsappDigits, whatsappHref } from "@/lib/contact-utils";
import { TEMPLATE_IDS, fillTemplate, greeting, hasBlanks } from "@/lib/templates";

describe("message templates", () => {
  it("has a Romanian and an English text for every situation", () => {
    for (const id of TEMPLATE_IDS) {
      for (const lang of ["ro", "en"] as const) {
        const b = fillTemplate(id, lang, { first_name: "Ana" });
        expect(b.text.length).toBeGreaterThan(40);
        expect(b.subject.length).toBeGreaterThan(3);
        expect(b.text).not.toContain("{");
      }
    }
  });

  it("greets by first name, or politely without one", () => {
    expect(greeting("ro", "Ana")).toBe("Bună, Ana,");
    expect(greeting("ro", "  ")).toBe("Bună ziua,");
    expect(greeting("en", "Ana")).toBe("Hi Ana,");
    expect(greeting("en", null)).toBe("Hello,");
  });

  it("keeps the brand voice: no exclamation marks, no absolute promises, no banned words", () => {
    const banned = /\b(never|always|100%|revolutionary|game-changer|supercharge|seamless|niciodată|mereu|întotdeauna)\b/i;
    for (const id of TEMPLATE_IDS) {
      for (const lang of ["ro", "en"] as const) {
        const { text, subject } = fillTemplate(id, lang, { first_name: "Ana" });
        expect(text + subject).not.toContain("!");
        expect(text + subject).not.toMatch(banned);
      }
    }
  });

  it("detects parts that still need filling in", () => {
    expect(hasBlanks(fillTemplate("invoice", "ro", { first_name: "Ana" }).text)).toBe(true);
    expect(hasBlanks(fillTemplate("offer", "ro", { first_name: "Ana" }).text)).toBe(false);
    expect(hasBlanks("Gata, trimit azi.")).toBe(false);
  });

  it("has a label for every situation in both languages", () => {
    for (const id of TEMPLATE_IDS) {
      for (const lang of ["ro", "en"] as const) {
        const d = dictionaries[lang] as Record<string, string>;
        expect(d[`tpl.n.${id}`]).toBeTruthy();
      }
    }
  });
});

describe("whatsapp link", () => {
  it("turns national Romanian numbers into international ones", () => {
    expect(whatsappDigits("0722 123 456")).toBe("40722123456");
    expect(whatsappDigits("+40 722 123 456")).toBe("40722123456");
    expect(whatsappDigits("0040722123456")).toBe("40722123456");
    expect(whatsappDigits("+40 (0)722 123 456")).toBe("40722123456");
  });
  it("keeps other international numbers", () => {
    expect(whatsappDigits("+44 20 7946 0958")).toBe("442079460958");
  });
  it("rejects numbers that are too short or too long", () => {
    expect(whatsappDigits("123")).toBe("");
    expect(whatsappDigits("")).toBe("");
    expect(whatsappDigits(null)).toBe("");
    expect(whatsappDigits("+1234567890123456")).toBe("");
  });
  it("adds the message text, encoded", () => {
    expect(whatsappHref("0722123456")).toBe("https://wa.me/40722123456");
    expect(whatsappHref("0722123456", "Bună, Ana & Ion")).toBe(
      "https://wa.me/40722123456?text=Bun%C4%83%2C%20Ana%20%26%20Ion"
    );
    expect(whatsappHref("abc", "x")).toBe("");
  });
});
