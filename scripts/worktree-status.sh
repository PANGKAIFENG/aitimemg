#!/usr/bin/env bash

set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"

echo "== Repo =="
echo "$repo_root"
echo

echo "== Worktrees =="
git -C "$repo_root" worktree list
echo

echo "== Branches =="
git -C "$repo_root" branch -vv
echo

echo "== Stash =="
git -C "$repo_root" stash list || true
echo

echo "== Current Worktree Status =="
git -C "$repo_root" status --short --branch
echo

echo "== Per-worktree Status =="
git -C "$repo_root" worktree list --porcelain | awk '/^worktree /{print $2}' | while read -r wt; do
  echo "----- $wt -----"
  git -C "$wt" status --short --branch || true
  echo
done
