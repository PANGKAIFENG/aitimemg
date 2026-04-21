#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
REPO_DIR="$(dirname "$APP_DIR")"
ARTIFACT_PATH="$APP_DIR/temporal-api-fixed.zip"
MANIFEST_DIR="$APP_DIR/release-artifacts"
MANIFEST_PATH="$MANIFEST_DIR/backend-release-manifest.json"

require_clean_git_state() {
  if [[ -n "${ALLOW_DIRTY_RELEASE:-}" ]]; then
    return
  fi

  if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "❌ 后端发布准备被阻止：当前工作区存在未提交改动。"
    exit 1
  fi

  if [[ -n "$(git ls-files --others --exclude-standard)" ]]; then
    echo "❌ 后端发布准备被阻止：当前工作区存在未跟踪文件。"
    exit 1
  fi
}

ensure_main_branch() {
  local current_branch
  current_branch="$(git branch --show-current)"
  if [[ "$current_branch" != "main" ]]; then
    echo "❌ 后端发布准备被阻止：当前分支是 '$current_branch'，只能从 main 准备发布包。"
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
    echo "❌ 后端发布准备被阻止：本地 main 与 origin/main 不一致。"
    echo "   local : $local_sha"
    echo "   remote: $remote_sha"
    exit 1
  fi
}

write_manifest() {
  local commit_sha commit_full built_at
  commit_sha="$(git rev-parse --short HEAD)"
  commit_full="$(git rev-parse HEAD)"
  built_at="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

  mkdir -p "$MANIFEST_DIR"
  cat > "$MANIFEST_PATH" <<EOF
{
  "service": "temporal-api",
  "artifact": "temporal-api-fixed.zip",
  "commit_sha_short": "$commit_sha",
  "commit_sha": "$commit_full",
  "built_at_utc": "$built_at"
}
EOF
}

main() {
  cd "$REPO_DIR"

  ensure_main_branch
  require_clean_git_state
  ensure_synced_with_origin_main

  echo "📦 准备从 main 构建后端发布包"
  bash "$SCRIPT_DIR/build-api.sh"
  write_manifest

  echo
  echo "✅ 后端发布包已生成"
  echo "📦 artifact: $ARTIFACT_PATH"
  echo "🧾 manifest: $MANIFEST_PATH"
  echo "👉 下一步：去阿里云 FC 控制台上传该 zip，并记录对应 commit SHA"
}

main "$@"
