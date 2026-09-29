// 站点身份和读者看得到的文案。换成你的行业时，先改这个文件。
// 网页和后端都读它；改完重新构建（docker compose up --build）即可生效。
// 域名不在这里：部署时用环境变量 SITE_URL 设置（线上是 https://aifocus.online）。

export const SITE = {
  /** 站名：导航、页面标题、分享图、RSS、MCP、后台都用它。 */
  name: "AIFocus",
  /**
   * 行业词：拼进默认说法里，比如“AI 产业链日报”“全部 AI 产业链动态”。
   * 结尾是中文字，所以和后面的名词之间不加空格（见 withSubject）。
   */
  subject: "AI 产业链",
  /** 首页的完整标题（浏览器标签、搜索结果）。 */
  homeTitle: "AIFocus — AI 产业链精选 · 芯片、算力、模型、应用每日监测",
  /** 一句话介绍：搜索引擎、分享卡片、RSS、llms.txt 会用。 */
  description:
    "盯住 AI 产业链上下游的一手信源：芯片与半导体、算力与数据中心、大模型、应用与终端、资本与政策。模型预筛、两次独立评分，同一件事的多篇报道归成一个事件，每天早上 8 点出一份 AI 产业链日报。",
  /** 首页左上角和侧边栏下面的一行小字。 */
  tagline: "AI 产业链的每日精选",
  /** 界面语言（HTML lang、og:locale）。 */
  locale: "zh-CN",
  /** 默认域名，只在没设置 SITE_URL 时使用。 */
  defaultUrl: "http://localhost:3000",
  /**
   * MCP 工具名的前缀（小写字母、数字、下划线），工具会叫 aifocus_get_latest、aifocus_search……
   * 已经有人接入后就不要再改。
   */
  mcpPrefix: "aifocus",
  /** 对外联系邮箱（选填）：使用规则、llms.txt、响应头里会写。上线前由站长本人填写。 */
  contactEmail: null as string | null,
  /** 页脚的一行小字（选填）。 */
  footerNote: "由 AIHOT 开源框架驱动 · 内容不构成投资建议",
  /** 中国大陆网站的 ICP 备案号（选填），填了就显示在页脚并链接到工信部备案系统。 */
  icp: null as string | null,
  /** 结构化数据里的网站运营者（搜索引擎用）。 */
  organization: {
    name: "AIFocus",
    /** 创始人（选填）：{ name, url, description }。 */
    founder: null as null | { name: string; url?: string; description?: string },
  },
  /** 抓取信源时报上的名字（User-Agent 里用），不要冒用别的站。 */
  crawlerName: "AIFocusBot",
} as const;

/** 关于页的文案。数字（信源数、收录数、精选数、日报期数）来自站内实时统计，不用写在这里。 */
export const ABOUT = {
  kicker: `关于 ${SITE.name}`,
  /** 大标题：第一行正常颜色，第二行强调色。 */
  headline: ["AI 产业链每天都在变，", "改变格局的，只有几条。"] as [string, string],
  /** 标题下面的一段话。{sources} 会换成实时的信源数。 */
  lead: `${SITE.name} 替你盯着 {sources} 个信源，从芯片、算力、模型一路看到应用、资本与政策：抓取、归并、打分、精选，每天早上 8 点出一份 AI 产业链日报。免费，不用注册。`,
  /** 信源河动画下面的四个环节。 */
  steps: {
    collect: "芯片与云厂商的官方新闻稿、半导体与数据中心媒体、产业分析师和中文科技媒体都在看；活跃的源 15 分钟就看一次。",
    store: "抓到的都存下来，不同来源报道的同一件事归成一个事件；热度按独立来源数算，一家媒体发十篇也只算一次。",
    select: "模型先判断是不是 AI 产业链的事、有没有新事实，再按产业份量、信息增量、证据强度、传导面和决策价值独立打两次分；营销稿、荐股和重复转发进不来。",
    publish: "每天 08:00 出日报，周一出周报，每月 1 日出月报，按芯片、算力、模型、应用、资本、政策分节。",
  },
  /**
   * 作者块（选填），null 就不显示。
   * avatarSourceId：一个 X 账号信源的 id，头像取它的（选填）。
   * 二维码在后台“设置”里上传，或者放进 industry/brand/contact/；没有二维码就不显示那张卡片。
   */
  maker: null as null | {
    name: string;
    greeting: string[];
    avatarSourceId?: string | null;
    wechat?: { title: string; note: string };
    feishu?: { title: string; note: string };
  },
  /** 页面底部的版权与下架说明（结尾会接“反馈页”的链接）。 */
  copyright: `${SITE.name} 是聚合摘要和阅读索引，内容不构成任何投资建议；原文版权归各来源所有。如果你是来源方，希望更正、下架或调整展示方式，可以通过`,
} as const;

/** “AI 产业链日报”这类说法：行业词和名词之间，英文词加空格，中文词不加。 */
export function withSubject(noun: string): string {
  return /[A-Za-z0-9]$/.test(SITE.subject) ? `${SITE.subject} ${noun}` : `${SITE.subject}${noun}`;
}
