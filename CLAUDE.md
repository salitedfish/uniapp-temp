# CLAUDE.md

DigitalPlatform_app 移动端/App 指南。通用项目信息见根目录 [CLAUDE.md](../CLAUDE.md)。

## 技术栈

uni-app（Vue 3 + TypeScript）跨平台应用，支持 H5、Android、iOS、微信小程序等多端。

## 关键命令

```bash
pnpm install                   # 安装依赖
pnpm run dev:h5                # H5 开发
pnpm run build:h5-pro          # H5 生产构建
pnpm run dev:app-android       # Android App 开发
pnpm run build:app-android     # Android App 打包
pnpm run dev:app-ios           # iOS App 开发
pnpm run build:app-ios         # iOS App 打包
pnpm run dev:mp-weixin         # 微信小程序开发
pnpm run type-check            # TypeScript 类型检查
```

## 架构要点

- **基于 uni-app 3.x** + uview-plus UI 库
- **页面**: `src/pages/` 包含追溯信息、工作计划、入库出库、扫码检验、打卡、蓝牙打印等业务页面
- **报工模板**: 报工在 `src/pages/traceInfo/` 完成，按产线配置的流程编码分派——仅支持「条码自配」(DZ014, templateP014) 与「打包」(DZ015, templateP015)；`enum.ts` 定义 P/PK 枚举
- **报工两条入口（同一套模板，靠 prop `noPlan` 区分）**:
  - **计划入口**：`pages/workPlan/index`（工作计划）→ `pages/traceInfo/index`（壳，`routes.TraceInfo`）→ 模板，跳转带 `lineDetailId + procedureName + planCode`；计划信息（计划单号/计划数量/实际数量）由 `getPlanInfo()` 扫计划单号带出，产品编码是**只读框**（placeholder「计划单号自动带出」）
  - **追溯入口**：`pages/traceManager/index`（追溯管理）→ `pages/traceProcess/index`（追溯流程，`goTraceProcessInfo` 跳转 URL 追加 `&noPlan=1`）→ 同一壳页/模板，**不传 planCode**
  - 壳页 `traceInfo/index.vue` 与两个模板都有 prop `noPlan?: string`，模板内 `const isTrace = computed(() => props.noPlan == "1")` 守门全部追溯模式行为。⚠️ **用显式 prop 判定，不要用 `!planCode` 隐式判断**：计划入口本来就允许 planCode 为空（空时走 `initFormPlan()` 清空计划信息），复用会与既有语义撞车，且计划入口的「计划单号」输入框必须保留。uni-app 页面 query 参数一律是字符串，`noPlan` 声明成 `string`，等值判断用 `==`
  - 追溯模式：隐藏 计划单号/计划数量/实际数量；产品编码换成弹窗单选；`preSubmit()` 里计划id、超计划数量校验都跳过，改校验「请先选择产品编码」与「该产品在当前工序未配置条码规则，无法报工」；`headTailCheck()` 首行 `if (isTrace.value) return true`（首末检依赖计划带出的 firstNum/finalNum）；提交成功后走 `refreshAfterSubmit()`（走 `getPlanInfo()` 会被 `initFormPlan()` 清掉已选产品）
- **产品编码弹窗单选**：`src/components/TraceProductPicker.vue`（照 `TraceProcessPicker.vue` 抄改，`TablePicker` 单选 + `selectKey="productCode"`），取数走 `src/api/product.ts` 的 `getProductList`（`ldProduct/pageList`，`useTable(getProductList, { queryType: 0, enabled: 1 })` 只列启用产品）；选中回调 `productSelect` 会把上一产品的条码/数量/检测状态全部重置，并 `getCodeRules(true)` 重新解析该产品在本工序的条码规则（`ld_line_detail.code_rules` 里没配规则就提示「无法报工」且**不缓存**）
- **产品缓存**：全局单 key `traceProduct`（localStorage / `uni.setStorageSync`），存 `{productCode, productName, cusProductCode}`。进页面时 `applyCachedProduct()` 在产线条码规则解析之后读取，**仅当本工序的 `codeRules` 里存在该 productCode 才预选**（不命中就保持空、但不清缓存）；计划入口不读不写这个 key，两个入口互不污染
- **API 层**: `src/api/` 使用 TypeScript，通过 Axios 请求后端
- **MQTT 数采**: 报工页 `src/pages/traceInfo/templateP014.vue` 通过 WebSocket(`VITE_BASE_API_URL_WEB_WEBSOCKET`, 如 `ws://192.168.157.17:8083/mqtt`)直连 **plc_connecter** 项目(`/Users/gexiaokang/work/yl/projects/plc_connecter`，对接硬件设备进行数采的项目)内嵌的 MQTT broker，订阅 `lab_data_hub/get_device_data` 接收设备上报数据；从 `properties` 读取 `equipment_parameters`/`result` 自动回填报工表单(条码规则经 PLC 反馈点位)
- **多端适配**: 统一代码同时构建 H5、Android/iOS App、各平台小程序
- **工具模块**: `src/util/` 包含钉钉、微信初始化、蓝牙、权限指令等
- **状态管理**: Pinia-like store (`src/store/`)
- **环境配置**: `.env.dev` / `.env.tes` / `.env.pro` 三套环境
