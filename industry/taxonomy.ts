// AIFocus 的分类体系：AI 产业链从上游到下游的类别、标签词表、公司（主体）名录，以及防止张冠李戴的身份词典。
// 模型按这里的词表打标签，主题页（topics.json）按标签归类，筛选栏按类别分组。
// 类别的 key 会出现在网址里（/all?category=…），上线后就不要再改；标签和名录可以随时增减。
// 改了 ITEM_TYPES、CATEGORY_TAGS、TOPIC_TAGS、ENTITY_TAGS，要同步改 prompts/content-understanding.md 里写死的清单。

/**
 * 网页上的类别（筛选栏、卡片角标、RSS 分类订阅）：按产业链从上游到下游排，最后是资本、政策和观点。
 * key 是网址和接口里的身份，上线后不要改。section 是日报里的分节标题；guide 告诉模型怎么归类。
 * 没归上类的资料在日报里放进最后一节。
 */
export const CATEGORIES = [
  { key: "chips", label: "芯片", section: "芯片与半导体", guide: "GPU、AI 加速器与定制芯片（ASIC）、CPU、HBM 与存储、晶圆代工与制程、先进封装、半导体设备、材料与 EDA" },
  { key: "compute", label: "算力", section: "算力与基础设施", guide: "AI 服务器与整机柜、网络与光互连、数据中心与智算中心建设、电力能源与散热、云与算力租赁的供给、价格和容量" },
  { key: "models", label: "模型", section: "模型与技术", guide: "基础模型与开源模型的发布、能力与价格变化，训练与推理技术，评测、技术报告与关键研究" },
  { key: "apps", label: "应用", section: "应用与终端", guide: "AI 产品与平台、Agent 与企业落地、行业应用，AI 手机/PC/眼镜等终端，机器人、具身智能与自动驾驶" },
  { key: "capital", label: "资本", section: "资本与财报", guide: "融资、并购、IPO，财报、业绩指引与资本开支，估值与市值，大额订单、采购协议与战略合作" },
  { key: "policy", label: "政策", section: "政策与地缘", guide: "出口管制、实体清单与关税，产业政策与补贴，AI 监管与立法，反垄断、诉讼与执法，地缘政治对供应链的影响" },
  { key: "insight", label: "观点", section: "深度与观点", guide: "产业分析、深度报道、行业研究报告与市场数据解读、人物访谈与观点、趋势判断" },
] as const;

/**
 * 内容理解一步给每篇资料判的“内容类型”（写在 prompts/content-understanding.md 里，改了类型要同步改那份提示词）。
 * 评分提示词（prompts/selection-score.md）按类型给五个维度不同的权重。
 */
export const ITEM_TYPES = [
  "hardware_launch", "model_release", "product_launch", "supply_chain", "capital_deal", "earnings_guidance", "policy_regulation", "research_paper", "industry_analysis",
] as const;

// ── 标签词表 ────────────────────────────────────────────────────────────────────────────

/** 每篇资料的第一个标签必须是这些“分类标签”之一：这件事的性质。 */
export const CATEGORY_TAGS = [
  "新品发布", "模型发布", "产能/供应链", "融资/并购", "订单/合作", "财报/业绩", "政策/监管", "技术/研究", "行业分析", "人物观点", "人事/组织", "其他",
] as const;

/** 可选的主题标签：这件事落在产业链的哪一环。 */
export const TOPIC_TAGS = [
  "GPU", "ASIC/定制芯片", "HBM/存储", "晶圆代工", "先进封装", "设备/材料",
  "服务器", "网络/光互连", "数据中心", "电力/能源", "云/算力租赁",
  "训练", "推理", "开源模型", "Agent", "AI编码", "多模态",
  "AI终端", "具身智能", "自动驾驶",
  "国产算力", "出口管制", "资本开支",
] as const;

/** 可选的实体标签（公司、机构），和 ENTITIES 里的 displayTag 一致。 */
export const ENTITY_TAGS = [
  "NVIDIA", "AMD", "Intel", "TSMC", "Samsung", "SK hynix", "Micron", "ASML", "Broadcom", "华为", "中芯国际",
  "Microsoft", "Google", "Amazon", "Meta", "Oracle",
  "OpenAI", "Anthropic", "xAI", "DeepSeek", "阿里巴巴", "字节跳动", "腾讯",
  "Apple", "Tesla",
] as const;

