---
title: "从 Hexo 到 Hugo：博客深度重构实录"
date: 2026-05-18T00:00:00+08:00
url: "/2026/05/18/blog-migration-hexo-to-hugo/"
draft: false
tags: ["博客", "AI"]
description: "记录将博客从 Hexo NexT 迁移到 Hugo 自研主题的全过程，涵盖设计系统搭建、内容迁移、标签体系重归类与自动化部署。"
---

## 背景

博客从 2021 年起一直运行在 Hexo + NexT 主题上，整体效果不算差，但几个痛点逐渐积累：

* NexT 主题配置项虽多，但视觉上难以摆脱"同质化"的模板感
* Hexo 的构建速度在文章增多后明显变慢（全量生成 20+ 篇需数秒）
* 想加暗色模式、响应式断点、full-bleed 代码块等功能时，叠加 patch 的方式越来越脆弱
* post-asset 图片引用路径与主题耦合，迁移困难

最终决定：**不修修补补，直接切到 Hugo，并从零设计一个属于自己的主题。**

## 为什么选 Hugo

* **构建速度**: Go 编写的 Hugo，全站 50+ 页构建在 300ms 以内
* **单一二进制**: 无 Node.js 依赖，`hugo` 一个命令走天下
* **Image processing 内置**: WebP 转换、srcset 生成原生支持
* **内容组织灵活**: `content/posts/slug/index.md` 的 page bundle 模式天然隔离文章资源

## Zenith 主题设计

### 配色系统

放弃纯黑白高对比路线。亮色模式用了 **暖白底 `#FAF9F6`** 配 **陶土橙强调色 `#D95D39`**，暗色模式用 `#0F0F0F` 底配提亮的 `#E89F80`。所有颜色通过 CSS custom properties 分发，切换时 0.3s ease-in-out 过渡，不闪白。

### 字体策略

* 标题: **Noto Serif SC** + **Playfair Display** 混排，给技术博客注入杂志感
* 正文: **Noto Sans SC**，18px / 行高 1.8，保证长文可读性
* 代码: **JetBrains Mono** + ligature

### 响应式容器

不写死 `720px` 正文宽度，用断点自适应：

| 断点 | 正文宽度 |
| --- | --- |
| >1440px | 820px + 右侧 280px 目录 |
| 1024-1440px | min(90vw, 760px) |
| 768-1024px | 92vw |
| <768px | 100%, padding 18px |

代码块在桌面端适度突破正文容器限制，但严格 `max-width: 820px`，拒绝全屏霸占。

### 暗色模式

三线保障：CSS 变量切换（手动 toggle）→ `prefers-color-scheme` 媒体查询（自动跟随系统）→ `localStorage` 持久化。切换按钮常驻导航栏右上角。

## 内容迁移

### 标签重归类

旧博客标签混乱，不少文章甚至没有标签。迁移时按内容梳理出 5 个核心标签：

| 标签 | 文章数 |
| --- | --- |
| 数据结构与算法 | 8 |
| C/C++ | 6 |
| Linux 内核 | 4 |
| 设计模式 | 2 |
| 嵌入式 | 1 |
| AI | 2 |
| 博客 | 3 |

其中 AI 和博客是新增标签，归类了 OpenClaw + MiniMax 自动化优化和 V2 深度优化两篇涉及 AI 辅助开发的文章。

### 图片路径修复

Hexo 的 `hexo-asset-image` 插件允许 `./post-name/image.png` 形式的引用。Hugo 的 page bundle 模式下图片和 `index.md` 同级，引用直接写 `./image.png`。写了个脚本把所有文章的图片引用做了批量修正。

### 日期格式

Hexo 部分旧文章日期用了 `2021-9-16` 的单数字月份格式，Hugo 严格校验要求 `2021-09-16`。迁移时手动修复了所有异常日期。

## 代码块踩坑

Hugo 的 Chroma 高亮在开启行号时用 `<table>` 渲染，行号列和代码列的 `text-align`、`width` 在 table-layout 下的行为不一致，来回改了好几版。

最终的方案很直接：**关掉行号**，生成纯净的 `<pre><code>` 结构，行号不要了。语法高亮用两套 Chroma 主题——亮色 GitHub、暗色 Monokai，分别 scoped 到对应模式。

一个教训：**简单结构比复杂配置更可靠。**

## 部署

两个分支策略：

* **`main`**: Hugo 源码 + 主题 + 文章
* **`master`**: `hugo --minify` 构建产物，直接 force-push

GitHub Pages 从 `master` 渲染，更新文章就是一行：

```bash
bash deploy.sh
```

## 回顾

整个过程大约花了两天，从设计系统到写主题模板到内容迁移到部署调试。最大的感受是：**自研主题的好处不在于"炫技"，而在于对未来每一处细节都有控制权。** 加功能不用再绕三方主题的配置项，直接改自己的 CSS / layout 就行。

如果你也在考虑做类似的迁移，我的建议是：先把设计规范写清楚（哪怕是给自己看的 bullet points），再动手写代码。设计阶段做的每一个颜色、字体、间距决策，都会在后续开发中省下大量犹豫和返工的时间。
