# Worktree Playbook

## 作用

这是 Temporal 项目的项目私有 worktree 能力说明。

目标是让 AI 或人类在处理这些请求时，有固定执行口径：

- “我要开始一个新需求”
- “现在有哪些 worktree”
- “当前有没有没收口的工位”
- “帮我开一个干净的新功能工位”

## 适用范围

- 当前项目：`时间管理 / Temporal`
- 当前仓库：`PANGKAIFENG/aitimemg`

## 固定执行原则

1. 默认不在脏工作区直接开新需求
2. 默认先看 `git worktree list`、`git branch -vv`、`git stash list`、`git status`
3. 默认把干净基线放在：
   - `~/.config/superpowers/worktrees/时间管理/main`
4. 默认把新需求工位放在：
   - `~/.config/superpowers/worktrees/时间管理/feature-<slug>`
5. 默认从 `origin/main` 起新需求分支
6. 默认不擅自处理旧脏工位里的改动

## 推荐入口命令

### 看当前 worktree 和脏状态

```bash
cd /Users/linctex/Desktop/vibe/时间管理
bash scripts/worktree-status.sh
```

### 新建一个 feature 工位

```bash
cd /Users/linctex/Desktop/vibe/时间管理
bash scripts/worktree-new-feature.sh daily-plan-reminder
```

## 处理“我要开始新需求”类请求的推荐步骤

1. 先运行 `bash scripts/worktree-status.sh`
2. 判断当前主工作区是否很脏
3. 如果主工作区不干净，不在原目录继续做新需求
4. 用 `bash scripts/worktree-new-feature.sh <slug>` 新开工位
5. 进入新工位后再开始 PRD、代码、验证

## 不要做的事

- 不要在旧脏工位里直接切新分支做新需求
- 不要把多个需求混在一个 worktree 里
- 不要把 `worktree list` 干净误认为当前目录也干净
- 不要未经确认就清理用户旧工位里的未提交改动

## 定位

这份文件是项目私有的 `skill / playbook`。

如果未来多个项目都会复用这套模式，再考虑把它上收成 Honeycomb 共享能力。