/** 模型常写的近义词，统一成词表里的写法。 */
export const TAG_SYNONYMS: Readonly<Record<string, string>> = {
  // 分类标签
  发布: "新品发布", 新品: "新品发布", 产品发布: "新品发布", 产品更新: "新品发布", 芯片发布: "新品发布", 硬件发布: "新品发布", 路线图: "新品发布",
  模型: "模型发布", 新模型: "模型发布",
  产能: "产能/供应链", 供应链: "产能/供应链", 扩产: "产能/供应链", 供需: "产能/供应链", 缺货: "产能/供应链", 交付: "产能/供应链", 良率: "产能/供应链",
  融资: "融资/并购", 并购: "融资/并购", 收购: "融资/并购", 投资: "融资/并购", IPO: "融资/并购", ipo: "融资/并购", 上市: "融资/并购",
  订单: "订单/合作", 合作: "订单/合作", 采购: "订单/合作", 合同: "订单/合作", 生态: "订单/合作",
  财报: "财报/业绩", 业绩: "财报/业绩", 营收: "财报/业绩", 指引: "财报/业绩", 业绩指引: "财报/业绩",
  政策: "政策/监管", 监管: "政策/监管", 法规: "政策/监管", 诉讼: "政策/监管", 关税: "政策/监管", 反垄断: "政策/监管",
  论文: "技术/研究", 研究: "技术/研究", 技术: "技术/研究", 评测: "技术/研究", 基准: "技术/研究", paper: "技术/研究",
  分析: "行业分析", 深度: "行业分析", 研报: "行业分析", 趋势: "行业分析", 市场: "行业分析",
  观点: "人物观点", 访谈: "人物观点", 大佬观点: "人物观点",
  人事: "人事/组织", 裁员: "人事/组织", 任命: "人事/组织",
  // 主题标签
  AI芯片: "GPU", 加速卡: "GPU", 显卡: "GPU", ASIC: "ASIC/定制芯片", TPU: "ASIC/定制芯片", 定制芯片: "ASIC/定制芯片", 自研芯片: "ASIC/定制芯片",
  HBM: "HBM/存储", 存储: "HBM/存储", 内存: "HBM/存储", DRAM: "HBM/存储", NAND: "HBM/存储",
  代工: "晶圆代工", 制程: "晶圆代工", 晶圆厂: "晶圆代工", 封装: "先进封装", CoWoS: "先进封装", 设备: "设备/材料", 光刻: "设备/材料", 材料: "设备/材料",
  AI服务器: "服务器", 整机柜: "服务器", 光模块: "网络/光互连", 网络: "网络/光互连", 互连: "网络/光互连", CPO: "网络/光互连",
  智算中心: "数据中心", IDC: "数据中心", 电力: "电力/能源", 能源: "电力/能源", 核电: "电力/能源", 液冷: "数据中心",
  云计算: "云/算力租赁", 云: "云/算力租赁", 算力租赁: "云/算力租赁", GPU云: "云/算力租赁",
  开源: "开源模型", 智能体: "Agent", 编码: "AI编码", 编程: "AI编码", AI编程: "AI编码",
  端侧: "AI终端", AI手机: "AI终端", AIPC: "AI终端", AI眼镜: "AI终端", 机器人: "具身智能", 人形机器人: "具身智能", 智驾: "自动驾驶",
  国产替代: "国产算力", 国产芯片: "国产算力", 实体清单: "出口管制", 禁令: "出口管制", Capex: "资本开支", capex: "资本开支", 资本支出: "资本开支",
};

/** 模型漏了分类标签时，按内容类型补一个。 */
export const CATEGORY_BY_ITEM_TYPE: Readonly<Record<string, string>> = {
  hardware_launch: "新品发布", model_release: "模型发布", product_launch: "新品发布", supply_chain: "产能/供应链", capital_deal: "融资/并购",
  earnings_guidance: "财报/业绩", policy_regulation: "政策/监管", research_paper: "技术/研究", industry_analysis: "行业分析",
};

