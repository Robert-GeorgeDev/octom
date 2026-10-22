// Tells Bing, Yandex, Seznam, Naver and other IndexNow search engines which pages exist or changed.
// Reads the live sitemap, so run it after the site has been deployed.
//   node scripts/indexnow.mjs
const HOST = "octom.eu";
const KEY = "7da1391430ffbd675bc5a5e2755bc93b";

const sitemap = await fetch(`https://${HOST}/sitemap.xml`);
if (!sitemap.ok) throw new Error(`sitemap answered ${sitemap.status}`);
const urls = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (urls.length === 0) throw new Error("no URLs in the sitemap");

const res = await fetch("https://api.indexnow.org/IndexNow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
});
console.log(`IndexNow: sent ${urls.length} URLs, answer ${res.status}`);
if (res.status >= 400) process.exit(1);
