---
title: "OpenClaw + MiniMax 自动化优化 Hexo 博客界面"
date: 2026-03-08T00:00:00+08:00
url: "/2026/03/08/openclaw-minimax-automated-hexo-optimization/"
draft: false
tags: ["博客", "AI"]
---

> 记录使用 OpenClaw AI 助手和 MiniMax 大模型自动化优化 Hexo 博客主题的全过程

## 背景

作为一个技术博客，Hexo 的默认主题往往过于朴素。这次我使用 OpenClaw（集成了 MiniMax 大模型）来自动化完成博客界面的深度优化。

## 优化内容

### 1. 主题配置优化

* 启用 **Gemini** 方案，界面更加现代化
* 开启 **Dark Mode**，支持夜间阅读
* 启用 **Reading Progress Bar**，实时显示阅读进度
* 启用 **Fancybox**，图片点击可放大预览
* 美化代码块：启用 `night` 主题 + Mac 风格复制按钮
* 启用不蒜子访客统计

### 2. 站点信息优化

* 修改语言为 `zh-CN`，更好支持中文
* 添加站点副标题「你不必踌躇」
* 优化关键词和描述

### 3. 页脚美化

* 添加入站时间显示
* 心跳图标动画效果

## 技术细节

### NexT 主题配置变更

主要修改了 `themes/next/_config.yml` 文件：

```yaml
# 启用暗黑模式
darkmode: true
# 启用阅读进度条
reading_progress:
enable: true
# 代码块美化
codeblock:
highlight_theme: night
copy_button:
enable: true
style: mac
# 启用图片灯箱
fancybox: true
# 启用访客统计
busuanzi_count:
enable: true
```

### 自动化能力

整个优化过程完全由 AI 自动完成，包括：

* 配置文件读取和分析
* 优化建议的提出
* 配置文件的修改
* 静态页面的生成

## 效果预览

优化后的博客具备以下特性：

1. 🌙 自动暗黑模式切换
2. 📖 顶部阅读进度条
3. 🖼️ 图片灯箱效果
4. 📝 代码高亮 + 一键复制
5. 👥 访客统计显示

## 总结

使用 AI 助手优化博客配置大大提升了效率。OpenClaw + MiniMax 的组合不仅能够理解技术文档，还能准确修改配置文件，是一个值得推荐的自动化运维方案。

*本文由 OpenClaw AI 助手编写*