// ── 公司与主体 ──────────────────────────────────────────────────────────────────────────

/**
 * 公司主题：id → 显示名、卡片上显示的标签（null 表示只用 entity:<id> 归类）、别名。
 * 按产业链排：芯片与半导体 → 云与基础设施 → 模型 → 终端与应用。
 */
export const ENTITIES: Record<string, { name: string; displayTag: string | null; aliases: string[] }> = {
  nvidia: { name: "NVIDIA 英伟达", displayTag: "NVIDIA", aliases: ["NVIDIA", "英伟达", "Blackwell"] },
  amd: { name: "AMD", displayTag: "AMD", aliases: ["AMD", "Instinct", "EPYC"] },
  intel: { name: "Intel 英特尔", displayTag: "Intel", aliases: ["Intel", "英特尔", "Gaudi"] },
  tsmc: { name: "TSMC 台积电", displayTag: "TSMC", aliases: ["TSMC", "台积电", "CoWoS"] },
  samsung: { name: "Samsung 三星", displayTag: "Samsung", aliases: ["Samsung", "三星"] },
  "sk-hynix": { name: "SK hynix 海力士", displayTag: "SK hynix", aliases: ["SK hynix", "SK海力士", "海力士"] },
  micron: { name: "Micron 美光", displayTag: "Micron", aliases: ["Micron", "美光"] },
  asml: { name: "ASML 阿斯麦", displayTag: "ASML", aliases: ["ASML", "阿斯麦"] },
  broadcom: { name: "Broadcom 博通", displayTag: "Broadcom", aliases: ["Broadcom", "博通"] },
  arm: { name: "Arm", displayTag: null, aliases: ["Arm", "安谋"] },
  qualcomm: { name: "Qualcomm 高通", displayTag: null, aliases: ["Qualcomm", "高通", "骁龙"] },
  huawei: { name: "华为 / 昇腾", displayTag: "华为", aliases: ["华为", "Huawei", "昇腾"] },
  smic: { name: "中芯国际", displayTag: "中芯国际", aliases: ["中芯国际", "SMIC"] },
  cambricon: { name: "寒武纪", displayTag: null, aliases: ["寒武纪", "Cambricon"] },
  microsoft: { name: "Microsoft / Azure", displayTag: "Microsoft", aliases: ["Microsoft", "微软", "Azure"] },
  google: { name: "Google / TPU / Gemini", displayTag: "Google", aliases: ["Google", "谷歌", "DeepMind"] },
  amazon: { name: "Amazon / AWS", displayTag: "Amazon", aliases: ["Amazon", "AWS", "亚马逊"] },
  meta: { name: "Meta", displayTag: "Meta", aliases: ["Meta", "Llama"] },
  oracle: { name: "Oracle 甲骨文", displayTag: "Oracle", aliases: ["Oracle", "甲骨文", "OCI"] },
  coreweave: { name: "CoreWeave", displayTag: null, aliases: ["CoreWeave"] },
  openai: { name: "OpenAI", displayTag: "OpenAI", aliases: ["OpenAI", "ChatGPT", "GPT"] },
  anthropic: { name: "Anthropic", displayTag: "Anthropic", aliases: ["Anthropic", "Claude"] },
  xai: { name: "xAI", displayTag: "xAI", aliases: ["xAI", "Grok", "Colossus"] },
  deepseek: { name: "DeepSeek 深度求索", displayTag: "DeepSeek", aliases: ["DeepSeek", "深度求索"] },
  alibaba: { name: "阿里巴巴 / 千问", displayTag: "阿里巴巴", aliases: ["阿里巴巴", "阿里云", "Qwen"] },
  bytedance: { name: "字节跳动 / 豆包", displayTag: "字节跳动", aliases: ["字节跳动", "豆包", "火山引擎"] },
  tencent: { name: "腾讯", displayTag: "腾讯", aliases: ["腾讯", "混元", "Tencent"] },
  baidu: { name: "百度", displayTag: null, aliases: ["百度", "文心", "昆仑芯"] },
  mistral: { name: "Mistral", displayTag: null, aliases: ["Mistral"] },
  apple: { name: "Apple 苹果", displayTag: "Apple", aliases: ["Apple", "苹果"] },
  tesla: { name: "Tesla 特斯拉", displayTag: "Tesla", aliases: ["Tesla", "特斯拉", "Optimus"] },
  xiaomi: { name: "小米", displayTag: null, aliases: ["小米", "Xiaomi"] },
  unitree: { name: "宇树科技", displayTag: null, aliases: ["宇树", "Unitree"] },
};

