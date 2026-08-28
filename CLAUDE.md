# CLAUDE.md

本文件提供 DigitalPlatform_app（移动端 uni-app）的代码指引。

## 技术栈

- uni-app + Vue 3 + TypeScript + Vite
- uview-plus 组件库（`up-` / `u-` 前缀，easycom 自动引入）
- Pinia（`src/store`）

## 常用命令

```bash
pnpm dev:h5             # H5 开发（注意：本机 pnpm 需 Node 18+）
pnpm build:h5-test      # H5 测试包
pnpm build:app          # App 包
# Node 16 环境可绕过 pnpm 直接构建：
./node_modules/.bin/uni build --mode tes
```

## 页面与路由

- 页面注册在 `src/pages.json`，按模块分组（如「追溯管理」「仓库管理」）。
- 路由类型在 `src/type/route.ts` 的 `RouteName` 联合类型里配置。
- 跳转用 `src/store/route.ts` 的 `routes.页面name.path`。
- 首页功能菜单在 `src/pages/home/index.vue` 的 `traceManagerList`（追溯）/ `stockroomManagerList`（仓储）中配置；菜单项需 `auth`（`authList.value.includes(routes.页面name.name)`），新页面须在系统角色授权后可见。
- 追溯管理现有页面：上岗打卡、工作计划、按灯预警、追溯管理、追溯流程、追溯信息、追溯查询、报工记录、报工打印、**标签校验**。

## 接口对接

- api 模块放 `src/api/*.ts`，统一用 `uRequest.post<Return<T>>({ url, data })`（见 `src/api/instance.ts`）。
- 返回类型：`Return<T>` / `ReturnList<T>`（`{list, currentPage, pageSize, totalCount}`）在 `src/type/common.ts`。
- 分页列表用 `src/hook/usePageTable.ts` 的 `useTable(api, options)` + `uni-table` + `uni-pagination`（参考 `pages/productJobList/index.vue`）。

## 常用组件/弹窗

- 扫码输入框：`up-input-scan`（`src/components/UpInputScan.vue`，`v-model` + `@scanSuccess`）。
- 红色错误弹窗：`setCustomModal({ visiable: true, content })`（`src/store/customModal.ts`，背景色 `globalColor.error`）。
- 成功提示：`uni.showToast({ icon: "success", title })`。

## 编码规则

- 异步一律 `async/await + try/catch/finally`，catch 打日志，finally 重置状态；**禁止** `.then()` / `.catch()` 链。
- JS 等值判断用 `==`，不用 `===`。
- 按钮手动触发的异步操作要加 `loading` 并同时设 `disabled`。
- 表单必填校验用 JS 判断 + 提示组件，不用 `rules` 方式；必填红星照常显示。
