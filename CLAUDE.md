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
- **首页右上角抽屉：检查更新 + 退出登陆（2026-09-30 改）**: 原先点右上角那个关机图标（`icon-guanji`）直接弹 `uni.showModal`「确定要退出吗？」，现在改为 `up-popup mode="right"` 抽屉（写在 `pages/home/index.vue` 里，宽手机约 72%、封顶 320px；头部「主色底 + 标题 + 圆形 ✕」与报工页的「检验单」「文档」两个右侧栏同一套观感）。
  - **「检查更新」只在 App 端渲染**（`v-if="Platform.isApp()"`）：更新要走 `plus.downloader` 下载安装包再 `plus.runtime.install`，H5 / 钉钉 / 微信没有可安装的包、也没有 `plus`，放出来只会点了报错。**H5 上抽屉里只有「退出登陆」，这是预期不是漏做**
  - **启动不再检查更新**：原来在 `pages/blank/index.vue`（app 的启动页 —— `pages.json` 第一页、不是 tab）里用 `#ifdef APP-PLUS` + 已登录时调一次 `versionCheck`，本次整段移除，改由上面这个按钮手动触发。**别再加回 blank 页**，两处都查会重复弹升级弹窗
  - **`util/app.ts` 的 `versionCheck` 补了「当前已是最新版本」的 toast**：手动点的按钮必须有反馈，原来只有启动时静默调、没新版本可以不吭声
  - **「退出登陆」不再有二次确认**：抽屉本身就是原来那一步确认。走的仍是**同一套**逻辑 —— `useLogout()` 的 `logout()` + 新拆出来的 `closeAfterLogout()`（`hook/useCloseApp.ts`：钉钉里 `dingding.biz.navigation.close`、其余端 `redirectTo` 登录页）。`useCloseApp` 本体保留（报工内嵌页拿到 `CLOSE_APP` 指令那一处 `moldLink` 还在用）；它原先两个分支的 `showModal` 逐字重复，顺带合并成一处
  - **2026-09-30 h5 dev 实测**（页面真实操作）：右上角图标 → 右侧弹出栏贴右满高（x=937/视口 1257、宽 320、高 941），面板文案「更多 / 当前版本 v1.0.8 / 退出登陆 / 退出当前账号」，**没有**「检查更新」（H5 预期）、**没有**旧的 `uni.showModal` 确认框；关闭圆钮 / 点遮罩 / 再点图标这套开→关→开往返三次都正常；点「退出登陆」实测发出 `POST /api/token/loginOut`、`token` 与 `userInfo` 从 localStorage 清空、跳到 `/h5/pages/login/index`，随后用浏览器自动填充的凭据登回（登录态已还原）。截图 `h5首页-右上角抽屉-开启态.png`、`h5-退出登陆后-登录页.png`
  - ⚠️ **「检查更新」的点击链路是在 H5 上临时摘掉 `v-if="Platform.isApp()"` 验的**（截图 `h5首页-检查更新弹窗-临时摘平台判断.png`，拍完已改回）：实测发出 `POST /api/app/versionCheck`、比对版本后弹出「检测到有新版本！v105 / 暂不升级 / 立即升级」。**App 端 `plus` 下载安装那一段没验** —— H5 里点「立即升级」必然崩，所以只点了「暂不升级」；那部分是本次未改动的既有代码
  - 右上角仍是关机图标（`icon-guanji`），语义已从「退出」变成「打开更多菜单」；**刻意没换成「更多/设置」图标**，要换说一声
- **仓储管理整块已下线（2026-09-28）**: 原「仓储管理」12 个页面（`purchaseArrival`/`purchaseStockroom`/`materialOutStockroom`/`productionStockroom`/`deliveryMaterial`/`shelfChange`/`stockroomChange`/`codeCheck`/`otherStockDoc`/`otherOutStockDoc`/`refundDoc`/`outSrDocFlieUpload`，及其 9 个 `*DefaultSetPage`）连同入库/出库/调拨/退货/扫码检验整条链路一并删除。`pages.json` 的「仓库管理」块（原 77–307 行）整块摘除，**只保留块内的 `board`（TV 看板）条目**——它原先混编在仓储块里，是块中唯一不属于仓储的页面。连带删除：`api/{business,checkVouch,deliveryMaterial,purchaseArrival}.ts`、`type/business.ts`、20 个只被仓储页引用的组件（`EmptyContent`/`PrintTypeCheck` + 18 个 `UpInput*Picker`）、`static/home/` 下 11 个仓储专用宫格图标。首页 `home/index.vue` 的 `stockroomManagerList` 与「仓储管理」宫格块、`type/route.ts` 的 `StockroomManagerName`/`DefaultSetRouteName` 同步去掉。
  - ⚠️ **保留的易混项**：`api/trace.ts` 里的 `codeCheckInfoApi` 与删掉的 `api/checkVouch.ts`/`codeCheck` 页**不是一回事**，它被报工模板 P014/P015 使用，**必须保留**；`board` 页借用的 `static/home/out_sr_doc_upload.svg` 一并保留（该图标语义上是「附件回传」的，属既有借用）。`UpInputScan`/`UpInputScanNew`/`UpInputDatePicker`/`MediaUpload` 等组件被保留页（报工、工作计划、追溯、点检、按灯、打卡）继续使用，**不属仓储孤儿**。
  - `store/route.ts` 不需改：它遍历 `pages.json` 自动生成 `routes` 与 `needLoginRoutes`，页面删了它自然就少。
