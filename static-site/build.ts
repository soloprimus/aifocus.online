// Builds the static preview of AIFocus into static-site/dist: the pages that need no database (home, the
// chain map, about with the source list) and placeholders at the addresses the full site will use for
// the feeds and reports (/all, /hot, /daily). Cloudflare Pages serves dist/ until the full site runs on a
// server; the domain then moves to the Cloudflare Tunnel (README, 部署到 aifocus.online).
//   node static-site/build.ts
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { CHAIN_LAYERS, TOPIC_GROUPS } from "../industry/chain.ts";
import { ABOUT, SITE, withSubject } from "../industry/site.ts";
import { CATEGORIES } from "../industry/taxonomy.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(import.meta.dirname, "dist");
const ORIGIN = "https://aifocus.online";

interface Topic {
  slug: string;
  name: string;
  group: string;
  definition: string;
}
interface Source {
  name: string;
  config: { feedUrl?: string };
  tier: string;
  tags: string[];
}

const { topics } = JSON.parse(await readFile(path.join(ROOT, "industry/topics.json"), "utf8")) as { topics: Topic[] };
const { sources } = JSON.parse(await readFile(path.join(ROOT, "industry/sources.json"), "utf8")) as { sources: Source[] };
const bySlug = new Map(topics.map((t) => [t.slug, t]));
const inGroup = (group: string) => topics.filter((t) => t.group === group);
const firstParty = sources.filter((s) => s.tier === "T1");
const media = sources.filter((s) => s.tier !== "T1");

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = (text: string) => text.replace(/[&<>"']/g, (c) => ESCAPES[c]!);

// ── Shared chrome ───────────────────────────────────────────────────────────────────────

const NAV = [
  { key: "home", href: "/", label: "首页", soon: false },
  { key: "topics", href: "/topics/", label: "产业链地图", soon: false },
  { key: "daily", href: "/daily/", label: withSubject("日报"), soon: true },
  { key: "hot", href: "/hot/", label: "热点榜", soon: true },
  { key: "all", href: "/all/", label: "全部动态", soon: true },
  { key: "about", href: "/about/", label: "关于", soon: false },
] as const;

interface Page {
  path: string;
  /** Null: the home page, titled SITE.homeTitle. */
  title: string | null;
  description: string;
  nav: (typeof NAV)[number]["key"] | null;
  body: string;
  /** Placeholders stay out of search results until the real page replaces them. */
  noindex?: boolean;
}

function layout(page: Page, stylesheet: string): string {
  const title = page.title ? `${page.title} · ${SITE.name}` : SITE.homeTitle;
  const url = ORIGIN + page.path;
  const nav = NAV.map((n) => {
    const current = n.key === page.nav ? ' aria-current="page"' : "";
    const soon = n.soon ? '<span class="soon">即将上线</span>' : "";
    return `<a href="${n.href}"${current}>${esc(n.label)}${soon}</a>`;
  }).join("");
  const [credit, disclaimer] = SITE.footerNote.split(" · ");
  return `<!doctype html>
<html lang="${SITE.locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="${url}">
${page.noindex ? '<meta name="robots" content="noindex">\n' : ""}<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:locale" content="zh_CN">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ORIGIN}/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#faf9f6" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#13191c" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/logo.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="/${stylesheet}">
</head>
<body>
<header class="site-header">
<div class="wrap">
<a class="brand" href="/" aria-label="${esc(SITE.name)} 首页">${esc(SITE.name)}</a>
<nav class="nav" aria-label="主导航">${nav}</nav>
<span class="header-note">预览版</span>
</div>
</header>
<main class="wrap">
${page.body}
</main>
<footer class="site-footer">
<div class="wrap">
<p>© ${new Date().getFullYear()} ${esc(SITE.name)} · ${esc(SITE.tagline)}</p>
<p class="links"><a href="/topics/">产业链地图</a><a href="/about/#sources">信源</a><a href="/about/">关于</a><a href="https://github.com/KKKKhazix/AIHOT" rel="noopener">${esc(credit ?? SITE.footerNote)}</a>${disclaimer ? `<span>${esc(disclaimer)}</span>` : ""}</p>
</div>
</footer>
</body>
</html>
`;
}

// ── Pieces ──────────────────────────────────────────────────────────────────────────────

const STEPS = [
  ["01", "采集", ABOUT.steps.collect],
  ["02", "收录", ABOUT.steps.store],
  ["03", "精选", ABOUT.steps.select],
  ["04", "成刊", ABOUT.steps.publish],
] as const;

const steps = () =>
  `<ol class="grid grid-4">${STEPS.map(([no, name, text]) => `<li class="card step"><div class="step-no mono">${no}</div><h3>${name}</h3><p>${esc(text)}</p></li>`).join("")}</ol>`;

const lead = ABOUT.lead.replace("{sources}", String(sources.length));
const status = (live: boolean) => (live ? '<span class="status status-live">已上线</span>' : '<span class="status status-soon">即将上线</span>');
const topicCard = (t: Topic) => `<div class="card topic"><h4>${esc(t.name)}</h4><p>${esc(t.definition)}</p></div>`;
const sections = [...new Set(CATEGORIES.map((c) => c.section))];

function sourceList(list: Source[], drop: string): string {
  return `<ul class="source-list">${list
    .map((s) => {
      const site = new URL(s.config.feedUrl ?? ORIGIN).origin;
      const tags = s.tags.filter((t) => t !== drop).map((t) => `<span class="chip">${esc(t)}</span>`).join("");
      return `<li><span class="name">${esc(s.name)}</span><a class="host" href="${site}" rel="noopener">${esc(new URL(site).host.replace(/^www\./, ""))}</a><span class="tags">${tags}</span></li>`;
    })
    .join("")}</ul>`;
}

// ── Pages ───────────────────────────────────────────────────────────────────────────────

const FEATURES = [
  { name: "产业链地图", live: true, href: "/topics/", text: `${topics.length} 个主题：${inGroup("field").length} 个产业链环节、${inGroup("company").length} 家公司、${inGroup("genre").length} 种事件类型。` },
  { name: "信源名单", live: true, href: "/about/#sources", text: `${sources.length} 个信源：芯片与云厂商的官方一手发布 ${firstParty.length} 个，半导体、数据中心、商业媒体与分析师 ${media.length} 个。` },
  { name: "今日精选", live: false, href: "/", text: "两次独立评分都过门槛的资料：中文标题、答案先行的摘要和推荐理由，同一件事只出现一次。" },
  { name: "热点榜", live: false, href: "/hot/", text: "过去 48 小时讨论最多的事件，按独立来源数计算热度，一家媒体发十篇也只算一次。" },
  { name: withSubject("日报"), live: false, href: "/daily/", text: `每天 08:00 出刊，按${sections.slice(0, 6).join("、")}分节；周一出周报，每月 1 日出月报。` },
  { name: "全部动态 · RSS · API · MCP", live: false, href: "/all/", text: "所有信源的最新动态，可筛选、可搜索；同一份内容通过 RSS、公开 API 和 MCP 提供给阅读器与 Agent。" },
];

const home: Page = {
  path: "/",
  title: null,
  description: SITE.description,
  nav: "home",
  body: `<section class="hero">
<div class="kicker">AI 产业链精选 · 预览版</div>
<h1>${esc(ABOUT.headline[0])}<span class="accent">${esc(ABOUT.headline[1])}</span></h1>
<p class="lead">${esc(lead)}</p>
<div class="actions"><a class="button button-primary" href="/topics/">看产业链地图 →</a><a class="button" href="/about/">了解 ${esc(SITE.name)}</a></div>
</section>
<section class="section" aria-labelledby="progress">
<div class="section-head"><h2 id="progress">上线进度</h2><p>精选、热点和日报需要后台持续抓取和模型评选，正在准备中</p></div>
<ul class="grid grid-3">${FEATURES.map((f) => `<li><a class="card feature" href="${f.href}"><div class="feature-top"><h3>${esc(f.name)}</h3>${status(f.live)}</div><p>${esc(f.text)}</p></a></li>`).join("")}</ul>
</section>
<section class="section" aria-labelledby="chain">
<div class="section-head"><h2 id="chain">产业链地图</h2><p>从上游芯片到下游应用，逐环追踪</p><a class="more" href="/topics/">完整地图 →</a></div>
<div class="card panel"><ol class="layer-rows">${CHAIN_LAYERS.map(
    (l, i) =>
      `<li><span class="layer-no">${i + 1}</span><h3>${esc(l.name)}</h3><div class="chips">${l.topics
        .flatMap((slug) => bySlug.get(slug) ?? [])
        .map((t) => `<a class="chip" href="/topics/#chain-${l.key}">${esc(t.name)}</a>`)
        .join("")}</div></li>`,
  ).join("")}</ol></div>
</section>
<section class="section" aria-labelledby="how">
<div class="section-head"><h2 id="how">怎么选</h2><p>每条资料都走同样的四步</p></div>
${steps()}
</section>`,
};

const topicsPage: Page = {
  path: "/topics/",
  title: "产业链地图",
  description: "按 AI 产业链浏览：上游芯片与半导体、中游算力与基础设施、模型层、下游应用与终端，以及贯穿全链的资本与政策；另有公司与事件类型主题。",
  nav: "topics",
  body: `<div class="page-head"><h1>AI 产业链地图</h1><p>从上游芯片到下游应用，按产业链环节、公司与事件类型整理的 <span class="num">${topics.length}</span> 个主题。精选上线后，每个主题都会汇集自己的精选与动态。</p></div>
${TOPIC_GROUPS.map((g) => {
  const head = `<div class="section-head"><h2 id="group-${g.key}">${esc(g.name)}</h2><p>${esc(g.blurb)}</p></div>`;
  if (g.key !== "field") return `<section class="section" aria-labelledby="group-${g.key}">${head}<div class="grid grid-4">${inGroup(g.key).map(topicCard).join("")}</div></section>`;
  const jump = CHAIN_LAYERS.map((l, i) => `${i ? '<span class="arrow" aria-hidden="true">→</span>' : ""}<a class="chip" href="#chain-${l.key}">${esc(l.name.split(" · ")[0]!)}</a>`).join("");
  const layers = CHAIN_LAYERS.map(
    (l, i) =>
      `<li id="chain-${l.key}"><span class="layer-no" aria-hidden="true">${i + 1}</span><div><h3>${esc(l.name)}</h3><p class="layer-blurb">${esc(l.blurb)}</p></div><div class="grid grid-3">${l.topics
        .flatMap((slug) => bySlug.get(slug) ?? [])
        .map(topicCard)
        .join("")}</div></li>`,
  ).join("");
  return `<section class="section" aria-labelledby="group-${g.key}">${head}<nav class="jump" aria-label="产业链层级">${jump}</nav><ol class="chain">${layers}</ol></section>`;
}).join("\n")}`,
};

const about: Page = {
  path: "/about/",
  title: "关于",
  description: `关于 ${SITE.name}：${SITE.description}`,
  nav: "about",
  body: `<section class="hero">
<div class="kicker">${esc(ABOUT.kicker)}</div>
<h1>${esc(ABOUT.headline[0])}<span class="accent">${esc(ABOUT.headline[1])}</span></h1>
<p class="lead">${esc(lead)}</p>
</section>
<section class="section" aria-labelledby="steps"><div class="section-head"><h2 id="steps">四个环节</h2></div>${steps()}</section>
<section class="section" aria-labelledby="judge">
<div class="section-head"><h2 id="judge">精选怎么判断</h2></div>
<p class="prose-note">每条资料先由模型判断是不是 AI 产业链的事。可能重要的，再按产业份量、信息增量、证据强度、传导面和决策价值独立打两次分，两次都过了信源分级对应的门槛才进精选：官方一手发布的门槛低一些，媒体与个人的高一些。营销稿、荐股、没有金额和时间的“合作”新闻会被压低；同一件事的多篇报道归成一个事件，只出现一次。</p>
</section>
<section class="section" aria-labelledby="categories">
<div class="section-head"><h2 id="categories">七个类别</h2><p>首页、日报和订阅都按这七类分</p></div>
<div class="card table-wrap"><table><thead><tr><th>类别</th><th>日报分节</th><th>收什么</th></tr></thead><tbody>${CATEGORIES.map(
    (c) => `<tr><td><strong>${esc(c.label)}</strong> <span class="mono">${c.key}</span></td><td>${esc(c.section)}</td><td>${esc(c.guide)}</td></tr>`,
  ).join("")}</tbody></table></div>
</section>
<section class="section" aria-labelledby="sources">
<div class="section-head"><h2 id="sources">信源</h2><p>${sources.length} 个：官方一手 ${firstParty.length} 个，媒体与分析 ${media.length} 个。默认只展示摘要和原文链接</p></div>
<div class="grid grid-2">
<div class="card"><h3 class="list-head">官方一手</h3>${sourceList(firstParty, "官方")}</div>
<div class="card"><h3 class="list-head">媒体与分析</h3>${sourceList(media, "媒体")}</div>
</div>
</section>
<section class="section"><p class="prose-note">${esc(ABOUT.copyright)}反馈页联系我们（反馈页随完整版一起上线）。</p></section>`,
};

function placeholder(p: { path: string; nav: Page["nav"]; kicker: string; title: string; lead: string; points: string[] }): Page {
  return {
    path: p.path,
    title: p.kicker,
    description: p.lead,
    nav: p.nav,
    noindex: true,
    body: `<article class="card soon-card">
<div class="feature-top"><div class="kicker">${esc(p.kicker)}</div>${status(false)}</div>
<h1>${esc(p.title)}</h1>
<p class="lead">${esc(p.lead)}</p>
<ul>${p.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
<div class="actions"><a class="button button-primary" href="/topics/">先看产业链地图 →</a><a class="button" href="/">回首页</a></div>
</article>`,
  };
}

const daily = placeholder({
  path: "/daily/",
  nav: "daily",
  kicker: withSubject("日报"),
  title: `每天 8 点，一份读得完的 ${withSubject("日报")}`,
  lead: `收录前一天 08:00 到当天 08:00 入选的精选，按${sections.join("、")}分节，附当天导语和今日看点。`,
  points: ["每天 08:00（北京时间）出刊，保留往期存档", "每周一出上周周报，每月 1 日出上月月报", "同一份日报通过 RSS 和 MCP 提供，可以直接订阅"],
});

const hot = placeholder({
  path: "/hot/",
  nav: "hot",
  kicker: "热点榜",
  title: "过去 48 小时，产业链上大家在讨论什么",
  lead: "热度按事件算，不按文章算：48 小时内每个独立来源只算一次，24 小时减半。排在前面的，是真正有很多家在说的事。",
  points: ["官方稿、媒体报道和转述归成同一个事件，只算一次", "和 6 小时前相比，涨得快的标“上升”，新出现的标“新”", "每个事件有综述，列出组成热度的公开来源"],
});

const all = placeholder({
  path: "/all/",
  nav: "all",
  kicker: "全部动态",
  title: "所有信源的最新动态，一站看完",
  lead: `按时间汇总 ${sources.length} 个信源的最新动态，可按${CATEGORIES.map((c) => c.label).join("、")}筛选，支持中英文搜索。`,
  points: ["RSS：精选、全部、全文和日报四种订阅", "公开 API 与 MCP：Agent 可以直接读取最新动态和日报", "每条都链接原文，默认只展示摘要"],
});

const notFound: Page = {
  path: "/404.html",
  title: "页面不存在",
  description: "这个页面不存在。",
  nav: null,
  noindex: true,
  body: `<article class="card soon-card"><div class="kicker">404</div><h1>这个页面不存在</h1><p class="lead">可能是地址写错了，也可能是完整版上线后才会有的页面。</p><div class="actions"><a class="button button-primary" href="/">回首页</a><a class="button" href="/topics/">产业链地图</a></div></article>`,
};

// ── Write ───────────────────────────────────────────────────────────────────────────────

await rm(OUT, { recursive: true, force: true });
await mkdir(path.join(OUT, "assets"), { recursive: true });

const css = await readFile(path.join(import.meta.dirname, "style.css"));
const stylesheet = `assets/style.${createHash("sha256").update(css).digest("hex").slice(0, 10)}.css`;
await writeFile(path.join(OUT, stylesheet), css);

const pages = [home, topicsPage, about, daily, hot, all, notFound];
for (const page of pages) {
  const file = page.path.endsWith(".html") ? path.join(OUT, page.path) : path.join(OUT, page.path, "index.html");
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, layout(page, stylesheet));
}

for (const icon of ["favicon.ico", "icon.png", "icon-192.png", "apple-icon.png", "logo.svg"]) {
  await copyFile(path.join(ROOT, "industry/brand", icon), path.join(OUT, icon));
}

await writeFile(
  path.join(OUT, "site.webmanifest"),
  `${JSON.stringify(
    {
      name: SITE.name,
      short_name: SITE.name,
      description: SITE.description,
      start_url: "/",
      display: "standalone",
      background_color: "#13191c",
      theme_color: "#13191c",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon.png", sizes: "512x512", type: "image/png" },
      ],
    },
    null,
    2,
  )}\n`,
);

const indexed = pages.filter((p) => !p.noindex);
const today = new Date().toISOString().slice(0, 10);
await writeFile(
  path.join(OUT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexed.map((p) => `  <url><loc>${ORIGIN}${p.path}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`,
);
await writeFile(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);

// Cloudflare Pages: the hashed stylesheet never changes, everything else revalidates.
await writeFile(
  path.join(OUT, "_headers"),
  `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n`,
);

// The share image, drawn by the full site's own card renderer.
process.env.SITE_URL = ORIGIN;
const { renderOg } = await import("../apps/api/src/og/render.ts");
const { png } = await renderOg({
  kicker: "AI 产业链精选",
  title: "从芯片到应用，每天精选几条",
  subtitle: "芯片、算力、模型、应用、资本与政策：盯住一手信源，每天 8 点出日报。",
});
await writeFile(path.join(OUT, "og.png"), png);

console.log(`static site: ${pages.length} pages, ${sources.length} sources, ${topics.length} topics → ${path.relative(ROOT, OUT)}`);
