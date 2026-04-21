# 发布 Runbook

## 目标

把“发布”从个人动作，收敛成可重复执行、可追溯的标准动作。

现阶段的统一原则只有一句话：

> 只允许从干净的 `main` 发布。

## 1. 发布前提

在执行任何发布前，必须满足：

- 代码已经通过 PR 合并到 `main`
- 本地当前分支是 `main`
- 本地工作区是干净的
- 本地 `main` 和 `origin/main` 一致

这几条已经被脚本直接做成校验了，不需要靠记忆执行。

## 2. 前端发布

### 命令

```bash
cd temporal
bash scripts/release-frontend-from-main.sh
```

### 脚本做了什么

这个命令会：

1. 检查当前是否在 `main`
2. 检查工作区是否干净
3. 检查本地 `main` 是否和 `origin/main` 一致
4. 运行前端构建
5. 上传 OSS

对应脚本：

- [release-frontend-from-main.sh](/Users/linctex/Desktop/vibe/时间管理/temporal/scripts/release-frontend-from-main.sh:1)

### 发布后验证

发布完成后，至少验证：

1. 打开 `https://www.aitimemg.cn/app`
2. 强刷：`Cmd + Shift + R`
3. 验证本次改动主路径
4. 看 console / network 是否有新增异常

## 3. 后端发布准备

### 命令

```bash
cd temporal
bash scripts/release-backend-prepare-from-main.sh
```

### 脚本做了什么

这个命令会：

1. 检查当前是否在 `main`
2. 检查工作区是否干净
3. 检查本地 `main` 是否和 `origin/main` 一致
4. 运行后端打包
5. 生成发布包和 manifest

对应脚本：

- [release-backend-prepare-from-main.sh](/Users/linctex/Desktop/vibe/时间管理/temporal/scripts/release-backend-prepare-from-main.sh:1)

输出产物：

- `temporal/temporal-api-fixed.zip`
- `temporal/release-artifacts/backend-release-manifest.json`

### 现阶段真实情况

后端还没有自动直发 FC。

所以当前标准动作是：

1. 从 `main` 生成 zip
2. 去阿里云 FC 控制台上传
3. 记录本次上传对应的 commit SHA

## 4. 发布记录建议

每次正式发布，建议至少记录这 5 项：

- 发布时间
- 发布人
- 分支 / commit SHA
- 发布类型：前端 / 后端 / 前后端
- 验证结果

如果后面要继续完善，可以把它收敛成：

- `docs/HANDOFF/<date>_release.md`
- 或 GitHub Release Notes

## 5. 回滚口径

### 前端

回到上一个稳定 commit，然后重新执行：

```bash
cd temporal
bash scripts/release-frontend-from-main.sh
```

### 后端

回到上一个稳定 commit，重新生成 zip，再重新上传 FC。

```bash
cd temporal
bash scripts/release-backend-prepare-from-main.sh
```

## 6. 不建议做的事

- 不要从功能分支直接发版
- 不要在工作区有未提交改动时发版
- 不要跳过合并，直接拿本地临时代码发线上
- 不要只发前端、不看后端兼容性

## 7. 现阶段最推荐的执行方式

### 正常功能发布

1. 分支开发
2. PR
3. Review
4. Merge 到 `main`
5. 本地切到 `main`
6. `git pull`
7. 前端执行 `bash scripts/release-frontend-from-main.sh`
8. 如涉及后端，再执行 `bash scripts/release-backend-prepare-from-main.sh`
9. 做线上验证

### 紧急修复发布

1. 从 `main` 拉 `fix/*`
2. 修完后发 PR
3. 快速 review
4. 合并回 `main`
5. 按正常发布命令执行

## 8. 这份 Runbook 的定位

它不是“理想流程说明”，而是当前 Temporal 项目真正应该执行的上线操作手册。
