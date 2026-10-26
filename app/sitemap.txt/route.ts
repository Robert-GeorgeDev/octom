import sitemap from "@/app/sitemap";

export const dynamic = "force-static";

// The same pages as /sitemap.xml, as a plain list (one address per line).
// A backup for search engines that cannot read the XML one; both are listed in robots.txt.
export function GET() {
  const body = sitemap().map((e) => e.url).join("\n") + "\n";
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=0, must-revalidate" },
  });
}