- **报工模板**: 报工在 `src/pages/traceInfo/` 完成，按产线配置的流程编码分派——仅支持「条码自配」(DZ014, templateP014) 与「打包」(DZ015, templateP015)；`enum.ts` 定义 P/PK 枚举
- **报工页的「检验单」：主页面只留一行入口，明细收在右侧弹出栏（2026-09-30 加，P014/P015 两处逐字相同、必须同改）**
  - **入口**：主页面一个 `up-form-item`，标签「检验单」（**不写「检验单明细」，太长**），内容一行「共 N 项，已填 M 项 + 去填写 ›」。**行数条件 `v-if="checkRecords && checkRecords.length"`** —— 工序没开「是否需要检验」或该产品在该工序没配检验项时不渲染，与既有语义一致
  - **弹出栏**：`up-popup mode="right"` + `.check-drawer`，蓝色渐变头（标题/副标题/圆形 ✕）+ 白色进度条 + 灰底滚动区（里面就是原来的 `CheckRecord`）+ 固定底部「完成」。⚠️ **uview-plus 的 `mode="right"` 只合并 `{top:0,bottom:0}`，宽度必须靠 `:customStyle` 给**（本项目其它 `up-popup` 都是 `mode="bottom"`，没有可抄的现成写法）：宽屏（≥768）取视口 70% 且不超过 720px，窄屏 85%
  - **「已填 M 项」与进度条的判据 `isCheckItemFilled` 必须与 `preSubmit` 的校验项逐条对齐**（测量值 / 图片 / 检测结果 / result=0 时的失效模式+理由），否则会出现「入口显示已填、提交却被拦」。改 `preSubmit` 的校验时**同步改这个函数**
  - **数据来源不变**：仍是 `getCheckItemListApi({lineDetailId, productCode})` → `POST ldCheckItem/checkList`；提交时由 `AbstractReportTemplateHandler.submitReport` → `TraceService#saveTraceCheck` 落 `ld_trace_check_main` + `ld_trace_check_item`，**与 web 端「检验单管理」手工录入的落在同一张表**（见 web/api 的 CLAUDE.md）
  - ⚠️ **检验项的 `checkItemId` 不能造超过 `Number.MAX_SAFE_INTEGER`（9007199254740991）的值**：接口以 JSON number 下发，JS 端会丢精度（实测用 `9000000000000000001` 造数，回传落库变成 `9000000000000000000`，后端按 id 回查检验项 miss → 主数据 `ldCheckItem` 为 null → web 端「查看检验单」整张弹窗空白）。**造数走真实雪花 ID 的量级（15~16 位）**
  - 2026-09-30 dev 实测：追溯入口 P014（csgx_000 / `cstm900002`）填 2 项检验单提交，`ld_trace_check_main` 1 行 + `ld_trace_check_item` 2 行（`measure_value=15`、result 均合格、`trace_id` 与 `ld_trace` 对齐）；web「检验单管理」列表可见、点「查看」明细 2 行渲染正常；只填 1 项时点「确认」被「请选择检验单是否合格」拦住（证明校验接线生效）。测试行已删净
  - 2026-09-30 13:1x 追加实测（`cstmNG0001`，四条分支全过）：**图片项**拦「请上传检验单图片」→ 上传成功落 `images_url`；**不合格项**依次走「请选择检验单失效模式」→「请填写不合格理由」；**明细不合格而最终结果选了合格**时被「检测项目存在不合格，最终结果不能为合格」拦住；**返工(`submitType=2`) + 检验单** 时 `ld_trace_check_main.main_id` 复用、`items` 整批重插、旧 `ld_trace` 置 `del=1`。⚠️ 「最终结果」那一项要先把 `ld_line_detail.statistics` 打开才会出现（`是否合格` 单选的显隐归 `statistics`，不归 `reworked`）
