# Bevis Wang 博客源码（Hugo + Zenith 主题）

GitHub Pages 站点：https://wangbi0912.github.io/
仓库分支策略：`main` = 站点源码（本目录），`master` = `hugo --minify` 构建产物（GitHub Pages 从 master 渲染）。

## 写新文章

```bash
hugo new posts/my-new-post/index.md   # 生成 page bundle
```

front matter 示例：

```yaml
---
title: "文章标题"
date: 2026-10-21T20:00:00+08:00
tags: ["C/C++"]
description: "可选：列表页摘要，不写则自动截取正文开头"
draft: false
---
```

图片直接放进 `content/posts/my-new-post/`，正文里用 `![说明](./image.png)` 引用即可。
文章 URL 默认 `/年/月/日/标题slug/`，与历史文章保持一致。

## 本地预览

```bash
hugo server -D        # http://localhost:4000  (-D 显示草稿)
```

## 构建与发布

```bash
./deploy.sh           # hugo --minify → 同步到 ../github_blogs/wangbi0912.github.io → 推送 master
```

本机 Hugo 二进制在 `D:/AI_blogs/tools/hugo/hugo.exe`（未加入 PATH 时可用 `HUGO=.../hugo.exe ./deploy.sh`）。

## 目录

- `content/posts/` 25 篇文章（page bundle，含图片）
- `content/about/`、`content/archives/`、`content/categories/` 独立页面
- `themes/zenith/` 自研主题（layouts + 复用线上 CSS/JS bundle）
- `static/` favicon 等站点级静态文件
