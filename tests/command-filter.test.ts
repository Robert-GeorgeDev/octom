import { describe, expect, it } from "vitest";
import { filterCommands, normalize, safeSearchText, type Command } from "@/lib/command-filter";

const cmds: Command[] = [
  { id: "today", label: "Azi", href: "/today", keywords: "today azi" },
  { id: "contacts", label: "Contacte", href: "/contacts", keywords: "contacts clienti" },
  { id: "new", label: "Adaugă follow-up", href: "/followups/new", keywords: "new add adauga" },
  { id: "data", label: "Date", href: "/data", keywords: "export import csv" },
];

describe("normalize", () => {
  it("drops accents and case, also Romanian cedilla forms", () => {
    expect(normalize("Ădăugă ȘȚ şţ")).toBe("adauga st st");
  });
});

describe("filterCommands", () => {
  it("returns everything for an empty query", () => {
    expect(filterCommands(cmds, "  ")).toEqual(cmds);
  });
  it("matches without accents and by keywords", () => {
    expect(filterCommands(cmds, "adauga").map((c) => c.id)).toEqual(["new"]);
    expect(filterCommands(cmds, "csv").map((c) => c.id)).toEqual(["data"]);
    expect(filterCommands(cmds, "TODAY").map((c) => c.id)).toEqual(["today"]);
  });
  it("needs every typed word to match", () => {
    expect(filterCommands(cmds, "add follow").map((c) => c.id)).toEqual(["new"]);
    expect(filterCommands(cmds, "add zzz")).toEqual([]);
  });
  it("puts labels that start with the text first", () => {
    const out = filterCommands(
      [
        { id: "b", label: "Raport date", href: "/b" },
        { id: "a", label: "Date", href: "/a" },
      ],
      "date"
    );
    expect(out.map((c) => c.id)).toEqual(["a", "b"]);
  });
});

describe("safeSearchText", () => {
  it("removes characters that would break or widen a database filter", () => {
    expect(safeSearchText("a,b(c)%d*e_f\\g\"h'i")).toBe("a b c d e f g h i");
  });
  it("trims and limits the length", () => {
    expect(safeSearchText("  hello   world  ")).toBe("hello world");
    expect(safeSearchText("x".repeat(200)).length).toBe(60);
  });
});
