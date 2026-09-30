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
- **页面**: `src/pages/` 包含追溯信息、工作计划、打卡、按灯、蓝牙打印等业务页面
- **仓储管理整块已下线（2026-09-28）**: 原「仓储管理」12 个页面（`purchaseArrival`/`purchaseStockroom`/`materialOutStockroom`/`productionStockroom`/`deliveryMaterial`/`shelfChange`/`stockroomChange`/`codeCheck`/`otherStockDoc`/`otherOutStockDoc`/`refundDoc`/`outSrDocFlieUpload`，及其 9 个 `*DefaultSetPage`）连同入库/出库/调拨/退货/扫码检验整条链路一并删除。`pages.json` 的「仓库管理」块（原 77–307 行）整块摘除，**只保留块内的 `board`（TV 看板）条目**——它原先混编在仓储块里，是块中唯一不属于仓储的页面。连带删除：`api/{business,checkVouch,deliveryMaterial,purchaseArrival}.ts`、`type/business.ts`、20 个只被仓储页引用的组件（`EmptyContent`/`PrintTypeCheck` + 18 个 `UpInput*Picker`）、`static/home/` 下 11 个仓储专用宫格图标。首页 `home/index.vue` 的 `stockroomManagerList` 与「仓储管理」宫格块、`type/route.ts` 的 `StockroomManagerName`/`DefaultSetRouteName` 同步去掉。
  - ⚠️ **保留的易混项**：`api/trace.ts` 里的 `codeCheckInfoApi` 与删掉的 `api/checkVouch.ts`/`codeCheck` 页**不是一回事**，它被报工模板 P014/P015 使用，**必须保留**；`board` 页借用的 `static/home/out_sr_doc_upload.svg` 一并保留（该图标语义上是「附件回传」的，属既有借用）。`UpInputScan`/`UpInputScanNew`/`UpInputDatePicker`/`MediaUpload` 等组件被保留页（报工、工作计划、追溯、点检、按灯、打卡）继续使用，**不属仓储孤儿**。
  - `store/route.ts` 不需改：它遍历 `pages.json` 自动生成 `routes` 与 `needLoginRoutes`，页面删了它自然就少。
- **报工模板**: 报工在 `src/pages/traceInfo/` 完成，按产线配置的流程编码分派——仅支持「条码自配」(DZ014, templateP014) 与「打包」(DZ015, templateP015)；`enum.ts` 定义 P/PK 枚举
- **报工两条入口（同一套模板，靠 prop `noPlan` 区分）**:
  - **计划入口**：`pages/workPlan/index`（工作计划）→ `pages/traceInfo/index`（壳，`routes.TraceInfo`）→ 模板，跳转带 `lineDetailId + procedureName + planCode`；计划信息（计划单号/计划数量/实际数量）由 `getPlanInfo()` 扫计划单号带出，产品编码是**只读框**（placeholder「计划单号自动带出」）
  - **追溯入口**：`pages/traceManager/index`（追溯报工，route name `Trace`）→ `pages/traceProcess/index`（追溯流程，`goTraceProcessInfo` 跳转 URL 追加 `&noPlan=1`）→ 同一壳页/模板，**不传 planCode**
  - 壳页 `traceInfo/index.vue` 与两个模板都有 prop `noPlan?: string`，模板内 `const isTrace = computed(() => props.noPlan == "1")` 守门全部追溯模式行为。⚠️ **用显式 prop 判定，不要用 `!planCode` 隐式判断**：计划入口本来就允许 planCode 为空（空时走 `initFormPlan()` 清空计划信息），复用会与既有语义撞车，且计划入口的「计划单号」输入框必须保留。uni-app 页面 query 参数一律是字符串，`noPlan` 声明成 `string`，等值判断用 `==`
  - 追溯模式：隐藏 计划单号/计划数量；产品编码换成弹窗单选；`preSubmit()` 里计划id、超计划数量校验都跳过，改校验「请先选择产品编码」与「该产品在当前工序未配置条码规则，无法报工」；`headTailCheck()` 首行 `if (isTrace.value) return true`（首末检依赖计划带出的 firstNum/finalNum）；提交成功后走 `refreshAfterSubmit()`（走 `getPlanInfo()` 会被 `initFormPlan()` 清掉已选产品）
  - **「实际数量」两个入口都有，但取数来源不同（2026-09-28 改）**：计划入口由 `getPlanInfo()` 扫计划单号从 `trace/findPlan` 带出（口径 = 该计划 `sum(this_num)`）；追溯入口原先整项隐藏，现改为调 `POST /trace/findRealNum`（入参 `lineDetailId + productCode`，后端按 **当天 + 该产线明细 + 该产品** 统计 `sum(this_num)`，**不限计划**，有计划的报工也计入）——所以追溯模式**不要**再用 `v-if="!isTrace"` 藏它，只换 placeholder（`isTrace ? '选择产品自动带出' : '计划单号自动带出'`）。两个模板各有一个 `refreshRealNum()`，在 **切换产品（`productSelect` 末尾）** 与 **报工提交成功（`refreshAfterSubmit`）** 两处重取；`form.realNum` 在追溯模式下不参与任何校验（超计划校验与 `headTailCheck` 都已被 `isTrace` 挡掉），纯展示。
