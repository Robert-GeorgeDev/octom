export type Command = { id: string; label: string; hint?: string; href: string; keywords?: string };

/** Lower case without accents, so "azi", "Ază" and "AZI" all match. */
export function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Every word typed must appear somewhere in the label or keywords. Earlier label matches come first. */
export function filterCommands(commands: Command[], query: string): Command[] {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return commands;
  const scored: { c: Command; rank: number; i: number }[] = [];
  commands.forEach((c, i) => {
    const label = normalize(c.label);
    const hay = `${label} ${normalize(c.keywords ?? "")}`;
    if (!tokens.every((tk) => hay.includes(tk))) return;
    scored.push({ c, rank: label.startsWith(tokens[0]) ? 0 : label.includes(tokens[0]) ? 1 : 2, i });
  });
  return scored.sort((a, b) => a.rank - b.rank || a.i - b.i).map((s) => s.c);
}

/** Text safe to put inside a PostgREST ilike filter: removes characters that act as syntax or wildcards. */
export function safeSearchText(q: string): string {
  return q.replace(/[,()%*_\\"']/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}
