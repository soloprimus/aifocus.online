
【AI 产业链翻译规则 — 本平台内容覆盖 AI 芯片、半导体、算力基础设施、模型、应用、资本与政策，严格遵守】

1. 歧义默认值：以下词在中文有其他含义，**一律按 AI 产业链语境翻译**：
   - LLM = 大语言模型（绝不译"法学硕士"）
   - Token / tokens = 模型 token（保留英文；绝不译"代币"/"令牌"）
   - Transformer：模型语境 = Transformer 架构（保留英文）；电力、电网、数据中心供电语境（power transformer、transformer shortage）= 变压器
   - Agent / Agentic = AI 智能体 / 智能体的（不译"代理人"/"中介"）
   - Inference = 推理（模型运行）；Training = 训练；Reasoning model = 推理模型
   - Foundry = 晶圆代工（厂）；Fab = 晶圆厂；Node / process node = 制程（节点）；Yield = 良率；Wafer = 晶圆；Die = 裸片；Tape-out = 流片；Lithography = 光刻
   - Packaging = 封装；Advanced packaging = 先进封装；Interposer = 中介层；Substrate = 基板；Chiplet = 芯粒（可保留 Chiplet）
   - Accelerator = 加速器 / 加速卡；Hyperscaler = 超大规模云厂商；Neocloud = GPU 云新厂商（可保留 neocloud）；Colocation = 托管数据中心
   - Rack = 机柜；Rack-scale = 整机柜；Liquid cooling = 液冷；Power purchase agreement (PPA) = 购电协议；Grid interconnection = 并网
   - Optical transceiver / optical module = 光模块；Co-packaged optics = 共封装光学（CPO）；Switch = 交换机；Scale-up / Scale-out = 纵向扩展 / 横向扩展
   - Capex = 资本开支；Guidance = 业绩指引；Backlog = 积压订单；RPO = 剩余履约义务；Gross margin = 毛利率；Data center revenue = 数据中心业务收入
   - Export controls = 出口管制；Entity List = 实体清单；BIS = 美国商务部工业与安全局（BIS）；CHIPS Act =《芯片与科学法案》；Tariff = 关税

2. 以下专有名词**一律保留英文原文**，不翻译不加中文括注：
   - 芯片与系统型号（举例 + 通用规则）：Blackwell / Rubin / GB300 / NVL72 / H200 / MI355X / MI450 / TPU v7 / Ironwood / Trainium / Inferentia / MTIA / Maia / Gaudi / Xeon / EPYC / Grace / Vera
     **规则**：任何芯片、系统、机柜的型号和代号一字不改，包括字母数字后缀
   - 技术缩写（举例 + 通用规则）：GPU / TPU / NPU / ASIC / XPU / CPU / HBM / HBM3E / HBM4 / DRAM / NAND / SSD / CoWoS / SoIC / EUV / High-NA / NVLink / InfiniBand / Ethernet / PCIe / CXL / UALink / CPO / PUE / LLM / RAG / MoE / MCP / API / SDK
     **规则**：任何 2-6 字母的全大写缩写，默认按产业链含义保留英文
   - 制程节点与规格：2nm / 3nm / N2 / A16 / A14 / 18A / 14A / 800G / 1.6T / 12-Hi / 16-Hi，一字不改
   - 模型族与版本号：GPT / Claude / Gemini / Llama / Qwen / Grok / DeepSeek / Mistral 及其版本号一字不改，不"翻译性扩写"（不要把 "405B" 译成 "4050 亿"）
   - 评测基准：MMLU / GPQA / SWE-bench / MLPerf / Chatbot Arena 等一律保留英文
   - 这些公司保留英文：AMD / Arm / ASML / Meta / OpenAI / Anthropic / xAI / CoreWeave / Marvell / Supermicro / Dell / Cisco / Arista / Mistral / Hugging Face

3. 中文读者通用中文名的公司**用中文名**（首次出现可双标，如"台积电（TSMC）"，后续保持一致）：
   - 海外：英伟达、台积电、三星、SK 海力士、美光、英特尔、博通、高通、微软、谷歌、亚马逊（AWS 可保留）、甲骨文、苹果、特斯拉、鸿海
   - 中国厂商用官方中文品牌名：华为昇腾 / 寒武纪 / 海光 / 中芯国际 / 华虹 / 长鑫存储 / 长江存储 / 摩尔线程 / 沐曦 / 壁仞 / 燧原 / 昆仑芯 / 平头哥 / 阿里巴巴、千问（Qwen）/ 字节跳动、豆包 / 腾讯、混元 / 百度、文心 / 深度求索（DeepSeek）/ 月之暗面（Kimi）/ 智谱（GLM）/ MiniMax / 宇树 / 小米

4. 代码 / 命令 / URL / 数字单位 **一字不改**保留：
   - URL、代码、命令原样
   - 数字+单位：1.5 GW / 300 MW / 10 万片/月 / 4 EFLOPS / $2.10 每 GPU 小时 / 99.9% / 50%
   - 金额、参数量、比例、区间必须保留原文的阿拉伯数字、单位和币种；不要把 $10B-$100B 改写成"数百亿至数千亿美元"等中文数量词，不要换算成人民币
   - 财报口径照原文：财年与季度（FY2027 Q2）、同比 / 环比、GAAP / 非 GAAP 不得混用或省略成"增长"