- **产品编码弹窗单选**：`src/components/TraceProductPicker.vue`（照 `TraceProcessPicker.vue` 抄改，`TablePicker` 单选 + `selectKey="productCode"`），取数走 `src/api/product.ts` 的 `getProductList`（`ldProduct/pageList`，`useTable(getProductList, { queryType: 0, enabled: 1 })` 只列启用产品）；选中回调 `productSelect` 会把上一产品的条码/数量/检测状态全部重置，并 `getCodeRules(true)` 重新解析该产品在本工序的条码规则（`ld_line_detail.code_rules` 里没配规则就提示「无法报工」且**不缓存**）
- **条码规则校验失败提示是「多行文本」，靠弹窗的 `white-space` 渲染（2026-09-29）**：扫码校验（`codeCheckInfoApi` → `POST trace/checkBarcode`）失败时，后端 `MsgVO.checkCodeMsg` 回的是 `\n` 分隔的**六行**文本（首行「XXX校验失败」+ 段名称/位置/类型/期望值/实际值，详见 api CLAUDE.md）。P014/P015 两个模板只是把该串**原样**塞进 `setCustomModal({ content })` —— **不解析、不拆分**，所以想改提示格式只改后端。
  - ⚠️ 因此 `CustomModal.vue` 的 `.content` 必须保留 `white-space: pre-wrap`（配 `word-break: break-all`）。`{{ customModalStore.content }}` 是单个插值，没有这条样式时 `\n` 会**塌成一个空格**，六行糊成一行。对既有所有单行调用方是无副作用的。
  - 实测（dev，2026-09-29）：六行各自成行渲染正常；`cstm_001` 规则下 `abcd111111` 报「段名称：前缀 / 位置：第 1-4 位 / 类型：固定项 / 期望值：cstm / 实际值：abcd」。
- **DZ015 报工页顶部「产线各流程提交情况」步骤条 + 前工序校验（2026-09-24 修三处造假/错判）**：步骤条数据来自 `traceSearch` 调的 `POST /trace/search2`（按条码→`serial_code` 聚合该产线各工序的 `result`），`up-steps` 的 `current` 是 **0 基**（`index < current` 渲染成已完成）。三处改动：
  - **`traceSearch` 不再硬编码前两道合格**：原实现拿到结果后直接 `processList[0].result = 1`、`[1].result = 1`，于是**无论库里真假**，前两道永远显示蓝勾、且前工序校验永远放行。现一律用后端返回的真实结果（`1` 合格 / `0` 不合格 / **`null` = 该工序无报工记录**）。
  - **未扫条码时不判状态（新增 `traced` ref）**：`traced` 只在 `search2` 返回非空时置 true；`up-steps` 用 `:current="traced ? form.activeNum : -1"`、`up-steps-item` 的 `:error` 前置 `traced &&` —— 否则条码还没扫，`processList` 里全是 `result = null`，会显示一片假红叉。条码清空、产品切换、提交后（`refreshAfterSubmit`）都置回 `false`。
  - **`preSubmit` 要跳过的是"当前报工的工序"，不是"最后一道"**：原判据 `Number(key) !== length - 1` 只看是不是末道工序，在中间工序报工时会拿当前工序自己的 `result` 去卡自己（未报过工必然 `null != 1`，直接卡死）。现改为 `Number(key) != Number(form.value.activeNum)`（`activeNum` 由 `getTraceLineDetail` 按 `lineDetailId` 匹配 `list` 下标得出）。
  - ⚠️ 该步骤条只在 **DZ015（打包）** 模板有（P014 不赋值 `processList`），所以「非末道工序」这条分支只有在 DZ015 工序**不是产线末道**时才走得到；dev 产线是 `DZ014 → DZ014 → DZ015`，测不到该分支，属已知未实测项。
  - 2026-09-24 dev 页面实测（`noPlan=1` 追溯入口，产线 `842778854047813`）：未扫条码＝三个灰圈；扫 `cstm123457` 后按库里真实结果显示 `_000` **红叉**（该工序确无报工记录）、`_001` 蓝勾、`_002` 当前；把 `_002` 的 `ld_line_detail.checked` 置 1 后点「确认」被拦「前工序存在未提交或不合格，请确认」（改动前 `_000` 被硬编码成合格，永不拦）；给 `_000` 补一条合格记录后同样的操作提交成功并落库。测试行与 `checked` 均已还原。