- **报工页的「文档」：主页面一行入口 + 右侧弹出栏，按扩展名分三种展示方式（2026-09-30 加，P014/P015 两处逐字相同、必须同改）**
  - **数据来源**：`getTraceFilesListApi({lineDetailId, productCode})` → `POST ldTraceFiles/listByLineDetail`，取的是 web 端「文档管理」（`FileManageIndex`，2026-09-30 由「SOP管理」改名）里按 **本工序 + 本产品** 维护的文档，h5 只读不写。后端契约见 api CLAUDE.md。
  - **三个调用点**，与检验单并列（都在 `if (form.value.checked == "1") await getCheckItemList()` 之后）：`getPlanInfo` / `productSelect` / `refreshAfterSubmit`。另外 `initFormPlan()` 里把 `traceFiles` 清空 —— 否则清掉计划/产品后还留着上一单的文档。
  - **`getTraceFiles()` 自带 try/catch**（不与 `getCheckItemList` 共用一个）：文档是报工的附属信息，查不到不该把整条报工流程带崩。工序/产品没齐时直接清空、**不发请求**。
  - **条件渲染 `v-if="fileList.length"`**：该工序+产品没配文档就**不渲染入口**（与检验单「没配检验项不渲染」同口径）。
  - **`components/TraceFileEntry.vue` 是自包含组件**（props 只有 `files`）：主页面一行 `up-form-item`（标签「文档:」+「共 N 个 + 查看 ›」），明细收在右侧 `up-popup mode="right"` 抽屉里，样式逐条对齐检验单的 `.check-entry` / `.check-drawer`，两栏并排时不一个宽一个窄。
  - **三种展示方式由扩展名决定**（`kindOf`）：图片（jpg/jpeg/png/gif/bmp/webp）→ `uni.previewImage` 全屏可缩放预览，抽屉里还直接出缩略图；`pdf` → 「点击查看」；**其余一律「点击下载」**。后两种都走 `openRemoteFile()`：H5 用 `window.open(url,"_blank")`（浏览器能内联渲染 PDF 就渲染，office/压缩包触发下载），APP 用 `uni.downloadFile` + `uni.openDocument`。⚠️ 取扩展名要先剥 `?`/`#` 再取最后一个 `.` 之后的段（URL 带查询串时不能直接 `split(".")`）。
  - **`fileNames` / `fileUrls` 是两个平行逗号串**，按位置一一配对（`ld_trace_files` 一行可挂多个文件）；名字缺失时回落到 URL 末段。
  - ⚠️ **图片预览要压在右侧弹出栏之上**（用户 2026-09-30 指出）：H5 的 `uni.previewImage` 是在 `body` 上插一个 `div`、**内联 `z-index: 999`**，而 uview-plus 的 `up-popup` 是 **10075** —— 不处理就会被弹出栏整块盖住（现象：点图片「没反应」，其实图开在抽屉下层）。修法是 `App.vue` 的 `#ifdef H5` 块里一条全局规则（选择器认「fixed + 内联 z-index: 999 + 子树含 `uni-swiper`」，全页面唯一命中，不误伤其它轮播）。**检验单的图片预览（`CheckRecord.vue` 的 `imgPreview`）走同一个 `uni.previewImage`、同一个覆盖层节点，这条规则一并覆盖**。
  - **2026-09-30 dev 实测**（页面真实操作，追溯入口）：P014（`csgx_000`/`cscp_001`）入口显示「共 3 个」、抽屉三条按扩展名分别出「点击预览 / 点击查看 / 点击下载」；点 png 进 `uni.previewImage`（提层后实测预览图在抽屉之上、抽屉变暗）；点 pdf / xlsx 各自 `window.open` 出正确绝对 URL（三种文件的 URL 均实测 200 + 正确 content-type）。P015（`csgx_002`/`cscp_001`）「共 1 个」正常。**未配文档的 `csgx_001` 入口不渲染**（同一产线，证明条件渲染生效）。⚠️ **检验单的图片预览未单独跑过**（dev 现无带图检验项，`ld_trace_check_item.images_url` 全空；要测需先配检验项再报工上传图），它是同一覆盖层、由同一条全局规则覆盖，属**同机制推断**而非实测。测试行与测试文件均已删净（`ld_trace_files` 回到 0 行基线）。
