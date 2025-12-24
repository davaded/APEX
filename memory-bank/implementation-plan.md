# APEX 分步实施计划

> **目标**：打造一个"前端隐形、后端智能、交互极客"的个人知识中枢  
> **原则**：先聚焦基础功能，验证通过后再迭代高级功能  
> **状态**：✅ 已批准 (2025-12-24)

---

## 阶段一：基础设施搭建

### 步骤 1.1：创建 Next.js 基础项目

**指令：**
1. 使用 `npx create-next-app@latest` 初始化项目
2. 选择以下配置：
   - TypeScript: 是
   - ESLint: 是
   - Tailwind CSS: 是
   - `src/` 目录: 是
   - App Router: 是
   - 自定义导入别名 `@/*`: 是
3. 项目命名为 `apex-hub`

**验证测试：**
- [ ] 运行 `npm run dev`，确认开发服务器在 `localhost:3000` 启动
- [ ] 浏览器访问 `http://localhost:3000`，看到 Next.js 默认页面
- [ ] 运行 `npm run lint`，确认无 ESLint 错误

---

### 步骤 1.2：配置 shadcn/ui 组件库

**指令：**
1. 运行 shadcn/ui 初始化命令
2. 选择以下配置：
   - 主题样式: Default
   - 基础颜色: Slate (用于后续深色模式)
   - 全局 CSS 文件路径: 使用默认
   - CSS 变量: 是
   - Tailwind 配置路径: 使用默认
   - 组件目录: `@/components`
   - 工具函数目录: `@/lib/utils`
3. 安装基础组件：Button, Card, Input

**验证测试：**
- [ ] 检查 `components.json` 文件是否生成
- [ ] 检查 `src/components/ui/` 目录下是否有 `button.tsx`, `card.tsx`, `input.tsx`
- [ ] 在首页导入 Button 组件并渲染，确认无编译错误

---

### 步骤 1.3：配置 Framer Motion 动画库

**指令：**
1. 使用 npm 安装 framer-motion 包
2. 创建一个测试页面验证动画功能
3. 在测试页面中创建一个简单的渐入动画元素

**验证测试：**
- [ ] 检查 `package.json` 中包含 `framer-motion` 依赖
- [ ] 访问测试页面，元素正确执行渐入动画
- [ ] 无 TypeScript 类型错误

---

### 步骤 1.4：创建 Supabase 项目

**指令：**
1. 登录 Supabase 控制台 (supabase.com)
2. 创建新项目，命名为 `apex-db`
3. 记录以下凭证：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. 在 Next.js 项目根目录创建 `.env.local` 文件，填入凭证
5. 安装 `@supabase/supabase-js` 包
6. 创建 `src/lib/supabase.ts` 初始化客户端

**验证测试：**
- [ ] `.env.local` 文件存在且包含三个环境变量
- [ ] 运行一个简单的连接测试脚本，确认能连接 Supabase
- [ ] 确认 `.gitignore` 中包含 `.env.local`

---

## 阶段二：Chrome 扩展开发 (采集层)

### 步骤 2.1：创建 Plasmo 扩展项目

**指令：**
1. 在项目根目录创建 `extension` 子目录
2. 使用 `npx plasmo init` 初始化扩展项目
3. 选择 TypeScript 模板
4. 配置 `manifest.json` 权限：
   - `webRequest`
   - `storage`
   - `activeTab`
   - 仅在 `twitter.com` 和 `x.com` 域名激活

**验证测试：**
- [ ] 运行 `npm run dev`，扩展构建无错误
- [ ] Chrome 浏览器加载解压扩展 (`build/chrome-mv3-dev`)
- [ ] 扩展图标显示在浏览器工具栏

---

### 步骤 2.2：实现 Fetch 拦截器

**指令：**
1. 创建 `content.ts` 内容脚本
2. 在脚本中重写 `window.fetch` 方法
3. 过滤拦截 GraphQL 请求（URL 包含 `/graphql/`）
4. 打印拦截到的请求 URL 和响应数据到控制台