- **产品缓存**：全局单 key `traceProduct`（localStorage / `uni.setStorageSync`），存 `{productCode, productName, cusProductCode}`。进页面时 `applyCachedProduct()` 在产线条码规则解析之后读取，**仅当本工序的 `codeRules` 里存在该 productCode 才预选**（不命中就保持空、但不清缓存）；计划入口不读不写这个 key，两个入口互不污染
- **报工页 PC（宽屏浏览器）兼容层（2026-09-24 加）**：报工模板按 750rpx 手机竖屏设计，PC 浏览器里容器被拉满后整体走形（表单项一行一个、按钮铺满整屏、步骤条三个点散到屏幕两端、表格列被均分撑开）。适配全部写在 `traceInfo/index.vue` 的 `<style lang="scss">` 里、由 `.report-page` 包住（该 class 只挂在报工壳页根节点，P014/P015 是它的子组件，规则漏不到别的页面），且整段在 `/* #ifdef H5 */` 内 —— 手机端宽度够不着 768px、App 端被条件编译排除，都不受影响。四条实测踩出来的坑：
  - **页面 `<style>` 块不写 `scoped` 也会被自动加作用域**（编译出 `[data-v-xxx]`）。表单/按钮/表格都在子组件里，必须用 `:deep()` 才穿透得到 —— 第一版没写，整段规则一条都没生效。
  - **`uni-table` 的 `th` 宽度按 rpx 经 `uni.upx2px()` 换算**：`width="100rpx"` 在 PC 上会放大到 200px 量级，把表格 `min-width` 顶到 1030px，连「序号」列都有 200 多像素。适配把 `min-width` 与 `th` 宽度一并交回内容决定。
  - **`up-button` 在 H5 上渲染成 `uni-button`**，uni-app 的全局 base 样式带 `margin-left/right: auto`，按钮不占满整行时会被这组 auto 边距推位置，要固定宽度就得显式清掉。
  - **垂直居中的三个位置别搞混**：`.u-form-item` 是**纵向** flex，唯一子元素 `.u-form-item__body` 且 `flex: 0 0 auto` 不撑满格子。栅格化后同行被拉成等高，矮的那项（如「装箱数量」这类纯文本项）会贴顶 —— 在 `.u-form-item` 上加 `justify-content: center`（纵向主轴）把 body 居中，再加 `.u-form-item__body { align-items: center }` 让标签与内容对齐。⚠️ **不能在 `.u-form-item` 上加 `align-items: center`**：那是它的交叉轴 = **横向**，会把整块内容横向居中（实测 bodyX=153 vs cellX=29）。
  - 四个入口（DZ015/DZ014 × 追溯/计划入口）29 个表单项已逐项断言垂直居中；窄屏不受影响（规则全在 `min-width: 768px` 媒体查询内）。
- **报工表单按语义分块（2026-09-24）**：P014/P015 的 `up-form` 由「一整块」拆成 基础信息 / 自定义条码 / 数量 / 是否合格等 四块，各自独立成卡片（`common-form-next` 给 10px 间距）。
  - ⚠️ **块级 `v-if` 必须跟着块内子项的条件走**：拆分后每块自成 `up-form`，块内子项的条件全不满足时它会渲染成一张只有 2px 边框的**空卡片**（拆块前这些项与别的项同处一个 form，空 form 根本不存在，属拆分引入的新问题，追溯入口就是这种情形）。已给「是否合格/失效模式/设备」那块补 `v-if`（P015 无设备项，条件少一段）。
  - **以后往这块加子项，记得同步那个块级条件**，否则会出现「该显示时不显示」或「空壳卡片」。
