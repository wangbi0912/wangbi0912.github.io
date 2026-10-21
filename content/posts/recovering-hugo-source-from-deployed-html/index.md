---
title: "源码丢失之后：从部署产物逆向重建 Hugo 博客工程"
date: 2026-10-21T12:00:00+08:00
url: "/2026/10/21/recovering-hugo-source-from-deployed-html/"
draft: false
tags: ["博客", "AI"]
description: "GitHub Pages 上只剩构建产物、Hugo 源码不翼而飞，博客变成只能看不能改。记录一次从线上 HTML 反推主题模板、回收 25 篇文章、逐页 diff 验证并重新双分支部署的完整过程。"
---

## 事故现场：一个"能看不能改"的博客

博客跑了五年，某天想发新文章，打开本地目录却发现一件尴尬的事：

* `blogs/` 里躺着的是 **Hexo** 时代的源码，停在 19 篇（2021–2022）
* GitHub Pages 仓库 `wangbi0912.github.io` 里，两个分支都只有 **构建后的 HTML**
* 而线上实际在跑的，是一个标题叫 *Bevis Wang*、共 25 篇的 **Hugo** 站点

也就是说：**源码丢了，只剩产物。** 想把新文章发上去，要么手工改 HTML，要么推翻重来。

这篇文章记录怎么把这套工程从"线上死页面"还原成一个活的、能继续写作的 Hugo 源码仓库。

## 一、动手之前：先搞清楚线上跑的到底是什么

最容易犯的错，是默认"本地源码 = 线上站点"，然后直接 `hexo deploy`。这一步足以把整个线上站覆盖成一套旧模板——不可逆。

所以第一步永远是**读产物的指纹**：

```bash
grep -oE 'generator[^>]*' index.html
# <meta name=generator content="Hugo 0.161.1">
```

一行就真相大白：这是 **Hugo 0.161.1**，不是 Hexo。后面的判断全部基于这个事实：

| 维度 | 本地 Hexo 源码 | 线上产物 |
| --- | --- | --- |
| 生成器 | Hexo + NexT | Hugo 0.161.1 |
| 标题 | 小王的Blog | Bevis Wang |
| 文章数 | 19 | 25（多出 2025/2026 的 6 篇） |
| 语言 | en | zh-CN |

顺带确认 GitHub 仓库的分支情况：

```bash
git ls-tree --name-only origin/main    # 内容与 master 完全一致
git log origin/main --oneline -1       # 和 master 是同一个 commit
```

结论很明确：**main 和 master 都是产物，源码从来没被推上去过。** 也解释了为什么"丢一个 .md 就能发文"的工作流会断掉——不是工具坏了，是源头没了。

## 二、从 HTML 反推主题：把 DOM 骨架打印出来

没有源码，就得从产物里把模板结构抠出来。用到的办法很朴素：写个 `HTMLParser`，把每个页面的标签 + class 按缩进打印成一棵树，只看骨架、不看文字。

```python
import html.parser

class Skeleton(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.depth = 0
        self.out = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self.skip += 1
        if self.skip:
            return
        cls = dict(attrs).get("class", "")
        self.out.append("  " * self.depth + f"<{tag} class={cls}>")
        if tag not in ("br", "img", "input", "meta", "link", "hr"):
            self.depth += 1

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.skip -= 1
            return
        if self.skip or tag in ("br", "img", "input", "meta", "link", "hr"):
            return
        self.depth -= 1
        self.out.append("  " * self.depth + f"</{tag}>")

    def handle_data(self, data):
        if not self.skip and data.strip():
            self.out.append("  " * self.depth + "#: " + data.strip()[:70])
```

对 `index.html` / `posts/index.html` / 文章页 / `archives` / `tags` / `series` / `404` 各跑一遍，主题的结构就基本还原了：

```
<main class=main>
  <div class=content-grid>
    <article class=post>
      <header class=post-header>
        <h1 class=post-header__title>
        <div class=post-header__meta>
      <div class=post-content>
      <nav class=toc--sidebar>
```

再配合产物里的 `css/bundle.min.<hash>.css` 和 `js/main.min.<hash>.js`，主题的两个关键素材已经到手。做法上有个取巧但很值的决定：

> **CSS/JS 直接原样复用线上 bundle，连文件名带 hash 都不改。**

这样重建出来的主题，视觉上不可能和线上有偏差——样式根本不是"重写"的，就是原来那一份。

## 三、内容回收：两条路径

25 篇文章要回到 markdown，走了两条完全不同的路。

### 路径 A：19 篇老文 —— Hexo 源文直接搬家

`blogs/source/_posts/*.md` 还在，正文是完整的。要处理的只有三件事：

1. **标签重归类**：Hexo 时期的标签太碎，按线上的体系重映射到 `数据结构与算法 / C-C++ / Linux 内核 / 设计模式 / 嵌入式 / 博客 / AI`
2. **日期补零**：Hexo 容忍 `2021-9-16`，Hugo 不认，必须写成 `2021-09-16T...`
3. **图片迁移**：`asset_img` 和同名资源目录里的图片，拷进 Hugo 的 page bundle

```text
content/posts/二叉搜索树一/
├── index.md
└── 230.png          # 正文里用 ./230.png 引用
```

### 路径 B：6 篇新文 —— 从 HTML 反转 Markdown

2025/2026 那 6 篇从来没有源码，正文只存在于 HTML 里。用 `markdownify` 配合 `BeautifulSoup` 把 `div.post-content` 转回去，但有两个坑必须单独处理。

**坑一：代码高亮块。** 产物里代码块是 chroma 生成的一堆 `<span class=line>`，直接转 markdown 会得到一坨乱码。要先把它们还原成围栏代码块：

