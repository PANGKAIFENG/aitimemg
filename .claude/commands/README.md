# Commands

当前项目新增的 worktree 相关命令：

- `start-feature.md`
- `worktree-status.md`

说明：

1. `/start-feature` 负责从 `origin/main` 开一个干净的新需求工位
2. `/worktree-status` 负责汇总当前 worktree、分支、stash 和脏状态

这两个命令的底层真相源是：

- `.honeycomb/capabilities-local/worktree-playbook.md`
- `scripts/worktree-status.sh`
- `scripts/worktree-new-feature.sh`