**验证测试：**
- [ ] 打开 X.com 并登录账户
- [ ] 打开浏览器开发者工具 Console
- [ ] 滚动时间线，观察控制台输出 GraphQL 请求日志
- [ ] 确认日志包含类似 `TweetDetail`, `HomeTimeline` 的操作名

---

### 步骤 2.3：捕获点赞/收藏事件

**指令：**
1. 在拦截器中添加条件过滤
2. 识别 `CreateLike` 和 `CreateBookmark` GraphQL 操作
3. 从响应数据中提取推文核心字段：
   - `tweet_id`
   - `full_text`
   - `user_screen_name`
   - `user_name`
   - `media_urls` (数组)
   - `created_at`
4. 将提取的数据打印到控制台

**验证测试：**
- [ ] 在 X.com 上点赞任意一条推文
- [ ] 控制台打印该推文的结构化数据对象
- [ ] 数据对象包含所有必要字段且值正确

---

### 步骤 2.4：实现 IndexedDB 本地缓存

**指令：**
1. 安装 `idb` 库简化 IndexedDB 操作
2. 创建数据库 `apex-cache`，表名 `pending_tweets`
3. 表结构：`id` (自增), `tweet_id`, `data`, `timestamp`, `synced`
4. 捕获到的推文数据存入 IndexedDB
5. 实现重复检测：相同 `tweet_id` 不重复存储

**验证测试：**
- [ ] 点赞推文后，打开 Chrome DevTools 的 Application 标签
- [ ] 检查 IndexedDB 中 `apex-cache` 数据库
- [ ] 确认 `pending_tweets` 表中有新记录
- [ ] 重复点赞同一推文，确认不产生重复记录

---

### 步骤 2.5：实现数据上传功能

**指令：**
1. 创建后台服务 worker (`background.ts`)
2. 实现定时任务：每 30 秒检查 IndexedDB 待同步数据
3. 使用 Supabase 客户端批量插入数据
4. 成功后将记录标记为 `synced: true`
5. 实现指数退避重试机制（失败后等待时间翻倍）

**验证测试：**
- [ ] 断网状态下点赞推文，数据存入 IndexedDB
- [ ] 恢复网络连接后，等待 30 秒
- [ ] 检查 Supabase 控制台，确认数据已上传
- [ ] IndexedDB 中对应记录 `synced` 字段变为 `true`

---

## 阶段三：数据库设计

### 步骤 3.1：创建推文主表

**指令：**
1. 在 Supabase SQL 编辑器中执行建表语句
2. 表名：`tweets`
3. 字段设计：
   - `id`: UUID, 主键, 默认 gen_random_uuid()
   - `tweet_id`: TEXT, 唯一索引, 不可空
   - `full_text`: TEXT
   - `user_screen_name`: TEXT
   - `user_name`: TEXT
   - `media_urls`: JSONB
   - `tweet_created_at`: TIMESTAMPTZ
   - `captured_at`: TIMESTAMPTZ, 默认 now()
   - `source`: TEXT (值: 'like' 或 'bookmark')
4. 在 `tweet_id` 上创建唯一索引

**验证测试：**
- [ ] 在 Supabase Table Editor 中看到 `tweets` 表
- [ ] 尝试插入一条测试数据，插入成功
- [ ] 尝试插入相同 `tweet_id` 的数据，报唯一约束错误
- [ ] 删除测试数据

---

### 步骤 3.2：启用 pgvector 扩展

**指令：**
1. 在 Supabase SQL 编辑器执行：`CREATE EXTENSION IF NOT EXISTS vector;`
2. 为 `tweets` 表添加向量字段：
   - 字段名：`embedding`
   - 类型：`vector(1536)` (对应 OpenAI 嵌入维度)
3. 创建 HNSW 索引加速向量搜索

**验证测试：**
- [ ] 执行 `SELECT * FROM pg_extension WHERE extname = 'vector';`，返回一行
- [ ] 查看 `tweets` 表结构，包含 `embedding` 字段
- [ ] 手动插入一条带向量的测试数据（1536 维零向量），无错误

