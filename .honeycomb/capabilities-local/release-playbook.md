# Release Playbook

## 作用

这是 Temporal 项目的项目私有发布能力说明。

目标是让 AI 或人类在处理这些请求时，有固定执行口径：

- “准备发版”
- “走一遍发布流程”
- “确认现在能不能上线”
- “帮我检查 GitHub review -> merge -> release 这条链”

## 适用范围

- 当前项目：`时间管理 / Temporal`
- 当前仓库：`PANGKAIFENG/aitimemg`

## 入口文档

处理发布相关请求时，优先读取：

1. [研发流程与发布规范.md](/Users/linctex/Desktop/vibe/时间管理/docs/PROJECT/研发流程与发布规范.md:1)
2. [GitHub仓库设置操作清单.md](/Users/linctex/Desktop/vibe/时间管理/docs/PROJECT/GitHub仓库设置操作清单.md:1)
3. [发布Runbook.md](/Users/linctex/Desktop/vibe/时间管理/docs/PROJECT/发布Runbook.md:1)

## 固定执行原则

1. 默认认为 `main` 是生产真相源
2. 默认不允许从功能分支直接发布
3. 默认先检查工作区是否干净
4. 默认先检查本地 `main` 是否与 `origin/main` 一致
5. 发布前必须先过最小验证

## 前端发布命令

```bash
cd /Users/linctex/Desktop/vibe/时间管理/temporal
bash scripts/release-frontend-from-main.sh
```

## 后端发布准备命令

```bash
cd /Users/linctex/Desktop/vibe/时间管理/temporal
bash scripts/release-backend-prepare-from-main.sh
```

## 处理“我想上线”类请求的推荐步骤

1. 先确认代码是否已通过 PR 合并到 `main`
2. 检查本地分支、工作区、远端同步状态
3. 判断这次是前端发布、后端发布，还是前后端一起
4. 执行对应命令
5. 要求或执行线上验证
6. 输出发布结果、commit SHA、风险和回滚方式

## 处理“流程还不规范”类请求的推荐步骤

1. 先看仓库里 `.github/` 是否已有约束
2. 再看 GitHub 仓库设置是否已经打开 branch protection
3. 不要只写理想流程，要区分：
   - 当前真实流程
   - 仓库内已落地约束
   - 还需要 GitHub 控制台手工打开的部分

## 不要做的事

- 不要直接从脏工作区发版
- 不要把“本地能跑”当成“可以上线”
- 不要绕过 `main`
- 不要把未合并分支当成生产版本真相源

## 定位

这份文件更像项目私有的 `skill / playbook`。

如果未来这套模式会在多个项目复用，再考虑把它上收成 Honeycomb 共享能力。
