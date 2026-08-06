# 用户脚本

此目录包含两个 Tampermonkey/Violentmonkey 用户脚本，分别针对 X (Twitter) 和哔哩哔哩 (B站)。

---

## x-quick-link.user.js

**功能**：在 X (Twitter) 每条推文的分享按钮旁新增「打开」和「复制链接」两个按钮，一键跳转或复制推文永久链接。

**适用页面**：
- `https://twitter.com/*`
- `https://x.com/*`
- `https://mobile.twitter.com/*`

**实现要点**：
- 通过 `MutationObserver` 监听动态加载的推文流，自动为新渲染的推文注入按钮
- 定位分享按钮的容器（`button[aria-haspopup="menu"]:not([data-testid])`），在其父级旁插入自定义按钮
- 从 `<time>` 元素的祖先 `<a>` 提取推文 URL，拼接为 `https://x.com{href}`
- 复制功能使用 `navigator.clipboard.writeText`，失败时降级到控制台报错
- 无任何 `@grant` 权限，纯 DOM 操作，体积极小（约 2 KB）

---

## bili-are-you-robot.js

**功能**：在 B 站粉丝列表、关注列表、私信点赞列表页面，对用户进行人机/低活跃度粗略检测，并在用户名旁打标签：**R (人机疑似)** / **H (活人)** / **少动态**。

**适用页面**：
- `https://space.bilibili.com/*/relation/fans*` —— 粉丝列表
- `https://member.bilibili.com/platform/fans/manage*` —— 粉丝管理
- `https://message.bilibili.com/*` 及 `#/love/{动态号}` —— 私信/点赞列表

**检测逻辑（分层 + 缓存）**：
1. **必查**：调用动态接口 `x/polymer/web-dynamic/v1/feed/space` 获取用户最近动态数、昵称、头像、关注数
2. **条件补查**：仅当动态数 < 5 时，并发请求追番数 (`bangumi`) 与收藏夹数 (`fav`) 以节省配额
3. **规则判定**：
   - 昵称以 `bili_` 开头 → **高疑似 (R)**
   - 有追番或收藏 → **活人 (H)**
   - 动态 ≥ 5 → **活人 (H)**
   - 动态 1~4 且无追番/收藏 → **少动态 (R)**
   - 动态 = 0 且无追番/收藏 → **高疑似 (R)**
4. **缓存机制**：内存 Map + `GM_setValue` 持久化（24 小时 TTL），跨页面刷新保留结果，避免重复请求触发风控
5. **限频与退避**：请求间隔 ≥ 1.5s，遇 `-799`/`412` 触发指数退避（最长 60s）

**UI 面板**：
- 固定右侧悬浮面板，显示「已扫描 / 人机 / 少动态 / 失败」四项统计
- 「开始检测 / 停止检测」按钮控制自动轮询（默认 5s 间隔）
- 「清除缓存」按钮一键重置本地存储与内存缓存
- 支持最小化折叠

**依赖 GM API**：
- `GM_xmlhttpRequest` 跨域请求 B 站接口
- `GM_getValue` / `GM_setValue` 持久化缓存与统计
- `GM_addStyle` 注入面板样式

---

## 安装方式

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/) 扩展
2. 将对应 `.user.js` / `.js` 文件拖入扩展管理页，或点击 Raw 链接直接安装
3. 刷新目标网站即可生效