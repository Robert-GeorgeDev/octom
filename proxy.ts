import { NextResponse, type NextRequest } from "next/server";
import { APP_HOST, hostName, redirectTarget } from "@/lib/hosts";
import { homeRedirect } from "@/lib/lang-route";

// Sends each page to its own address (public site vs. the OCTOM One app),
// and opens the home page in the visitor's language.
export function proxy(req: NextRequest) {
  const host = hostName(req.headers.get("host"));
  const target = redirectTarget(host, req.nextUrl.pathname, req.nextUrl.search);
  if (target) return NextResponse.redirect(target, 308);

  if (req.nextUrl.pathname === "/") {
    const to = homeRedirect(
      "/",
      req.cookies.get("octom-lang")?.value,
      req.headers.get("accept-language")
    );
    const res = to ? NextResponse.redirect(new URL(to, req.url), 307) : NextResponse.next();
    res.headers.set("Vary", "Accept-Language, Cookie");
    if (host === APP_HOST) res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  const res = NextResponse.next();
  // The app is for signed-in people, not for search engines.
  if (host === APP_HOST) res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
