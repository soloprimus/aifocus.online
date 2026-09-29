import { CHAIN_LAYERS, TOPIC_GROUPS } from "@aihot/industry/chain";
import { Link, useLoaderData } from "react-router";
import { apiGet } from "../lib/api.server";
import { pageMeta } from "../lib/seo";

interface TopicSummary {
  slug: string;
  name: string;
  group: "company" | "field" | "genre";
  definition: string;
  total: number;
  recent: number;
  indexable: boolean;
  latestAt: string | null;
}

export async function loader({ request }: { request: Request }) {
  return apiGet<{ topics: TopicSummary[] }>("/api/site/topics", { signal: request.signal });
}

export function meta() {
  return pageMeta({
    title: "产业链地图",
    description: "按 AI 产业链浏览精选：上游芯片与半导体、中游算力与基础设施、模型层、下游应用与终端，以及贯穿全链的资本与政策；另有公司与事件类型主题。",
    path: "/topics",
    image: "/og/pages/topics.png",
  });
}

export function headers() {
  return { "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600" };
}

export default function TopicsPage() {
  const { topics } = useLoaderData<typeof loader>();
  return (
    <div className="pb-10">
      <header className="pb-2 pt-5 lg:pt-1">
        <h1 className="text-[24px] font-semibold leading-[1.3] text-ink">AI 产业链地图</h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">
          从上游芯片到下游应用，按产业链环节、公司与事件类型浏览 <span className="num">{topics.length}</span> 个主题，持续汇集近期焦点与精选。
        </p>
      </header>
      {TOPIC_GROUPS.map((g) => (
        <section key={g.key} aria-labelledby={`topics-${g.key}`} className="pt-8">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <h2 id={`topics-${g.key}`} className="text-[15px] font-bold text-ink">
              {g.name}
            </h2>
            <p className="text-[12px] text-ink-4">{g.blurb}</p>
          </div>
          {g.key === "field" ? (
            <ChainMap topics={topics.filter((t) => t.group === "field")} />
          ) : (
            <ul className="mt-3.5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {topics
                .filter((t) => t.group === g.key)
                .map((t) => (
                  <li key={t.slug}>
                    <TopicCard topic={t} />
                  </li>
                ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

/** The chain layers from industry/chain.ts, upstream first; field topics no layer lists come last. */
function ChainMap({ topics }: { topics: TopicSummary[] }) {
  const bySlug = new Map(topics.map((t) => [t.slug, t]));
  const placed = new Set<string>(CHAIN_LAYERS.flatMap((l) => l.topics));
  const rest = topics.filter((t) => !placed.has(t.slug));
  const layers = [
    ...CHAIN_LAYERS.map((l) => ({ key: l.key, name: l.name, blurb: l.blurb, topics: l.topics.flatMap((s) => bySlug.get(s) ?? []) })),
    ...(rest.length ? [{ key: "other", name: "其他环节", blurb: "", topics: rest }] : []),
  ].filter((l) => l.topics.length > 0);
  return (
    <>
      <nav aria-label="产业链层级" className="mt-3.5 flex flex-wrap items-center gap-x-1.5 gap-y-2">
        {layers.map((l, i) => (
          <span key={l.key} className="inline-flex items-center gap-1.5">
            {i > 0 && (
              <span aria-hidden="true" className="text-[12px] text-ink-4">
                →
              </span>
            )}
            <a href={`#chain-${l.key}`} className="chip">
              {l.name.split(" · ")[0]}
            </a>
          </span>
        ))}
      </nav>
      <ol className="mt-5">
        {layers.map((l, i) => (
          <li key={l.key} id={`chain-${l.key}`} className="relative grid scroll-mt-20 gap-3 pb-7 pl-9 lg:grid-cols-[210px_1fr] lg:gap-6">
            {i < layers.length - 1 && <span aria-hidden="true" className="absolute bottom-0 left-[11px] top-7 w-px bg-line-strong" />}
            <span
              aria-hidden="true"
              className="mono absolute left-0 top-0 flex size-6 items-center justify-center rounded-full border border-line-strong bg-surface text-[11px] font-semibold text-accent"
            >
              {i + 1}
            </span>
            <div>
              <h3 className="text-[14px] font-bold leading-6 text-ink">{l.name}</h3>
              {l.blurb && <p className="mt-1 text-[12px] leading-relaxed text-ink-4">{l.blurb}</p>}
            </div>
            <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {l.topics.map((t) => (
                <li key={t.slug}>
                  <TopicCard topic={t} compact />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </>
  );
}

function TopicCard({ topic: t, compact = false }: { topic: TopicSummary; compact?: boolean }) {
  return (
    <Link
      to={`/topics/${t.slug}`}
      prefetch="intent"
      aria-label={`查看${t.name}相关精选文章`}
      className={`card card-hover group flex h-full flex-col ${compact ? "px-4 py-3.5" : "px-5 py-[18px]"}`}
    >
      <span className={`${compact ? "text-[14px]" : "text-[15px]"} font-bold text-ink transition-colors group-hover:text-accent`}>{t.name}</span>
      <span className={`mt-1.5 line-clamp-2 flex-1 leading-[1.7] text-ink-3 ${compact ? "text-[12px]" : "text-[12.5px]"}`}>{t.definition}</span>
      <span className="mono mt-3 text-[11.5px] text-accent">
        查看 {t.total} 条精选
        {compact && t.recent > 0 && <span className="text-ink-4"> · 近 30 天 {t.recent}</span>}{" "}
        <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
      </span>
    </Link>
  );
}
