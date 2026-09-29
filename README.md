<p align="center">
  <img src="industry/brand/logo.svg" alt="AIFocus" width="96" height="96">
</p>

<h1 align="center">AIFocus · AI 产业链精选</h1>

<p align="center">
  <b>盯住 AI 产业链上下游的一手信源，自动筛选、归并、出日报。</b><br>
  芯片与半导体 → 算力与基础设施 → 模型 → 应用与终端，以及贯穿全链的资本与政策。
</p>

<p align="center">
  <a href="https://aifocus.online">aifocus.online</a> ·
  <a href="#本地跑起来">本地跑起来</a> ·
  <a href="#部署到-aifocusonline">部署</a> ·
  <a href="#上线前要你自己决定的事">上线前清单</a> ·
  <a href="docs/">框架文档</a>
</p>

---

## 这是什么

AIFocus 是一个 **AI 产业链新闻精选与监测站**。它每天从 35 个信源（芯片厂与云厂商的官方新闻稿、半导体与数据中心媒体、产业分析师、中文科技媒体）收资料，用大模型：

1. **预筛**：是不是 AI 产业链的事（半导体、存储、数据中心、电力这类内容即使不写“AI”也算）；
2. **两次独立评分**：按“产业份量、信息增量、证据强度、传导面、决策价值”五个维度打分，按信源分级的门槛决定入选；
3. **写作**：中文标题、答案先行的摘要、推荐理由、产业链标签，外文可全文翻译；
4. **聚簇**：不同来源报道的同一件事归成一个事件，按独立来源数算热度；
5. **成刊**：每天 08:00 出 AI 产业链日报，周一出周报，每月 1 日出月报，按产业链分节。

同一份内容同时通过网页、RSS、公开 API、MCP 和 `llms.txt` 提供，给人看也给 Agent 用。

## 和 AIHOT 的关系

