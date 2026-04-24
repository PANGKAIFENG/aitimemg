---
description: 为一个新需求创建干净的 feature worktree，并返回后续开发入口
---

# /start-feature

## 目标

- 不在脏工作区里直接切新分支
- 从 `origin/main` 创建一个干净的新需求工位
- 让用户直接拿到可进入开发的路径和分支名

## 何时使用

- 准备正式开始一个新需求
- 当前主工作区已经很脏，不想把旧改动混进新需求
- 想让“开工”动作变成固定流程，而不是临时手敲 Git 命令

## 必读对象

运行本命令时，优先读取：

1. `AGENTS.md`（如果存在）否则读 `CLAUDE.md`
2. `.honeycomb/capabilities-local/worktree-playbook.md`
3. `docs/PROJECT/需求开发操作手册.md`

## 输入约束

默认要求用户提供一个 `feature slug`。

slug 规则：

- 只能用小写字母、数字、短横线
- 不要带空格
- 不要带中文

例如：

- `daily-plan-reminder`
- `coach-review-panel`
- `sidebar-refactor`

## 执行步骤

1. 先运行：

```bash
bash scripts/worktree-status.sh
```

2. 再运行：

```bash
bash scripts/worktree-new-feature.sh <slug>
```

3. 返回结果时，至少说明：

- 新分支名
- 新工位路径
- 下一步进入哪个目录
- 下一步应该先做 PRD、代码，还是验证

## 输出格式

默认输出 3 个部分：

### 1. Current State

- 当前 worktree 情况
- 当前主工作区是否很脏

### 2. Created Feature Workspace

- 分支名
- 路径
- 是否已基于 `origin/main`

### 3. Next Step

明确告诉用户下一步执行什么，例如：

- `cd <path>`
- `git status`
- 先补 PRD
- 先开始代码开发

## 默认动作边界

- 不要擅自处理旧脏工位的改动
- 不要为了开新需求去清理用户已有工作区
- 如果 slug 非法，要先指出问题
- 如果本地已存在同名分支或同名工位，要直接报冲突，不要覆盖

## 成功标准

执行完 `/start-feature` 后，用户应该清楚：

1. 新需求应该在哪个目录里做
2. 新需求对应哪个 feature 分支
3. 当前旧工作区为什么不该继续直接用
