#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: bash scripts/worktree-new-feature.sh <feature-slug>"
  echo "Example: bash scripts/worktree-new-feature.sh daily-plan-reminder"
  exit 1
fi

slug="$1"

if [[ ! "$slug" =~ ^[a-z0-9-]+$ ]]; then
  echo "Feature slug must use lowercase letters, digits, and hyphens only."
  exit 1
fi

common_git_dir="$(git rev-parse --path-format=absolute --git-common-dir)"
repo_root="$(dirname "$common_git_dir")"
project_name="$(basename "$repo_root")"
base_dir="$HOME/.config/superpowers/worktrees/$project_name"
main_path="$base_dir/main"
branch_name="feature/$slug"
feature_path="$base_dir/feature-$slug"

mkdir -p "$base_dir"

echo "== Repo =="
echo "$repo_root"
echo

echo "== Fetch latest =="
git -C "$repo_root" fetch origin --prune
echo

if [[ ! -d "$main_path/.git" && ! -f "$main_path/.git" ]]; then
  echo "== Create clean main worktree =="
  git -C "$repo_root" worktree add "$main_path" main
  echo
fi

if git -C "$repo_root" show-ref --verify --quiet "refs/heads/$branch_name"; then
  echo "Local branch already exists: $branch_name"
  exit 1
fi

if [[ -e "$feature_path" ]]; then
  echo "Target worktree path already exists: $feature_path"
  exit 1
fi

echo "== Create feature worktree =="
git -C "$repo_root" worktree add "$feature_path" -b "$branch_name" origin/main
echo

echo "== Result =="
echo "Branch: $branch_name"
echo "Path:   $feature_path"
echo

echo "Next:"
echo "  cd \"$feature_path\""
echo "  git status"