- **H5 输入框主题色 + 空值呼吸光晕（2026-09-24 加）**：全局样式写在 `App.vue` 的 `<style lang="scss">` 里、`/* #ifdef H5 */` 内。有边框的输入框（`border="surround"`/`"bottom"`，即 uview-plus 加的 `u-border`/`u-border-bottom`）边框与输入文字统一为主题蓝 `#549df8`（= `store/theme.ts` 的 `globalColor.primary`；**不是** uview-plus 的 `$u-primary` `#3c9cff`，两个蓝不一样），且**只在空值时**外圈 2px 光晕呼吸（2.4s ease-in-out 无限循环）。
  - **别想拿 `border-color` 做动画**：`common.scss` 里 `.u-border { border-color: $u-border-color !important }` 把边框色锁死，而 `!important` 的优先级高于 `@keyframes`，动画写在它上面也是死的。呼吸因此落在 `box-shadow` 上。（试过用 `::after` 另画一层边框绕开，可行但没必要。）
  - **判空不能用 `:placeholder-shown`**：uni-app 的 H5 **没给原生 input 挂 placeholder 属性**，占位文字是它自己另画的 div，那个伪类永远匹配不上。实际信号是这个 div 的**内联 style** —— 空值 `"color: ...;"`，有值才追加 `display: none;`。故用 `:has([class*="placeholder"]:not([style*="display: none"]):not([style*="display:none"]))` 反向选中空输入框（`[class*="placeholder"]` 通吃 uview-plus 的 `placeholderClass` 默认值 `input-placeholder`，全项目无人自定义过；两种 display 写法都排掉）。
  - **输入文字色是内联样式**（`<uni-input style="color: rgb(48,49,51)">`），只有 `!important` 压得过；placeholder 是另一个元素，不受影响、保持灰色。
  - `:has()` 老浏览器不认会整条跳过，降级成「没有光晕」而不是「一直闪」。
  - **`border="none"` 的输入框（多为「自动带出」这类只读项）不凭空加框**，只跟着改文字色。
  - 2026-09-24 dev 实测（报工/工作计划/追溯查询三页）：有边框的输入框边框非蓝 = 0，空值的才呼吸；**清空本已有值的「数量」框后当场转为呼吸**，确认是响应式而非只在初始化时算一次。
- **API 层**: `src/api/` 使用 TypeScript，通过 Axios 请求后端
- **MQTT 数采**: 报工页 `src/pages/traceInfo/templateP014.vue` 通过 WebSocket(`VITE_BASE_API_URL_WEB_WEBSOCKET`, 如 `ws://192.168.157.17:8083/mqtt`)直连 **plc_connecter** 项目(`/Users/gexiaokang/work/yl/projects/plc_connecter`，对接硬件设备进行数采的项目)内嵌的 MQTT broker，订阅 `lab_data_hub/get_device_data` 接收设备上报数据。**实际只读 `payload.properties` 里的 `result`**（`OK`/缺省→`form.result='1'`，`NG`→`'0'`）并把整个 `properties` 塞进 `form.equipmentContent`；⚠️ 早期文档说的「读 `equipment_parameters` 点位」**已不成立**（该点位 MQTT 已不发送，全仓库 `src/` 里 grep 不到），条码规则仍经 PLC 反馈点位。消息只在 `payload.deviceSn == form.equipmentCode` 时才处理
- **多端适配**: 统一代码同时构建 H5、Android/iOS App、各平台小程序
- **工具模块**: `src/util/` 包含钉钉、微信初始化、蓝牙、权限指令等
- **状态管理**: Pinia-like store (`src/store/`)
- **环境配置**: `.env.dev` / `.env.tes` / `.env.pro` 三套环境
- **2026-09-29 报工模板下线两段死逻辑**（`pages/traceInfo/templateP014.vue` 与 `templateP015.vue`，**两处逐字相同、必须同改**）:
  - **首末件检查**: 删 `api/trace.ts` 的 `checkHeadTail`；模板里删 import、`oriForm()` 的 `checkFirstFinal`/`firstNum`/`finalNum`、`d.checkFirstFinal` 赋值、`getPlanInfo` 里 `firstNum`/`finalNum` 的解构与赋值、`headTailCheck()` 函数整体、`submit` 里的 `if (!(await headTailCheck())) return`。它本来就是**死逻辑** —— `/trace/checkFirstFinal` 只存在于被整段注释的 `doc/other`，`PlanVO.firstNum/finalNum` 后端从不下发，`firstNum && finalNum` 恒为假。后端 `ld_check_ff_set` / `ld_check_ff_audit` 两张表也已 DROP
  - **`resetPlc`（是否控制设备）**: 删 import 的 `traceResetPlc`、`oriForm()` 的 `resetPlc: 0`、`d.resetPlc` 赋值、以及 `resetBarCode1A2` 里 `if (form.value.resetPlc) { traceResetPlc({...}) }` 整块。⚠️ **该函数其余逻辑（清条码 / 清数量 / 取条码规则 / 清 equipmentContent）不动**。它端到端是坏的 —— app 每次扫码重置条码后都会调 `POST trace/resetPlc`，而该端点在 TraceController 的 13 个端点里根本不存在，只会打 404
  - ⚠️ **`isTrace` 不能删** —— 超计划校验与 `applyCachedProduct` 还在用它。`ld_line_detail` 的 `check_first_final` / `reset_plc` 两列已随之 DROP，见 api CLAUDE.md
  - 2026-09-29 dev 实测: 追溯入口 P014（csgx_001 / `cstm900001`）与 P015（csgx_002 / `cstm900001`+`cstm900002`）各真实提交一条，页面列表可见，**两次都零 4xx/5xx**（唯一 404 是 `/uview/empty/order.png`，uview 静态资源，与本改动无关）。测试行已删净，`ld_trace` 回到 9 行基线