```python
import html as H, re

def pre_to_fence(m):
    lang = re.search(r"class=language-([a-zA-Z0-9+#]+)", m.group(1))
    code = H.unescape(re.sub(r"<[^>]+>", "", m.group(2))).rstrip("\n")
    return "\n\n```" + (lang.group(1) if lang else "") + "\n" + code + "\n```\n\n"

frag = re.sub(
    r'<div class=highlight><pre[^>]*>(<code[^>]*)?>([\s\S]*?)(</code>)?</pre></div>',
    pre_to_fence, frag)
```

**坑二：转义残留。** `markdownify` 会把代码里的 `*` `_` `[` 加上反斜杠，在代码块里这些反斜杠会原样显示出来。按围栏切分后单独清洗：

```python
parts = re.split(r"(```[\s\S]*?```)", s)
for i, p in enumerate(parts):
    if p.startswith("```"):
        parts[i] = re.sub(r"\\([_*\[\]`])", r"\1", p)
```

还有一个真实存在的老 bug 顺便被修掉了：好几篇文章正文顶部残留着一个 `## draft: false` 标题——显然是当初用脚本批量生成 front matter 时，YAML 被当成正文渲染了。这次一并清掉，线上才真正干净。

## 四、URL 必须锁死

重建工程最怕的是：页面长得一模一样，但 URL 变了，五年的外链和搜索引擎收录全废。

所以每篇文章都在 front matter 里显式写死路径：

```yaml
---
title: "从 Hexo 到 Hugo：博客深度重构实录"
date: 2026-05-18T00:00:00+08:00
url: "/2026/05/18/blog-migration-hexo-to-hugo/"
draft: false
tags: ["博客", "AI"]
---
```

配合 `hugo.toml` 的 permalinks 兜底：

```toml
[permalinks]
  posts = "/:year/:month/:day/:slug/"
```

## 五、验证不能靠"看起来差不多"

`hugo --minify` 构建出 55 页之后，做两轮自动对比，而不是肉眼看。

**第一轮：DOM 骨架对比。** 把两个站点同名 HTML 的标签序列抽出来做 diff，结构不一致的直接暴露。

**第二轮：可见文本对比。** 剥掉所有标签和 script/style，只留文本行，逐行 diff：

```python
def text_lines(path):
    s = open(path, encoding="utf-8").read()
    s = re.sub(r"<(script|style)[\s\S]*?</\1>", "", s)
    s = re.sub(r"<[^>]+>", "\n", s)
    return [l.strip() for l in s.split("\n") if l.strip()]
```

这一轮挖出了四个真问题：

| 问题 | 修正 |
| --- | --- |
| 首页/归档把「关于」页当文章列出来了 | 列表数据源改为 `.Site.RegularPages`，排除 page 类型 |
| 缺 `/categories/` 页（线上有，重建后 404） | 补 `content/categories/_index.md` |
| 列表页摘要长度与线上不一致 | 按需取 `Description` / `Summary`，截断长度对齐 |
| 标签云排序不一致 | `taxonomy` 模板改用 `ByCount` 后再按名称稳定排序 |

剩下的差异都是无害的：emoji 被压缩成 HTML 实体（渲染结果相同）、字数统计少 2（正是被删掉的那个 `draft: false`）。

最后补一个 `static/.nojekyll`，避免 GitHub Pages 的 Jekyll 处理吃掉下划线开头的目录。

## 六、双分支部署：源码和产物各归其位

这次把仓库结构定死，避免重蹈覆辙：

```text
wangbi0912.github.io
├── main   → Hugo 源码（content / themes / hugo.toml / deploy.sh）
└── master → 构建产物（GitHub Pages 实际托管）
```

发布收拢成一个脚本，一条命令走完构建 → 覆盖 → 提交 → 推送：

```bash
#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

hugo --minify
rsync -a --delete public/ ../github_blogs/wangbi0912.github.io/

cd ../github_blogs/wangbi0912.github.io
git add -A
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M')"
git push origin master
```

## 复盘：三条用教训换来的经验

1. **产物不是备份。** GitHub Pages 上的 HTML 只能保证"网站还在"，保证不了"还能写"。源码必须单独进版本库，且与产物分支分开。
2. **迁移的第一件事是确认事实，不是执行操作。** 如果当时直接 `hexo deploy`，线上 6 篇新文章和整套 Hugo 主题会当场消失。花五分钟读一个 `generator` meta，省掉一次不可逆事故。
3. **验证要自动化对比，不要肉眼看。** 结构 diff + 文本 diff 两条脚本，比"我翻了几页觉得挺像"可靠得多，也正是它们抓出了 categories 页缺失这类肉眼很难发现的问题。

现在发文流程回到了最初想要的样子：往 `content/posts/<slug>/index.md` 丢一个 markdown，图片放同目录，然后 `./deploy.sh`。

## 附：本次重建的工程清单

```text
hugo_blog/
├── hugo.toml                    # 站点配置、多语言、permalinks、outputs
├── content/
│   ├── posts/<slug>/index.md    # 25 篇文章（page bundle）
│   ├── about/  archives/  categories/
├── themes/zenith/
│   ├── layouts/                 # baseof / index / list / single / terms / 404 / index.json
│   │   └── partials/            # nav / footer / post-card / pagination / schema / critical-css
│   └── static/{css,js}/         # 复用线上 bundle（含 hash 文件名与 SRI）
├── static/                      # favicon、.nojekyll
└── deploy.sh
```

站点标题、文章 URL、CSS/JS、暗色模式、搜索索引、目录、相关文章——全部与重建前保持一致。唯一的区别是：现在它又能写了。