/**
 * 身份词典：摘要和标题里出现的公司，必须在原文里也出现过，否则退回原标题、丢掉摘要（防止模型张冠李戴）。
 * 大小写敏感的写法（Arm、Oracle、Apple、Meta）是为了不把普通英文单词当成公司。
 */
export const IDENTITY_LEXICON: ReadonlyArray<{ id: string; name: string; patterns: RegExp[] }> = [
  { id: "nvidia", name: "NVIDIA", patterns: [/nvidia|英伟达|\bblackwell\b|\brubin(?:\s+ultra)?\b|\bcuda\b|\bnvlink\b|\bgrace\s+hopper\b|\bnemotron\b/i] },
  { id: "amd", name: "AMD", patterns: [/\bAMD\b|超威半导体|\binstinct\s*mi\d+|\bmi[34]\d{2}[a-z]?\b|\bepyc\b|\bryzen\b|\brocm\b/i] },
  { id: "intel", name: "Intel", patterns: [/\bintel\b|英特尔|\bgaudi\s?\d?\b|\bxeon\b|\bintel\s?18a\b|\bintel\s?14a\b/i] },
  { id: "tsmc", name: "TSMC", patterns: [/\btsmc\b|台积电|台積電|\bcowos\b/i] },
  { id: "samsung", name: "Samsung", patterns: [/samsung|三星/i] },
  { id: "sk-hynix", name: "SK hynix", patterns: [/sk\s?hynix|海力士/i] },
  { id: "micron", name: "Micron", patterns: [/\bmicron\b|美光/i] },
  { id: "asml", name: "ASML", patterns: [/\basml\b|阿斯麦/i] },
  { id: "broadcom", name: "Broadcom", patterns: [/broadcom|博通/i] },
  { id: "arm", name: "Arm", patterns: [/\bArm\b|\bARM\b|安谋/] },
  { id: "qualcomm", name: "Qualcomm", patterns: [/qualcomm|高通|snapdragon|骁龙/i] },
  { id: "huawei", name: "华为 / 昇腾", patterns: [/huawei|华为|昇腾|鲲鹏|海思|hisilicon/i] },
  { id: "smic", name: "中芯国际", patterns: [/\bsmic\b|中芯/i] },
  { id: "cambricon", name: "寒武纪", patterns: [/cambricon|寒武纪/i] },
  { id: "hygon", name: "海光信息", patterns: [/hygon|海光/i] },
  { id: "microsoft", name: "Microsoft / Azure", patterns: [/microsoft|微软|\bazure\b|copilot/i] },
  { id: "google", name: "Google / TPU / Gemini", patterns: [/google|谷歌|deepmind|\bgemini\b|\btpu\b|\bironwood\b/i] },
  { id: "amazon", name: "Amazon / AWS", patterns: [/amazon|亚马逊|\baws\b|trainium|inferentia/i] },
  { id: "meta", name: "Meta / Llama", patterns: [/\bMeta\b/, /\bmeta\s?ai\b|\bllama\b|\bmtia\b/i] },
  { id: "oracle", name: "Oracle", patterns: [/\bOracle\b|\bORACLE\b|甲骨文/] },
  { id: "coreweave", name: "CoreWeave", patterns: [/coreweave/i] },
  { id: "supermicro", name: "Supermicro", patterns: [/supermicro|super\s+micro\s+computer|超微电脑/i] },
  { id: "dell", name: "Dell", patterns: [/\bdell\b|戴尔/i] },
  { id: "foxconn", name: "鸿海 / Foxconn", patterns: [/foxconn|hon\s?hai|鸿海|富士康|工业富联/i] },
  { id: "openai", name: "OpenAI", patterns: [/openai|chatgpt|\bgpt-?[o\d]|\bsora\b|\bcodex\b|\bstargate\b/i] },
  { id: "anthropic", name: "Anthropic", patterns: [/anthropic|\bclaude\b/i, /\b(?:opus|sonnet|haiku)\s*\d+(?:[.\-]\d+)*\b/i] },
  { id: "xai", name: "xAI / Grok", patterns: [/\bxai\b|\bgrok\b/i] },
  { id: "deepseek", name: "DeepSeek", patterns: [/deepseek|深度求索/i] },
  { id: "alibaba", name: "阿里巴巴 / 千问", patterns: [/alibaba|阿里巴巴|阿里云|\bqwen|通义|千问/i] },
  { id: "bytedance", name: "字节跳动 / 豆包", patterns: [/bytedance|字节跳动|豆包|doubao|火山引擎/i] },
  { id: "tencent", name: "腾讯", patterns: [/tencent|腾讯|混元|hunyuan/i] },
  { id: "baidu", name: "百度", patterns: [/baidu|百度|文心|昆仑芯/i] },
  { id: "mistral", name: "Mistral", patterns: [/mistral/i] },
  { id: "kimi", name: "Kimi / 月之暗面", patterns: [/\bkimi\b|月之暗面|\bmoonshot\s?ai\b/i] },
  { id: "zhipu", name: "智谱 GLM", patterns: [/智谱|\bglm-?[4-9]|\bzhipu\b/i] },
  { id: "minimax", name: "MiniMax", patterns: [/minimax/i] },
  { id: "apple", name: "Apple", patterns: [/\bApple\b|苹果/] },
  { id: "tesla", name: "Tesla", patterns: [/tesla|特斯拉|\boptimus\b|\bdojo\b/i] },
  { id: "xiaomi", name: "小米", patterns: [/xiaomi|小米/i] },
  { id: "unitree", name: "宇树科技", patterns: [/unitree|宇树/i] },
];

