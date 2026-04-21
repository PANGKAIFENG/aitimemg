#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
REPO_DIR="$(dirname "$APP_DIR")"

require_clean_git_state() {
  if [[ -n "${ALLOW_DIRTY_RELEASE:-}" ]]; then
    return
  fi

  if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "❌ 发布被阻止：当前工作区存在未提交改动。请先提交或清理后再发版。"
    exit 1
  fi

  if [[ -n "$(git ls-files --others --exclude-standard)" ]]; then
    echo "❌ 发布被阻止：当前工作区存在未跟踪文件。请先确认是否应纳入版本控制。"
    exit 1
  fi
}

ensure_main_branch() {
  local current_branch
  current_branch="$(git branch --show-current)"
  if [[ "$current_branch" != "main" ]]; then
    echo "❌ 发布被阻止：当前分支是 '$current_branch'，只能从 main 发布。"
    exit 1
  fi
}

ensure_synced_with_origin_main() {
  if ! git remote get-url origin >/dev/null 2>&1; then
    return
  fi

  git fetch origin main --quiet || true

  local local_sha remote_sha
  local_sha="$(git rev-parse HEAD)"
  remote_sha="$(git rev-parse origin/main 2>/dev/null || true)"

  if [[ -n "$remote_sha" && "$local_sha" != "$remote_sha" && -z "${ALLOW_AHEAD_RELEASE:-}" ]]; then
    echo "❌ 发布被阻止：本地 main 与 origin/main 不一致。请先 pull / push 并确认合并完成。"
    echo "   local : $local_sha"
    echo "   remote: $remote_sha"
    exit 1
  fi
}

main() {
  cd "$REPO_DIR"

  ensure_main_branch
  require_clean_git_state
  ensure_synced_with_origin_main

  local commit_sha
  commit_sha="$(git rev-parse --short HEAD)"

  echo "🚀 准备从 main 发布前端"
  echo "🔖 commit: $commit_sha"

  cd "$APP_DIR"
  npm run build
  node scripts/deploy-oss.cjs

  echo
  echo "✅ 前端发布完成"
  echo "🔖 release commit: $commit_sha"
  echo "🌐 请访问 https://www.aitimemg.cn/app 做线上验证"
}

main "$@"
