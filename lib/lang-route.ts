// Which address the home page should open at: "/" is English, "/ro" is Romanian.
// A saved choice (cookie "octom-lang") wins; otherwise the browser's first
// language decides. Search engines send no language, so they always get "/".

export function homeRedirect(
  pathname: string,
  cookie: string | undefined,
  acceptLanguage: string | null | undefined
): string | null {
  if (pathname !== "/") return null;
  if (cookie === "en") return null;
  if (cookie === "ro") return "/ro";
  const first = (acceptLanguage ?? "").split(",")[0]?.trim().toLowerCase() ?? "";
  return first === "ro" || first.startsWith("ro-") ? "/ro" : null;
}
