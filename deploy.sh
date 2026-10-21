#!/usr/bin/env bash
# 构建并把产物推送到 wangbi0912.github.io 的 master 分支（GitHub Pages 从 master 渲染）
set -e
cd "$(dirname "$0")"
HUGO="${HUGO:-hugo}"
$HUGO --minify
DEPLOY_DIR="${DEPLOY_DIR:-../github_blogs/wangbi0912.github.io}"
rsync -a --delete --exclude='.git' public/ "$DEPLOY_DIR"/
cd "$DEPLOY_DIR"
git add -A
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M')" || echo "nothing to commit"
git push origin master