- **报工页的「附件」：主页面一行入口 + 右侧弹出栏，工序开了「是否上传附件」才出现（2026-09-30 加，P014/P015 两处逐字相同、必须同改）**
  - **入口条件 `v-if="form.uploadFile == '1'"`**，值来自 `getLineDetail` 带出的 `ld_line_detail.upload_file`（与 `form.checked`/`form.reworked` 同一条链路；页面 query 与接口下发都是字符串，所以判断写 `== "1"`）。样式与「检验单」「文档」逐条对齐（`up-form-item label="附件:"` + 一行「共 N 个 + 上传 ›」），明细收在 `up-popup mode="right"` 抽屉里
  - **组件 `src/pages/traceInfo/components/TraceAttachUpload.vue`**，`props` 只有 `modelValue: UploadMedia[]` —— **直接复用 `form.images`**，所以提交那两行（`templateP014.vue:748-749` 的 `params.fileUrl`/`params.fileName`）**一行都不用改**，有数据自动带上。`MediaUpload.vue` 的上传链也走同一个数组
  - ⚠️ **附件是「选传」**（用户 2026-09-30 拍板）：开关只控制**入口显不显示**，不做必传校验 —— 不选附件照样能提交。但**一旦选了就必须传完**：`preSubmit` 里有一道闸 `if (form.uploadFile == "1" && form.images.some(i => i.status != "success"))` 拦下并提示「附件还没上传完，请稍候或删除上传失败的附件」—— **挡的是「把本地临时路径当成附件路径提交上去」**（上传中/失败的 `item.url` 还是本机路径，落库就是脏数据）。⚠️ 闸门**带开关条件**：工序关了附件开关时即便 `form.images` 里留着东西也不拦（正常路径下这时入口都不渲染，进不去这个态）
  - **能选什么：按端分流（条件编译）** —— **H5 走 `uni.chooseFile`（任意文件，图片/PDF/office 都行）**；**App 走 `uni.chooseImage`（只能挑图片）**。这是用户明确的口径：附件类型定义为任意文件，但 App 端的能力只到图片
  - **上传落库的是相对路径**：`uni.uploadFile({ url: getBaseUrl() + "upload/fileUpload", formData: { fileName: <生成的唯一磁盘名>, folder: "fujian" } , header: { token } })` —— 磁盘名用「时间戳 + 随机数」的**纯 ASCII 唯一名**（避免中文名/重名进 URL），**原始文件名留给 `file_name` 列**（与 web `Upload.vue` 用 `guid()` 是同一套约定：**磁盘名 ≠ 展示名**）。上传成功把 `item.url` 存成后端返回的**相对路径**（不拼 base、不带 token2）
  - **失败可重试**：失败时 `item.url` 留着本地上传源，点一下就用同一个文件重传（`status: uploading/success/fail`，与 `MediaUpload.vue` 同一套写法）