AIFocus 基于 [AIHOT 开源框架](https://github.com/KKKKhazix/AIHOT)（MIT 许可）搭建，仓库保留了 AIHOT 的完整提交历史，可以随时合并上游更新（见[同步上游](#同步-aihot-上游更新)）。框架的采集、精选、聚簇、热度算法、日报和后台都沿用 AIHOT；AIFocus 改的是“行业包”和少量界面：

| 改了什么 | 位置 |
|---|---|
| 站名、文案、关于页、MCP 前缀（`aifocus_*`） | `industry/site.ts` |
| 产业链分类（7 类）、事件性质标签、产业链环节标签、33 家公司与身份词典 | `industry/taxonomy.ts` |
| 主题：23 个产业链环节 + 25 家公司 + 10 种事件类型 | `industry/topics.json` |
| **产业链地图**：主题页按上游 → 中游 → 模型层 → 下游 → 资本与政策排布 | `industry/chain.ts`、`apps/web/app/routes/topics.tsx` |
| 35 个初始信源（均已实测可抓） | `industry/sources.json` |
| 预筛、评分、内容理解、术语、摘要、日报的提示词，换成产业链口径 | `industry/prompts/` |
| 品牌：Logo、图标、日报报头、蓝色主色 | `industry/brand/`、`apps/web/app/app.css`、`apps/api/src/og/` |
| 关掉与产业链无关的 Codex 重置监控，保留模型榜 | `industry/features.ts` |
| 行业包一致性测试（标签、主题、地图、提示词清单、权重、信源） | `tests/industry-pack.test.ts` |

AIFocus 不使用 AIHOT 的名字和 Logo；页脚保留“由 AIHOT 开源框架驱动”的署名。

## 产业链分类

首页、全部动态、RSS 分类订阅和日报分节都按这 7 类（`key` 出现在网址里，上线后不要改）：

| key | 名称 | 日报分节 | 收什么 |
|---|---|---|---|
| `chips` | 芯片 | 芯片与半导体 | GPU、加速器与 ASIC、HBM 与存储、晶圆代工、先进封装、设备材料与 EDA |
| `compute` | 算力 | 算力与基础设施 | AI 服务器与整机柜、网络与光互连、数据中心、电力与散热、云与算力租赁 |
| `models` | 模型 | 模型与技术 | 模型发布、能力与价格、训练与推理、技术报告与研究 |
| `apps` | 应用 | 应用与终端 | AI 产品、Agent 与企业落地、AI 终端、机器人与具身智能、自动驾驶 |
| `capital` | 资本 | 资本与财报 | 融资、并购、IPO、财报与指引、资本开支、大额订单与合作 |
| `policy` | 政策 | 政策与地缘 | 出口管制、关税、补贴、监管、诉讼、地缘对供应链的影响 |
| `insight` | 观点 | 深度与观点 | 产业分析、深度报道、研究报告、访谈与趋势判断 |

每条资料的第一个标签是**事件性质**（新品发布、模型发布、产能/供应链、融资/并购、订单/合作、财报/业绩、政策/监管……），后面是**产业链环节**（GPU、HBM/存储、先进封装、网络/光互连、数据中心、电力/能源、国产算力、出口管制、资本开支……）和**公司**。

## 初始信源

| 环节 | 信源 |
|---|---|
| 芯片与半导体（官方） | NVIDIA Newsroom、NVIDIA Blog、AMD、SK hynix、Samsung、Arm |
| 云与基础设施（官方） | Microsoft（Blog、Source）、Google Cloud、AWS、Engineering at Meta |
| 模型（官方） | OpenAI、Google DeepMind、Mistral |
| 半导体与硬件媒体 | SemiAnalysis、DIGITIMES Asia、Tom's Hardware、EE Times、Semiconductor Engineering、IEEE Spectrum、ServeTheHome、The Next Platform |
| 数据中心 | DatacenterDynamics、The Register |
| 商业、资本与分析 | The Information、CNBC、TechCrunch、Ars Technica、Stratechery、Fabricated Knowledge、Interconnects |
| 机器人 | The Robot Report |
| 中文 | 智东西、量子位、雷峰网 |

官方一手信源为 T1（门槛低一些），媒体与分析师为 T2。上线后在后台“信源”页增删、试抓、调频率。台积电、美光、博通、ASML、英特尔等官网的 RSS 在测试时拒绝抓取或已下线，需要时可以用 `web_list`（网页列表）或外部推送接口补上；X 账号和微信公众号需要付费的 SocialData / 极致了 key（见 [docs/sources.md](docs/sources.md)）。

## 本地跑起来

需要 [Docker](https://docs.docker.com/get-docker/) 和一个 OpenAI 兼容的模型 API Key（DeepSeek、千问、智谱都可以）。

```bash
git clone https://github.com/soloprimus/aifocus.online.git
cd aifocus.online
node scripts/init-env.ts --llm-key <你的模型 API Key>
docker compose up -d --build
```

打开 <http://localhost:3000>，后台在 `/admin`（密码在 `.env` 的 `ADMIN_PASSWORD`）。一两分钟后开始有内容；第一次导入的两百多条资料需要一段时间处理完。

不用 Docker 时需要 Node.js 24.11+ 和 PostgreSQL 16/17，步骤见 [docs/deploy.md](docs/deploy.md#不用-docker)。

## 部署到 aifocus.online

1. 准备一台 2 核 4 GB 以上、装了 Docker 的服务器。信源大多在海外，**建议用海外或香港服务器**；放在中国大陆需要 ICP 备案，并在 `.env` 里配 `EGRESS_PROXY_URL` 才能抓到海外信源。
2. 把 `aifocus.online` 的 A 记录解析到服务器 IP。
3. 在服务器上：
   ```bash
   git clone https://github.com/soloprimus/aifocus.online.git && cd aifocus.online
   node scripts/init-env.ts --llm-key <模型 API Key>    # 没有 Node 就复制 .env.example 手动填
   ```
4. 编辑 `.env`：
   ```bash
   SITE_URL=https://aifocus.online
   SITE_DOMAIN=aifocus.online
   PORT=127.0.0.1:3000
   TRUST_PROXY=true
   ```
5. 带 HTTPS 启动（Caddy 自动申请和续期证书）：
   ```bash
   docker compose --profile https up -d --build
   ```

更新：`git pull && docker compose --profile https up -d --build`。备份、日志、中国大陆镜像等细节见 [docs/deploy.md](docs/deploy.md)。

## 上线前要你自己决定的事

- [ ] **模型**：`.env` 里的 `LLM_BASE_URL` / `LLM_API_KEY` / `LLM_MODEL`；想让评分等步骤单独用别的模型，见 `.env.example`。
- [ ] **使用规则与隐私说明**：`industry/pages/terms.md`、`privacy.md` 还是模板，运营主体、联系方式、生效日期要你填写，必要时请专业人士看一下。
- [ ] **联系邮箱、备案号**：`industry/site.ts` 的 `contactEmail`、`icp`。
- [ ] **精选门槛校准**：评分标准已换成产业链口径，门槛暂时沿用 AIHOT 的数字（T1 60 / T2 76）。跑一两周后，挑 100–200 条自己标注过“该选 / 不该选”的产业链资料，用 `scripts/eval-selection.ts` 校准（[docs/selection.md](docs/selection.md)）。
- [ ] **信源**：按你真正关心的环节增删；中文一手信息很多在公众号上。
- [ ] **关于页作者块、二维码**：`industry/site.ts` 的 `ABOUT.maker`，二维码在后台“设置”上传。

## 同步 AIHOT 上游更新

```bash
git remote add upstream https://github.com/KKKKhazix/AIHOT.git   # 只需一次
git fetch upstream
git merge upstream/main
```

冲突通常只会出现在 AIFocus 改过的文件里（主要是 `industry/`、主题页和配色），保留 AIFocus 的版本即可。

## 检查

```bash
npm run typecheck
node --test tests/industry-pack.test.ts                                  # 改了 industry/ 以后先跑这个，不需要数据库
DATABASE_URL=postgres://127.0.0.1:5432/aifocus_test npm test           # 库名必须以 _test 结尾，先跑 node scripts/migrate.ts
node scripts/smoke.ts --base http://localhost:3000                      # 站点跑起来以后
```

## 目录

| 位置 | 内容 |
|---|---|
| `industry/` | 行业包：AIFocus 的站名、分类、主题、产业链地图、信源、提示词、门槛、品牌、条款 |
| `apps/web/` | 网页（React Router 服务端渲染） |
| `apps/api/` | 接口、RSS、MCP、后台接口、分享图 |
| `apps/worker/` | 定时任务：抓信源、调模型、归组、热度、日报 |
| `packages/backend/` | 业务代码 |
| `database/migrations/` | 数据库迁移 |
| `docs/` | AIHOT 框架文档：[架构](docs/architecture.md)、[信源](docs/sources.md)、[精选与校准](docs/selection.md)、[部署](docs/deploy.md)、[定制](docs/customize.md) |

技术栈：Node.js 24 · TypeScript · React Router · Fastify · PostgreSQL 17 · pg-boss · Tailwind CSS · Docker Compose。

## 许可

代码使用 [MIT 许可证](LICENSE)，版权声明见 LICENSE 与 [NOTICE](NOTICE)。AIHOT 的名字和 Logo 不在许可范围内，AIFocus 未使用。站内内容是聚合摘要和阅读索引，原文版权归各来源所有，不构成任何投资建议。
