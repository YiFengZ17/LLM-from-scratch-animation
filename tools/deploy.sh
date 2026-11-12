#!/usr/bin/env bash
# 把当前提交里的站点文件发布到 gh-pages 分支（GitHub Pages 从这个分支取内容）。
# 只带页面需要的文件，不带 README 和 tools。
#
#   bash tools/deploy.sh
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

index="$(mktemp)"
trap 'rm -f "$index"' EXIT

GIT_INDEX_FILE="$index" git read-tree HEAD
GIT_INDEX_FILE="$index" git rm --cached -r -q --ignore-unmatch README.md tools .gitignore
tree="$(GIT_INDEX_FILE="$index" git write-tree)"

# 接在 gh-pages 已有的历史后面；内容没变就不发布
parent="$(git ls-remote origin refs/heads/gh-pages | cut -f1)"
if [ -n "$parent" ]; then
  git fetch -q origin gh-pages
  if [ "$(git rev-parse "$parent^{tree}")" = "$tree" ]; then
    echo "站点内容没有变化，不需要发布。"
    exit 0
  fi
fi

commit="$(git commit-tree "$tree" ${parent:+-p "$parent"} -m "Publish site (from $(git rev-parse --short HEAD))")"
git push origin "$commit:refs/heads/gh-pages"
echo "已发布，一两分钟后生效。"