- **附件地址口径：库里只存相对路径，展示时拼 base（2026-09-30 统一）**
  - `src/util/common.ts` 新增 **`genFileUrl(path)`**（展示用）/ **`genFilePath(url)`**（入库用），与 web 的 `fileUrl()`/`filePath()` **同口径**：`genFileUrl` 带守卫（已是 `http(s):`/`data:`/`blob:`/`/` 开头不拼），base 取现成的 `getBaseUrl()`；**不再追加 `?token2=fujianhuichuan`**（该参数后端零消费方，2026-09-30 彻底去掉）
  - ⚠️ **配对约定：上传组件列表里存「展示地址」的，提交前必须过 `genFilePath` 还原成相对路径**（`MediaUpload.vue` 那条链）；**存「相对路径」的则不需要转换**（`TraceAttachUpload.vue` 那条链是刻意如此 —— 它从头到尾只碰相对路径）
  - `components/MediaUpload.vue`：`genImgUrl` 改为 `getBaseUrl() + url`（带守卫），那两行拼 `token2` 的注释一并删
  - `pages/traceInfo/components/CheckRecord.vue`：基准图片 `<up-image :src>` 与 `imgPreview(item.filePictureUrl)` 都过 `genFileUrl`
  - **`util/app.ts` 的 `startUpdate`：APK 下载地址改 `genFileUrl(versionUrl)`** —— 库里 `app_version.url` 现在（清洗后）存相对路径，`plus.downloader` 要绝对地址。⚠️ **本批 h5/app 改动全部未实测**（登录态过期），这条**直接影响 App 检查更新**，部署前请在真机上点一次「检查更新」
  - ⚠️ **升级顺序约束**：升级链路是「**旧 App** 读**新库**值」，所以 `app_version.url` 必须**先发新版 App、再清洗**，否则老 App 拿到相对路径会下载失败
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
- **2026-09-30 打包模板下线「生成托车码 / 重打印」第二组按钮（`templateP015.vue`）**：
  - **原因**：打包页（DZ015）上原先有**两组**打印按钮 —— 上半组「生成包装码 / 重打印」（`BoxBarcodePrinter` / `BoxBarcodeRePrinter`，无条件渲染）与下半组「生成托车码 / 重打印」（`BoxBarcodePrinter1` / `BoxBarcodeRePrinter1`，由 `ld_line_detail.printed` 开关控制显隐）。两组**调的是同一个端点** `ldPrintBarcode/add2`，差别只在入参：包装码 `prefix=\`${productCode},${nowFormat1},\``、`maxNum` = 用户填的每箱数量；托车码 `prefix=\`TC${batchFormat}\``、`dig:5`、`maxNum:1`。托车码那条数据链早已停用（`ld_print_barcode` 里「托车批次码」最后一条是 2025-07-08），用户判定与上半组重复 → **第二组连按钮带开关一并删除**
  - **删了什么**：`pages/traceInfo/components/BoxBarcodePrinter1.vue` 与 `BoxBarcodeRePrinter1.vue` **两个文件整体删除**；`templateP015.vue` 里删 `<view class="btn-box" v-if="form.printed == 1">` 整块（含两个 import + 注册）、`oriForm()` 的 `printed: 0`、回填的 `form.value.printed = d.printed`；`util.ts` 删 `printBoxBarcode1` 整个函数。⚠️ **`printBoxBarcode`（箱码，上半组在用）不动**。`AutoConnectBlueTooth` 上的 `v-if="form.printed == 1"` 一并去掉（`printed` 字段已不存在）
  - **`templateP014.vue`** 同步删 `oriForm()` 的 `printed: 0` 与 `form.value.printed = d.printed` —— 那两行是**死赋值**（P014 模板里从没渲染过打印按钮）
  - **后端**：`ld_line_detail.printed` 列已于同日 **DROP**（**两库均已执行**，43 → 42 列；pro 的删除前快照 `/tmp/2026-09-30-托车码与打印开关下线-pro备份.sql`），`LdLineDetail` / `LdLineDetail2VO` 两个 `printed` 字段删除，web 产线档案的「是否启用打印」表单项删除 —— 详见 api / web CLAUDE.md 同名条目
  - **2026-09-30 dev 实测**（页面真实操作）：P015 报工页只出「生成包装码 / 重打印」一组按钮；点「生成包装码」实出 `cscp_001,260930,000001`（与改动前逐字一致）；P014 页面（追溯入口）渲染正常。**测试数据已还原**（`ld_print_barcode` 19688→19687、`sys_kv['cscp_001,260930,/']` 删除）
- **报工「是否返工」提交链路（2026-09-30 dev 页面实测）**：`ld_line_detail.reworked=1` 时 P014/P015 报工页出「是否返工：是/否」单选（`v-model="form.submitType"`，`'2'`=是 / `'1'`=否）。**实测通过**：`csgx_001`/`cscp_001`/已有条码 `cstm111111`，选「否」被「cstm_001重复」拦下、选「是」提交成功（4 个接口全 200），落库 `ld_trace` 老记录 `del=1`、新记录 `submit_type=2`，web 追溯查询的数据信息带「**(返工)**」前缀（`Dz014ReportHandler.buildContent` / `Dz015ReportHandler` 按 `submit_type==2` 加前缀，是**读取时**拼的，库里没有这个字段）。流水号复用老记录的（`findOrCreateSerialCode` → `findRelatedSerialCode`），**不消耗新流水号**。
  - ⚠️ **顺序约束（无页面提示，工人得先选返工再扫码）**：`codeRuleScanSuccess()` 在条码填满时**直接调 `submit()`**，而 `submitType` 是提交那一刻才从 `form.submitType` 读的 —— 先扫已有条码会当场被重复校验拦下，改「是」也来不及。
  - ⚠️ **数据不一致备查**：`markOldTraceAsHistory` 只把 `ld_trace` 老行置 `del=1`，**它的 `ld_trace_plus` 子行没跟着置 del**（新记录另加一行 plus），于是同一 `(line_detail_id, barcode)` 下有两条 `del=0` 的 plus 行、其中一条挂在已删的老 trace 上。未测出实际错乱，如实记一笔。
  - **`checked=1` 与 `reworked=1` 同时开启的组合已于 2026-09-30 13:1x 在页面上跑通**（见上「报工页的检验单」条目）：返工提交时检验单走 `saveTraceCheck` 的更新分支 —— `ld_trace_check_main` 按 `(line_detail_id, barcode)` 复用同一 `main_id`（`check_date` 保持首次、只更新 `update_time`），旧 `ld_trace_check_item` 整批删除后按新 `trace_id` 重插。