- **2026-09-29 设备维护重构（app 侧，**⚠️ 本批 h5 改动未实测**）**（与上面「报工模板下线两段死逻辑」是**同一天的两批**；同一份工作区里两批的改动叠在一起，看 `git diff` 时别混）:
  - **背景**：后端把「工序 ↔ 设备」关系表 `ld_process_mold` 整张删掉、换成 `ld_process_equipment`（列名 `mold_code/mold_name` → `equipment_code/equipment_name`），并删掉了工模透传端点 `ldEquipment/findCardByUrl`。h5 有真实调用，**不同步改就会扫码即报错**，故本批必须动。
  - **`src/api/trace.ts`**: 删 `findCardByUrl`（`ldEquipment/findCardByUrl`）；同一处顺带删掉 `checkHeadTail` 与 `traceResetPlc`（属上一批「死逻辑下线」，见上一条）。
  - **`templateP014.vue`**: `getEquipment()` 里映射的 `item.moldCode/item.moldName` → **`item.equipmentCode/item.equipmentName`**（后端 `/trace/findEquipment` 返回体字段随换表改名，**这是本批唯一的接口契约变更**）；`equipmentSelect()` 里「输入值是 http 网址 → 调 `findCardByUrl` 换设备编码」整段删除（`code` 直接用输入值）；`codeRuleScanSuccess()` 里「扫码结果是网址 → 调 `findCardByUrl` 换工装编码」整段删除（`item.barCode = res` 一行了事）。
  - **`templateP015.vue`**: `codeRuleScanSuccess()` 里同样的 http 分支删除（P015 没有设备选择项，无 `moldCode` 映射要改）。
  - ⚠️ **代价（用户已拍板接受，交付时也如实标注过）**：h5 报工里「**扫工模卡片二维码自动换出设备编码/工装编码**」这个能力消失 —— 扫到网址串时条码值就是**网址本身**。这是删掉 `findCardByUrl` 端点的必然结果。
  - ⚠️ **本批 h5 改动未实测**：dev 环境的 h5 登录态已过期，按硬规则不尝试任何登录方式，故**只做了静态检查（无残留引用：`src/` 里 `findCardByUrl` / `moldCode` / `moldName` 均已 grep 为 0），没有在页面上跑过一次报工**。后端契约（`/trace/findEquipment` 返回 `equipmentCode/equipmentName`）是从后端代码逐字核对的，属**推断**不属实测。设备数据来源那侧（`getEquipmentByLineDetailId` → `trace/findEquipment` → `TraceServiceImpl.findProcessEquipments`）在 web 侧有等价的页面实测覆盖（见 web CLAUDE.md），但 **h5 这条入口本身没跑过**
