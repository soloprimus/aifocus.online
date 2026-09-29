// AI 产业链地图：主题页（/topics）顶部按这里的顺序，把 topics.json 里“产业链环节”（field）一组的主题
// 从上游排到下游。只决定怎么摆，主题本身（名称、定义、标签）仍在 topics.json 里改。
// 没列进任何一层的 field 主题会放在地图最后一层之后单独显示，不会丢。

export const CHAIN_LAYERS = [
  {
    key: "upstream",
    name: "上游 · 芯片与半导体",
    blurb: "算力的源头：芯片设计、存储、制造、封装与设备",
    topics: ["gpu", "custom-asic", "memory", "foundry", "packaging", "equipment"],
  },
  {
    key: "midstream",
    name: "中游 · 算力与基础设施",
    blurb: "把芯片变成可用算力：整机、网络、机房、电力与云",
    topics: ["servers", "networking", "datacenter", "power", "cloud"],
  },
  {
    key: "models",
    name: "模型层 · 训练与推理",
    blurb: "消耗算力、定义需求：训练集群、推理成本与开源模型",
    topics: ["training", "inference", "open-models"],
  },
  {
    key: "downstream",
    name: "下游 · 应用与终端",
    blurb: "算力变成产品与收入：Agent、编码、多模态、终端、机器人、自动驾驶",
    topics: ["agents", "ai-coding", "multimodal", "ai-devices", "embodied", "autonomous-driving"],
  },
  {
    key: "cross",
    name: "贯穿全链 · 资本与政策",
    blurb: "决定节奏的变量：资本开支、出口管制与国产替代",
    topics: ["capex", "export-controls", "china-compute"],
  },
] as const;

/** 主题页上三组的标题与说明（顺序即页面上的顺序）。 */
export const TOPIC_GROUPS = [
  { key: "field", name: "产业链地图", blurb: "从芯片到应用，按产业链上下游追踪每一环的变化" },
  { key: "company", name: "公司与机构", blurb: "按公司追踪：芯片厂、云厂商、模型公司与终端厂商" },
  { key: "genre", name: "事件类型", blurb: "按事件性质浏览：发布、产能、订单、融资、财报、政策……" },
] as const;
