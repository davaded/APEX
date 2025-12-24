

# APEX：最终整体方案文档

## 一、 核心愿景 (Core Vision)

打造一个**“前端隐形、后端智能、交互极客”**的个人知识中枢。

* **在 X (Twitter) 端：** 它是影子女。无 UI、无打扰、无感知。
* **在管理端：** 它是指挥官。全实时、全动态、深度连接。

---

## 二、 系统架构设计 (System Architecture)

系统采用 **“异步流式架构”**，彻底分离采集压力与展示逻辑。

### 1. 采集层：影子探针 (The Shadow Probe)

* **技术栈：** Plasmo Framework (Chrome Extension)
* **核心逻辑：** **GraphQL 网络拦截 (Network Interception)**。
* **Hook 机制：** 注入脚本重写 `window.fetch`。监听 `CreateLike`, `CreateBookmark` 等 API。
* **零 DOM 操作：** 完全不触碰页面 DOM 节点，彻底杜绝网页崩溃。
* **本地缓冲 (Safety Buffer)：** 拦截到的 JSON 数据立即存入 **IndexedDB**。
* *作用：* 即使网络断开或页面关闭，数据依然保留，待下次静默上传。





### 2. 数据层：智能中枢 (The Brain)

* **技术栈：** Supabase (PostgreSQL + pgvector + Realtime)
* **轻量化策略：**
* **仅存文本与元数据：** 丢弃图片/视频二进制文件，仅保留 `media_url`。
* **去重逻辑：** 基于 `Tweet_ID` 的唯一索引。


* **AI 管道 (The AI Pipeline)：**
* **Embedding：** 文本入库即转为 1536 维向量 (OpenAI text-embedding-3-small)。
* **Auto-Tagging：** GPT-4o-mini 分析文本，打上 3-5 个语义标签。



### 3. 展示层：策展中心 (The Hub)

* **技术栈：** Next.js 15 + Tailwind CSS + Framer Motion。
* **交互核心：** 实时 Socket 连接，驱动“实况监控”模块。

---

## 三、 模块一：UI 布局的“原子化”重构 (Atomic UI)

我们将推文视为可组合的“原子内容块”，而非简单的表格行。

### 1. 智能卡片组件 (The Smart Card)

* **排版逻辑：**
* **纯文模式：** 当无媒体且字数 < 140 时，字体放大至 `text-xl` 或 `text-2xl` (Serif 衬线体)，居中排版，类似“金句卡片”。
* **图文模式：** 图片作为卡片背景或顶部 Hero Image，文字自动缩小并叠加渐变遮罩。


* **媒体容器 (Media Container)：**
* 实现 CSS Grid 拼图算法，完美复刻 X 原生 1图、2图、3图、4图的布局。


* **元数据解耦 (Metadata Decoupling)：**
* **默认状态：** 隐藏转发数、点赞数、来源链接等干扰信息。
* **悬停状态 (Hover)：** 极淡的元数据浮现 (`opacity-0` -> `opacity-100`)。



### 2. 生产力三栏布局

* **左栏 (Nav)：** 极简图标导航 + AI 自动生成的“动态专题”列表。
* **中栏 (Feed)：** 核心流。支持 **Bento Grid (便当盒)** 与 **Masonry (瀑布流)** 无缝切换。
* **右栏 (Drawer)：** 隐藏式详情页。点击中栏卡片，右栏不跳转直接滑出。

---

## 四、 模块二：交互的“拟物感”与“流畅度” (Motion & Feel)

通过物理引擎般的动效，消除软件的“电子味”。

### 1. 布局投影动画 (Layout Projection)

* **核心技术：** **Framer Motion `layoutId**`。
* **交互描述：** 当你点击中栏的一张小卡片时，它不是“打开”了一个新模态框，而是这张卡片本身**“飞”**到了右侧并平滑**“变大”**展开为详情页。图片、文字的位置通过差值算法平滑过渡。

### 2. 触觉反馈与预览

* **Quick Look (空格预览)：** 模仿 macOS Finder。鼠标指向卡片，按下 `Space` 键，弹出一个高斯模糊背景的预览窗。松开即消失。
* **舒适的骨架屏：** 数据加载时的灰色占位块，其呼吸闪烁频率严格设定为 **1.5秒** (ease-in-out)，这是人眼感觉最不焦虑的频率。

### 3. Command Palette (命令面板)

* **全局入口：** `Cmd + K`。
* **多维能力：**
* **搜索：** “搜索关于 React 的推文”。
* **指令：** “给选中的 5 个卡片加上 #待阅读 标签”。
* **操作：** “切换到深色模式”、“导出为 Markdown”。



---

## 五、 模块三：数据处理的“智能化” (The AI Layer)

### 1. RAG (检索增强生成)

* **语义检索：** 即使推文中没有“性能”二字，搜“让代码跑得更快”也能找到相关推文。
* **原理：** `Cosine Similarity` (余弦相似度) 匹配向量数据库。

### 2. 自动化工作流 (Auto-Workflow)

* **智能分类：** 数据入库时，AI 自动将其归类到“技术”、“设计”、“灵感”、“新闻”等预设桶中。
* **双向关联 (Bi-directional Linking)：**
* 在推文详情页底部，系统会自动计算并显示：**“关联记忆 (Linked Memories)”**。
* *例如：* 你正在看一条关于“太极”的推文，系统自动推荐出你上个月保存的“道家哲学”推文。



---

## 六、 核心亮点：实况监控模块 (Pulse Monitor)

这是连接“隐形采集”与“显性管理”的唯一桥梁，提供极致的确定感。

### 1. 视觉设计

* 位于管理端界面右上角。
* **组成：**
* 一个 **6px 的绿色呼吸点 (Pulsing Dot)**。
* 一个单行滚动的 **等宽字体日志 (Monospace Log)**。



### 2. 交互逻辑

* **静默时：** 显示 `System Ready`，呼吸灯缓慢闪烁。
* **采集时：** 当你在 X 点赞，日志行瞬间滚动：
* `[INGEST] Tweet 8421... captured.`
* `[AI] Tagging: #Frontend #Design.`
* `[SYNC] Done.`


* **反馈：** 不需要弹窗，不需要通知。这一行小字的跳动就是最强的心智反馈。

---

## 七、 最终技术栈清单 (Tech Stack Checklist)

1. **Frontend:** Next.js 15 (App Router), React 19.
2. **Styling:** Tailwind CSS, `shadcn/ui` (Dark Mode default).
3. **Animation:** Framer Motion (Feature: Layout Projection).
4. **Extension:** Plasmo Framework.
5. **State/Data:** Supabase (Postgres + Realtime), TanStack Query.
6. **AI:** OpenAI `text-embedding-3-small` (Vectors), `gpt-4o-mini` (Tags).
7. **Iconography:** Lucide React (Stroke width: 1.5px).

这就是您的最终整体方案。它兼顾了**性能（不崩溃）**、**美学（Linear 风）**与**智慧（AI 关联）**。您现在可以拿着这份蓝图直接开始开发核心拦截器或 UI 组件了。