---

### 步骤 3.3：创建标签表与关联表

**指令：**
1. 创建 `tags` 表：
   - `id`: SERIAL, 主键
   - `name`: TEXT, 唯一索引
2. 创建 `tweet_tags` 关联表：
   - `tweet_id`: UUID, 外键关联 tweets.id
   - `tag_id`: INT, 外键关联 tags.id
   - 联合主键: (tweet_id, tag_id)

**验证测试：**
- [ ] 两张表创建成功，在 Table Editor 可见
- [ ] 手动创建标签 "test-tag"
- [ ] 手动创建推文与标签的关联记录
- [ ] 查询关联关系正确

---

### 步骤 3.4：配置 Supabase Realtime

**指令：**
1. 在 Supabase 控制台启用 `tweets` 表的 Realtime 功能
2. 配置 Realtime 发布 INSERT 事件
3. 在 Next.js 中创建测试组件订阅实时变更

**验证测试：**
- [ ] 运行 Next.js 开发服务器，控制台显示 "Realtime connected"
- [ ] 在 Supabase 控制台手动插入一条推文
- [ ] Next.js 控制台实时打印新插入的推文数据

---

## 阶段四：前端基础架构

### 步骤 4.1：创建基础页面布局

**指令：**
1. 创建 `src/app/layout.tsx` 根布局
2. 配置全局样式：深色模式为默认
3. 创建三栏布局容器：
   - 左栏：固定宽度 64px (图标导航)
   - 中栏：flex-1 (主内容区)
   - 右栏：固定宽度 400px (详情抽屉，默认隐藏)

**验证测试：**
- [ ] 访问首页，看到三栏布局
- [ ] 背景为深色 (如 slate-900)
- [ ] 各栏宽度符合设计规范
- [ ] 响应式：小屏幕下侧边栏自动收起

---

### 步骤 4.2：创建导航侧边栏

**指令：**
1. 安装 `lucide-react` 图标库
2. 创建 `Sidebar` 组件
3. 添加以下导航图标：
   - 首页 (Home)
   - 收藏 (Bookmark)
   - 标签 (Tag)
   - 搜索 (Search)
   - 设置 (Settings)
4. 图标 stroke-width 设为 1.5px
5. 悬停时显示 tooltip 文字

**验证测试：**
- [ ] 侧边栏显示 5 个图标
- [ ] 图标细线风格 (1.5px)
- [ ] 鼠标悬停显示对应文字 tooltip
- [ ] 点击图标高亮当前选中状态

---

### 步骤 4.3：创建推文卡片组件

**指令：**
1. 创建 `TweetCard` 组件
2. 接收 props：`tweet` 对象
3. 布局规则：
   - 纯文推文 (<140字)：大字体，居中
   - 带图推文：图片置顶，文字在下
4. 元数据 (收藏数、点赞数) 默认隐藏，悬停显示
5. 添加微交互：悬停时卡片轻微上浮 (translateY -4px) 和阴影

**验证测试：**
- [ ] 使用模拟数据渲染纯文推文，字体居中放大
- [ ] 使用模拟数据渲染带图推文，图片在顶部
- [ ] 悬停卡片，元数据浮现
- [ ] 悬停时卡片有上浮动画

---

### 步骤 4.4：创建推文列表/网格布局

**指令：**
1. 创建 `TweetFeed` 组件
2. 从 Supabase 获取推文数据
3. 实现两种布局模式：
   - Bento Grid：固定列数网格
   - Masonry：瀑布流
4. 添加布局切换按钮
5. 实现无限滚动分页 (每页 20 条)

**验证测试：**
- [ ] 页面加载后显示推文列表
- [ ] 点击切换按钮，布局在 Grid 和 Masonry 之间切换
- [ ] 滚动到底部，自动加载更多
- [ ] 加载时显示骨架屏 (1.5 秒呼吸闪烁)

---

### 步骤 4.5：创建详情抽屉组件

