# GitHub 仓库设置操作清单

## 目标

把 Temporal 的研发流程从：

`本地开发 -> 直接发线上`

收敛成：

`分支开发 -> PR -> Review -> 合并 main -> 从 main 发布`

## 一次性配置入口

进入仓库：

- `https://github.com/PANGKAIFENG/aitimemg`

然后按下面路径配置。

## 1. 打开 Branch Protection / Ruleset

GitHub 新版界面优先走：

- `Settings -> Rules -> Rulesets`

如果你的界面还是旧版，也可以在：

- `Settings -> Branches`

里配置 `main` 的保护规则。

## 2. 给 `main` 建规则

目标分支：

- `main`

建议打开这些规则：

### 必开

- `Require a pull request before merging`
- `Require approvals`
- 审批数量设为 `1`
- `Dismiss stale pull request approvals when new commits are pushed`
- `Require status checks to pass before merging`
- `Block force pushes`
- `Restrict deletions`

### 强烈建议打开

- `Require conversation resolution before merging`
- `Require review from Code Owners`
- `Do not allow bypassing the above settings`

## 3. 挂上 CI 检查项

仓库里已经新增了最小 CI：

- [pr-check.yml](/Users/linctex/Desktop/vibe/时间管理/.github/workflows/pr-check.yml:1)

建议把下面两个检查设成 required：

- `Frontend Build`
- `Backend Syntax`

## 4. PR 模板已经就位

仓库里已经有：

- [pull_request_template.md](/Users/linctex/Desktop/vibe/时间管理/.github/pull_request_template.md:1)

它会要求每个 PR 写清楚：

- 改了什么
- 风险是什么
- 怎么验证
- 是否需要前端 / 后端发布

## 5. CODEOWNERS 已经就位

仓库里已经有：

- [CODEOWNERS](/Users/linctex/Desktop/vibe/时间管理/.github/CODEOWNERS:1)

当前默认 owner 是：

- `@PANGKAIFENG`

如果后面要把 review 交给其他人，可以直接继续补 owner 规则。

## 6. 建议的日常操作口径

### 开新功能

1. 从 `main` 拉分支
2. 分支命名：
   - `feature/<topic>`
   - `fix/<topic>`
   - `chore/<topic>`
3. 在分支上开发
4. 发 PR 到 `main`
5. Review 通过再合并

### 禁止事项

- 不要直接在 `main` 上开发功能
- 不要直接 push `main`
- 不要分支代码没合并就发线上

## 7. 配置完成后的验收

你可以用这几个动作验证设置是否生效：

1. 新建一个测试分支
2. 随便改一行文档
3. 推一个 PR 到 `main`
4. 确认：
   - PR 模板出现了
   - CI 自动跑了
   - 没 approval 时不能 merge
   - 不能绕过 status checks

## 8. 当前建议的最终口径

GitHub 仓库设置做完后，这个项目的主流程就应该统一成：

`feature/fix 分支开发 -> PR -> review -> CI 通过 -> merge main -> 从 main 发布`
