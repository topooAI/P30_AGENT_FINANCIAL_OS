# P30 Agent Financial OS 架构设计

本系统致力于构建一个高频、智能且具备极强风险控制能力的金融操作系统，专门针对 Polymarket 等预测市场。

## 1. 核心分层架构

### A. 数据感知层 (Perception Layer)
- **实时价格引擎 (Real-time Price Engine)**: 
    - 接入 Polymarket CLOB WebSocket。
    - 维护本地 L2 订单簿，毫秒级更新。
- **情报 Agent (Intelligence Agent)**:
    - 监控 Twitter, News API, Substack。
    - 提取影响预测市场赔率的关键事件。

### B. 策略逻辑层 (Strategy Layer)
- **逻辑套利引擎 (Logic Arb Engine)**:
    - 处理 NegRisk 内部定价失衡。
    - 处理跨市场（跨事件）逻辑关联套利。
- **巨鲸逆向引擎 (Whale Shadow Engine)**:
    - 实时解析监控地址（如 RN1）的交易逻辑并进行影子模拟。
- **自适应做市模型 (Adaptive MM Model)**:
    - 在套利逻辑支撑下进行双向挂单，赚取 Spread 并降低成本。

### C. 执行与风控层 (Control Layer)
- **风控中心 (Risk Control Center)**:
    - **Pre-trade**: 单笔头寸上限、资金占比检查。
    - **In-trade**: 异常波动熔断、逻辑失效自动平仓。
- **极速执行器 (Flash Executor)**:
    - 处理 EIP-712 离线签名。
    - 通过 Cloudflare Workers 全球节点极速推送交易。

### D. 审计与数据层 (Audit & Persistence)
- **决策链存储 (Decision Chain)**: 使用 Cloudflare D1 记录每一笔订单的触发逻辑和当时的市场快照。
- **复盘引擎 (Replay Engine)**: 支持回放特定时段的行情与 Agent 决策过程。

## 2. 技术栈
- **后端/执行**: Cloudflare Workers (TypeScript)。
- **存储**: Cloudflare D1 (SQL), KV (Session/Cache)。
- **前端**: Next.js 16 + Tailwind 4 (部署于 Cloudflare Pages)。

## 3. 核心目录结构
- `app/`: 看板 UI 页面。
- `core/adapters/`: 交易所/API 适配器。
- `core/strategies/`: 核心算法逻辑。
- `core/shadow/`: 钱包追踪与逆向。
- `core/risk/`: 风控逻辑。
- `schema.sql`: 数据库模型定义。