**指令：**
1. 创建 `TweetDrawer` 组件
2. 点击卡片时从右侧滑入
3. 使用 Framer Motion 的 `layoutId` 实现卡片飞入动画
4. 显示完整推文内容、媒体、元数据
5. 点击遮罩层或按 ESC 关闭

**验证测试：**
- [ ] 点击卡片，抽屉从右侧滑出
- [ ] 卡片图片平滑过渡到抽屉中放大
- [ ] 抽屉显示完整推文信息
- [ ] 点击遮罩或按 ESC 正确关闭

---

## 阶段五：AI 集成 (可选基础版)

### 步骤 5.1：配置 OpenAI 客户端

**指令：**
1. 安装 `openai` npm 包
2. 在 `.env.local` 添加 `OPENAI_API_KEY`
3. 创建 `src/lib/openai.ts` 初始化客户端
4. 创建 API 路由 `/api/ai/embed` 用于生成向量

**验证测试：**
- [ ] 环境变量配置正确
- [ ] 调用 `/api/ai/embed` 传入测试文本
- [ ] 返回 1536 维向量数组
- [ ] 向量值在 -1 到 1 之间

---

### 步骤 5.2：实现自动嵌入管道

**指令：**
1. 创建 Supabase Edge Function 或 Next.js API 路由
2. 监听 `tweets` 表新增事件 (webhook 或轮询)
3. 对新推文的 `full_text` 生成嵌入向量
4. 更新对应记录的 `embedding` 字段

**验证测试：**
- [ ] 通过扩展点赞新推文
- [ ] 等待 5 秒后查询 Supabase
- [ ] 新推文的 `embedding` 字段不为空
- [ ] 向量维度为 1536

---

### 步骤 5.3：实现语义搜索 API

**指令：**
1. 创建 API 路由 `/api/search`
2. 接收搜索文本，生成查询向量
3. 使用 pgvector 余弦相似度匹配
4. 返回 Top 10 最相似的推文

**验证测试：**
- [ ] 搜索一个模糊词语 (如 "快速代码")
- [ ] 返回语义相关的推文 (可能不包含搜索词)
- [ ] 返回结果按相似度排序
- [ ] 响应时间 < 2 秒

---

## 阶段六：核心亮点功能

### 步骤 6.1：实现实况监控模块 (Pulse Monitor)

**指令：**
1. 创建 `PulseMonitor` 组件
2. 布局：固定在右上角
3. 组成元素：
   - 6px 绿色呼吸点 (CSS animation)
   - 单行等宽字体日志显示区
4. 订阅 Supabase Realtime
5. 收到新数据时滚动显示日志

**验证测试：**
- [ ] 组件在页面右上角可见
- [ ] 绿点有呼吸动画
- [ ] 静默时显示 "System Ready"
- [ ] 新推文入库时显示 `[INGEST] Tweet xxx... captured.`

---

### 步骤 6.2：实现 Command Palette

**指令：**
1. 安装 `cmdk` 包
2. 创建 `CommandPalette` 组件
3. 绑定快捷键 `Cmd/Ctrl + K` 打开
4. 实现基础指令：
   - 搜索推文
   - 切换主题
   - 切换布局
5. 模糊匹配指令名称

**验证测试：**
- [ ] 按 `Cmd/Ctrl + K` 打开命令面板
- [ ] 输入 "dark"，显示 "切换深色模式" 选项
- [ ] 选择并执行指令，功能生效
- [ ] 按 ESC 关闭面板

---

## 验证计划总览

### 自动测试
1. **单元测试**：使用 Vitest 测试核心工具函数
2. **组件测试**：使用 React Testing Library 测试交互组件
3. **E2E 测试**：使用 Playwright 测试关键用户流程

### 手动测试
1. 扩展功能需在 Chrome 浏览器中真实测试
2. Realtime 功能需模拟真实数据流
3. 用户体验需人工验收动画流畅度

---

> **注意**：本计划按依赖关系排序，建议按顺序完成。每个阶段完成后进行集成测试再进入下一阶段。