/** 这些域名上的文章，发布方就是对应的公司（托管平台如 GitHub、arXiv 不算）。 */
export const PUBLISHER_DOMAINS: ReadonlyArray<{ entityId: string; domains: readonly string[] }> = [
  { entityId: "nvidia", domains: ["nvidia.com"] },
  { entityId: "amd", domains: ["amd.com"] },
  { entityId: "intel", domains: ["intel.com"] },
  { entityId: "tsmc", domains: ["tsmc.com"] },
  { entityId: "samsung", domains: ["samsung.com"] },
  { entityId: "sk-hynix", domains: ["skhynix.com"] },
  { entityId: "micron", domains: ["micron.com"] },
  { entityId: "asml", domains: ["asml.com"] },
  { entityId: "broadcom", domains: ["broadcom.com"] },
  { entityId: "arm", domains: ["arm.com"] },
  { entityId: "microsoft", domains: ["microsoft.com"] },
  { entityId: "google", domains: ["deepmind.google", "ai.google", "blog.google", "cloudblog.withgoogle.com", "cloud.google.com"] },
  { entityId: "amazon", domains: ["aws.amazon.com", "aboutamazon.com"] },
  { entityId: "meta", domains: ["ai.meta.com", "engineering.fb.com", "about.fb.com"] },
  { entityId: "oracle", domains: ["oracle.com"] },
  { entityId: "openai", domains: ["openai.com"] },
  { entityId: "anthropic", domains: ["anthropic.com", "claude.com"] },
  { entityId: "xai", domains: ["x.ai"] },
  { entityId: "deepseek", domains: ["deepseek.com"] },
  { entityId: "mistral", domains: ["mistral.ai"] },
];

/** 原文里的这些写法也算提到了对应公司。 */
export const IDENTITY_CONTEXT_ALIASES: ReadonlyArray<{ entityId: string; pattern: RegExp }> = [
  { entityId: "meta", pattern: /@AIatMeta\b/i },
  { entityId: "zhipu", pattern: /\bZhipu(?:\s+AI\b|['’]s\b)/i },
  { entityId: "google", pattern: /\bAlphabet\b/ },
];
