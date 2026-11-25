# CLAUDE.md

DigitalPlatform_app 移动端/App 指南。通用项目信息见根目录 [CLAUDE.md](../CLAUDE.md)。

## 技术栈

uni-app（Vue 3 + TypeScript）跨平台应用，支持 H5、Android、iOS、微信小程序。

## 关键命令

```bash
pnpm install                   # 安装依赖
pnpm run dev:h5                # H5 开发（端口 5173，监听所有网卡；本机 http://localhost:5173/h5/，局域网 http://<本机IP>:5173/h5/）
pnpm run build:h5-pro          # H5 生产构建
pnpm run dev:app-android       # Android App 开发
pnpm run build:app-android     # Android App 打包
pnpm run dev:app-ios           # iOS App 开发
pnpm run build:app-ios         # iOS App 打包
pnpm run dev:mp-weixin         # 微信小程序开发
pnpm run type-check            # TypeScript 类型检查
```

H5 dev 的接口走 `vite.config.ts` 的 `^/api` proxy，后端地址只能从那里的 `target` 读，不要另猜。当前 `target` 是 `http://127.0.0.1:8097/`（代理跑在本机；局域网用户打开 `http://<本机IP>:5173/h5/`，请求先到本机 dev server 再转发后端，本机 IP 变化无需改配置）。仓库 HEAD 里的 `192.168.190.42:8097` 在本机连不通（curl 超时，全站接口 000），换机器前先 `curl` 确认目标可达。

⚠️ 本机默认 node 16.15.1 跑不动 pnpm，先切 `/usr/local/n/versions/node/20.12.1/bin`。

## 架构要点

- **页面**：`src/pages/`（追溯信息、工作计划、打卡、按灯、蓝牙打印等）；**API** `src/api/`（TS + Axios）；**状态** Pinia-like `src/store/`；**工具** `src/util/`；**环境** `.env.dev` / `.env.tes` / `.env.pro`。**多端条件编译**：同一份代码构建 H5 / App / 小程序，平台差异用 `Platform.isApp()` 或 `/* #ifdef H5 */` 分流。
- **app 页面权限只认「移动页面权限」**：`store/auth.ts` 的 `authList` 只取 `/token/getToken` 的 `menusDingdingRole` —— 即 web「角色管理 → 编辑权限 → 移动页面权限」勾选的项，存 `sys_role.menus_dingding_role`；权限树在 web 的 `views/organization/roleManagement/ddPage.json`（当前 9 项：`LdOnDuty`/`LdWorkPlan`/`LdAndon`/`Trace`/`TraceSearch`/`ProductJobList`，以及发货管理的 `BoxCodeGenerate`/`PalletCodeGenerate`/`PackingListCheck`）。⚠️ **不要再合并 `menusRoles`（PC 菜单权限）**：`LdOnDuty`/`LdAndon` 等名字既是 web 路由名又是 app 页面名，合并会让没勾移动权限的角色在首页凭空多出入口。首页宫格与 H5 直接访问 `needLogin` 页面都按 `authList` 过滤；新增 app 可授权页面时要同步加 `ddPage.json`。首页「看板」入口仅 dev 构建显示、不进权限体系。
- **首页分组**：`pages/home/index.vue` 按 `authList` 渲染「追溯管理」「发货管理」两组宫格；「其他」组仅 dev 构建显示看板。发货管理三页 `pages/boxCode`、`pages/palletCode`、`pages/packingListCheck` 均已实现（见下三条），对应路由名 `BoxCodeGenerate`/`PalletCodeGenerate`/`PackingListCheck`。
- **箱码生成页**（`pages/boxCode`）：条码输入用 `UpInputScan`（扫码枪 change 防抖 + 摄像头扫码），扫码后弹「数量」框；数量按条码缓存在 localStorage `boxCodeQtyCache`，同条码再扫自动带出。确定调 `POST /boxCode/generate`（`api/boxCode.ts`），**流水号由后端发**（`sys_kv` 按天 4 位，并发不重号），返回 `条码,数量,yyyy-MM-dd,流水号`，前端不再本地生成。打印走 `util.ts` 的 `buildBoxQrTspl`/`printBoxQr`：TSPL 上二维码下码值，纸张取 `printPage`（未配置按 40×30mm），203dpi≈8 点/mm。
  - **视觉**：浅灰底 `#f5f6f8` 卡片式布局 —— 顶部渐变 hero（箱标 + 标题 + 扫码/填数量/生成打印三步条）→ 扫描条码卡（`必填` 标签）→ 生成结果卡（绿色成功头 + 二维码 + 码值 + 全宽「打印箱码」）→ 「今日生成记录」卡。数量输入在 `up-popup` 底部弹层里，带条码预览与取消/确定。
  - **今日生成记录**：当天且本人 `POST /boxCode/myToday`（`todayBoxCodesApi`），每条显示零件号（码值第一段）、**`数量：N`**（第二段，不用 `× N` 写法）、完整码值、时间与绑定状态标签（`已绑 TP…` / `未绑定`）。
- **托码生成页**（`pages/palletCode`）：**浅灰底 `#f5f6f8` 卡片式布局，与箱码生成页同一套视觉** —— 顶部渐变 hero（青蓝渐变 + 「托」标 + 标题 + 扫箱码/生成托码/打印清单三步条）→ 「打印设置」卡（打印机选择，`必填` 标签）→ 「箱码列表」卡（标题 + 已扫数量徽标 + 「最多 200 个」，行内序号圆点扫到后变绿）→ 生成结果卡 → 底部固定 `.tool-bar`。初始没有输入框（显示空状态「还没有箱码」），点「添加箱码」（底部按钮或列表内虚线「+ 添加箱码」）追加一行 `UpInputScan` 并在 `nextTick` 自动聚焦（单次上限 200 行）；每行右侧垃圾桶图标删行，**只剩一行时删行 = 清空该行**。底部「生成托码」按钮文案带已扫数量（`生成托码（N）`，空行不计）。**页面顶部有打印机选择**（`components/PrinterPicker.vue`，必填但不用 `rules`，未选时提示 `请选择打印机`）：选项来自 `printer/list`，选一次写 `uni.setStorageSync("printer", 名称)` 并 `onMounted` 回填，下次进页面免再选。**箱码格式强校验**：扫码/输入 `onScan` 时按箱码生成格式 `条码,数量[1-9]\d*,yyyy-MM-dd,4 位以上流水号` 校验（日期须真实存在），不合法清空该行并提示 `箱码格式不正确`；点「生成托码」时再全量校验一遍（`箱码格式不正确: X`）并拦空列表（`请先添加箱码`）与本次内重复（`箱码重复: X`）。校验通过且已选打印机后调 `POST /ldPalletCode/generate`（JSON，`api/palletCode.ts`），**托码由后端发**（`TP+yyyyMMdd+4 位流水`）。**已绑定过托码的箱码后端会整单拒绝**，提示「箱码 X 已绑定托码 TP…，不能重复绑定」（由请求封装统一弹窗，页面不重复处理）。**扫码即时校验绑定关系**：每次 `onScan` 还调 `POST /ldPalletCode/bindings`（`findBoxBindingsApi`，JSON `{boxCodes:[码]}`），命中已绑定托码就清空该行、重新聚焦并弹「箱码已绑定托码 X，不能重复绑定。如需重新组托，请先删除原托码。」；本次列表内重复也在扫码时直接拦（`箱码重复: X`），不必等整单生成。异步返回时只认该行仍是本码的结果，避免快速改行/删行误清。成功后结果卡展示托码、已绑定箱码数与**打印状态行**（`printOk`：打印中 / 装箱清单已打印 / 打印失败可到 web 端重新打印）、清空全部输入行，随后**自动调 `POST /ldPalletCode/print`**（`printPalletCodeApi`，传 `palletCode` + `printerName`）让服务端打印机打 A4「Perkins 可循环料箱零件装箱清单（PPST）」（右上角带托码二维码）；打印失败只弹后端错误提示，**已生成的托码保留**，可重新生成或去 web 处理。
- **装箱单校验页**（`pages/packingListCheck`）：两步扫码，**浅灰底 `#f5f6f8` 全屏卡片式布局**。① 顶部渐变 hero（TO 标识 + 标题 + 白色 TO # 扫码框），下方「扫码 → 核对 → 提交」三步说明 + 校验规则卡；`UpInputScan` 扫 TO # 后调 `POST /ldPackingListCheck/preview`（JSON `{toNo, codes: []}`）。② 单据卡（TO#/ASN#/收货方 + 换单）→ 扫码卡 → 提交后结果横幅 → 四格统计条（托码/箱码/差异项/结果）→ 紧凑零件对比表（零件/应装/已扫/差异/状态，`只看差异` 开关只保留 status 2/3/4）→ 可折叠「已扫码」（默认展开，托码显示展开箱数、箱码显示所属托码，提交前可删码）→ 底部固定 `.tool-bar`。状态文案 `1 一致 / 2 缺件 / 3 多件 / 4 单外 / 未扫 待扫`，差异为 0 时显示 `-`。
- **已校验码的反馈**：预览响应带 `alreadyCheckedCodes`，`onScan` 命中时 `uni.showToast`「该码已由当前装箱单 TO … 校验，可继续使用」并照常加入。**被别的装箱单校验过的码由后端拦截**（抛业务异常），请求封装统一弹模态框显示原因（如「托码 TP… 已被装箱单 TO #… 校验，不能重复校验.」），页面在同一处 `restorePreview()` 回滚到扫码前状态（托码/箱码计数不变）。
- **新增异常确认**：每个码先 `snapshotPreview()` 存档、再追加进 `scanCodes` 并整单重发预览；`collectNewAnomalies()` 只对**本次新引入/恶化**的异常弹 `uni.showModal`「确认添加」—— ① 零件首次变成 status 4（装箱单外）；② 零件首次变成 status 3 或已扫数量比上一轮增加（超应装）。已经超量后再扫正常码不重复弹；`取消` 用 `restorePreview()` 直接回滚本地快照（不再发请求，避免界面闪出刚扫的码），`继续添加` 保留本次码。文案列出「装箱单外零件：…」「超出应装数量：… 应装/已扫」。
- **再次校验闸门**：该装箱单最新一条校验记录待审核或已审核通过时，扫 TO # 的 `preview` 直接被后端拒绝（业务异常经请求封装弹出「该装箱单最新校验记录待审核，不能再次校验.」/「…已审核通过，不能再次校验.」），`record` 保持为空、页面停在初始步骤；每次扫码与提交都走同一闸门。只有审核不通过或从未校验过才能校验。
- **提交**：调 `POST /ldPackingListCheck/submit` 落库并弹「通过/存在差异，记录已保存」；**点掉结果弹窗回到扫装箱单（TO #）的初始步骤**（`showModal` 的 `success` 回调调 `resetAll()`：清空单据/扫码/结果与 `submitted`，`toNoInput`、`codeInput` 一起清空，可直接扫下一张装箱单；**不是** `navigateBack`/`history.back()` 回首页）。**没有「重新校验」按钮**：提交成功置 `submitted=true`，底部工具栏 `v-if="record && !submitted"` 整体收起（工具栏里只有「提交校验」一颗），扫码区隐藏、改为结果横幅；弹窗被异常打断时页面停在结果态、不会让人再点一次提交（后端再次校验闸门也会拦）。换单走单据卡右上「换单」`resetAll()`。API 封装 `api/packingListCheck.ts`（两个接口都带 `Content-Type: application/json`）。口径与错误文案同 api CLAUDE.md「装箱单校验」。
- **首页右上角抽屉：检查更新 + 退出登陆**（`pages/home/index.vue`，`up-popup mode="right"`，宽约视口 72% / 封顶 320px，与报工页右侧栏同一观感）。右上角仍是关机图标 `icon-guanji`，语义已从「退出」变成「打开更多菜单」，刻意没换图标。
  - **「检查更新」只在 App 端渲染**（`v-if="Platform.isApp()"`）—— 更新走 `plus.downloader` + `plus.runtime.install`，H5/钉钉/微信没有 `plus`，**H5 上抽屉里只有「退出登陆」，这是预期不是漏做**。**启动页 `pages/blank/index.vue`（`pages.json` 第一页）里没有 `versionCheck`**：更新只由这个按钮手动触发。**别在 blank 页加回来**，两处都查会重复弹升级弹窗。
  - **「退出登陆」没有二次确认**（抽屉本身就是那一步确认），走 `useLogout()` 的 `logout()` + `closeAfterLogout()`（`hook/useCloseApp.ts`：钉钉 `dingding.biz.navigation.close`、其余端 `redirectTo` 登录页）。`useCloseApp` 本体保留（报工内嵌页拿 `CLOSE_APP` 指令那处 `moldLink` 还在用）。
- **报工模板**：报工在 `src/pages/traceInfo/` 完成，按产线配置的流程编码分派 —— 仅「条码自配」(DZ014, `templateP014.vue`) 与「打包」(DZ015, `templateP015.vue`)。
- **产品缓存**：全局单 key `traceProduct`（localStorage），存 `{productCode, productName, cusProductCode}`。进页面 `applyCachedProduct()` 在条码规则解析之后读，**仅当本工序 `codeRules` 里存在该 productCode 才预选**（不命中保持空、不清缓存）；计划入口不读不写这个 key。
- **MQTT 数采**：`templateP014.vue` 经 WebSocket 直连 **plc_connecter** 内嵌 broker（订阅 `lab_data_hub/get_device_data`）。**只读 `payload.properties` 里的 `result`**（`OK`/缺省→`form.result='1'`，`NG`→`'0'`），整包 `properties` 塞进 `form.equipmentContent`；消息只在 `payload.deviceSn == form.equipmentCode` 时处理。⚠️ 早期文档说的「读 `equipment_parameters` 点位」**已不成立**（该点位已不发送）。

## 报工页（P014 / P015）

⚠️ **两个模板的多处改动是"逐字相同、必须同改"的**：检验单入口、文档入口、附件入口、条码校验提示通路 —— 改一处必须同步改另一处。

### 两条入口（同一套模板，靠 prop `noPlan` 区分）
- ⚠️ **壳页「正文空白」（只剩导航栏、无报错无提示）= 该产线明细不在可渲染的模板组合里**：`traceInfo/index.vue` 只在 `procedureKindCode == 4`（定制流程）**且** `procedureCode` 命中 `DZ014`/`DZ015` 时才挂载模板，其余一律什么都不渲染。字段来自 `POST ldLine/findDetailByLineDetailId`（`queryById` 直出实体，不加工）。踩过的实例：dev 库 `ld_line_detail.procedure_kind_code` 被灌库工具压成 1 → 报工页全空白（见 [开发日志](../开发日志/2026-10-14.md)）。
- **计划入口**：`pages/workPlan/index` → `pages/traceInfo/index`（壳）→ 模板，跳转带 `lineDetailId + procedureName + planCode`；计划信息由 `getPlanInfo()` 扫计划单号带出，产品编码是只读框。**追溯入口**：`pages/traceManager/index` → `pages/traceProcess/index`（跳转 URL 追加 `&noPlan=1`）→ 同一壳页/模板，**不传 planCode**。
- 壳页与两个模板都有 prop `noPlan?: string`，模板内 `const isTrace = computed(() => props.noPlan == "1")` 守门全部追溯模式行为。⚠️ **必须用显式 prop 判定，不要用 `!planCode` 隐式判断**（计划入口本来就允许 planCode 为空）；query 参数一律是字符串，判断用 `==`。⚠️ **`isTrace` 绝不能删**（超计划校验与 `applyCachedProduct` 还在用）。
- 追溯模式：隐藏计划单号/计划数量；产品编码换弹窗单选（`components/TraceProductPicker.vue`，只列启用产品）；`preSubmit()` 跳过计划 id 与超计划校验；`headTailCheck()` 首行 `if (isTrace.value) return true`；提交成功后走 `refreshAfterSubmit()`。
- **同一字段两入口标签与取数都不同**：追溯入口显示「当日数量」，调 `POST /trace/findRealNum`（**当前生产日 + 该产线明细 + 该产品**，不限计划；生产日按**工序档案的「预计加工时间段」**切，D = `[D 第一段加工开始时刻, D+1 第一段加工开始时刻)`，段后收尾/加班归前一段（该工序没配按自然日，不回落设备档案），由后端算窗口）；计划入口显示「实际数量」，由 `getPlanInfo()` 从 `trace/findPlan` 带出（口径 = 该计划 `sum(this_num)`，不按生产日/产品收窄）。标签用 `:label="isTrace ? '当日数量:' : '实际数量:'"`。⚠️ 追溯模式**不要**再用 `v-if="!isTrace"` 藏它，只换 placeholder。两模板各有 `refreshRealNum()`，在**切换产品**与**提交成功**两处重取。
- **底部「报工记录」列表（`TraceTablePK5.vue`）按 `lineDetailId/planId/productCode` 查全部历史**：不传 `currentProductionDay`，不按生产日过滤；换产品/换计划/提交后由 `refreshTraceTable()` 先 `reSetPage()` 再查。独立「报工记录」菜单页（`productJobList`）日期范围按**生产日期**解释（后端 `trace/pageList` 同口径）。**该页有「数据信息」列**（序号/流程名称/产品编码/报工人员/报工时间/数据信息）：取 `trace/pageList` 每行的 `content`（后端用与追溯查询相同的模板 handler 组装），非空显示「查看详情」，`up-popup` 居中按 `;` 分条展示，空值显示 `-`。
- **DZ015 顶部「产线各流程提交情况」步骤条**：数据来自 `traceSearch` → `POST /trace/search2`；`up-steps` 的 `current` 是 **0 基**。⚠️ **一律用后端真实结果**（`1` 合格 / `0` 不合格 / `null` = 无报工记录），不要硬编码；未扫条码时不判状态（`:current="traced ? form.activeNum : -1"` + `:error` 前置 `traced &&`），否则显示一片假红叉。⚠️ `preSubmit` 跳过的判据是 `Number(key) != Number(form.value.activeNum)`（**跳过"当前报工的工序"，不是"最后一道"**）。
- ⚠️ **回归 P015（DZ015 打包）的前置条件：上道工序必须先有报工记录**（`prev_check=1` 且 `prev_id1` 非空时，条码1 必须在那个工序有 `result=1` 的 `ld_trace` 记录，否则扫码弹「上道工序检查未通过」）—— **这不是 bug**。P015 若两条规则都是「精准」，后端要求**提交的条码数与规则数一致（都要填）**。

### 检验单 / 文档 / 附件（三块都是「主页面一行入口 + `up-popup mode="right"` 右侧弹出栏」）
- ⚠️ **uview-plus 的 `mode="right"` 只合并 `{top:0,bottom:0}`，宽度必须靠 `:customStyle` 给**（本项目其它 `up-popup` 都是 `mode="bottom"`，没有可抄的现成写法）：宽屏（≥768）取视口 70% 且不超过 720px，窄屏 85%。
- **检验单**：入口 `v-if="checkRecords && checkRecords.length"`（工序没开检验或没配检验项时不渲染）。数据 `getCheckItemListApi({lineDetailId, productCode})` → `POST ldCheckItem/checkList`；提交落 `ld_trace_check_main` + `ld_trace_check_item`，**与 web「检验单管理」手工录入同一张表**。⚠️ **「已填 M 项」与进度条的判据 `isCheckItemFilled` 必须与 `preSubmit` 的校验项逐条对齐**（测量值 / 图片 / 检测结果 / result=0 时的失效模式+理由），否则「入口显示已填、提交却被拦」。改 `preSubmit` 时**同步改这个函数**。⚠️ **检验项的 `checkItemId` 不能造超过 `Number.MAX_SAFE_INTEGER`（9007199254740991）的值**：接口以 JSON number 下发，JS 端丢精度（用 19 位数造数回传会变成 …000）→ 后端按 id 回查 miss → 主数据为 null → web「查看检验单」整张弹窗空白。造数走真实雪花 ID 量级（15~16 位）。
  - ⚠️ 「最终结果（是否合格）」那一项要先把 `ld_line_detail.statistics` 打开才出现（**归 `statistics`，不归 `reworked`**）。
- **文档**：数据 `getTraceFilesListApi({lineDetailId, productCode})` → `POST ldTraceFiles/listByLineDetail`，取 web「文档管理」按**本工序 + 本产品**维护的文档，h5 只读。入口 `v-if="fileList.length"`。
  - **三个调用点**与检验单并列（都在 `if (form.value.checked == "1") await getCheckItemList()` 之后）：`getPlanInfo` / `productSelect` / `refreshAfterSubmit`；另 `initFormPlan()` 里清空 `traceFiles`。**`getTraceFiles()` 自带 try/catch**（文档是附属信息，查不到不该带崩报工流程）。
  - **三种展示方式由扩展名决定**（`components/TraceFileEntry.vue`）：图片 → `uni.previewImage`；pdf → 「点击查看」；**其余「点击下载」**。后两种走 `openRemoteFile()`：H5 `window.open(url,"_blank")`，APP `uni.downloadFile` + `uni.openDocument`。⚠️ **取扩展名要先剥 `?`/`#` 再取最后一个 `.` 之后的段**（URL 带查询串时不能直接 `split(".")`）。
  - **`fileNames`/`fileUrls` 是两个平行逗号串，按位置一一配对**；名字缺失时回落到 URL 末段。⚠️ **图片预览要压在右侧弹出栏之上**：H5 的 `uni.previewImage` 在 `body` 插一个 `div`、**内联 `z-index:999`**，而 `up-popup` 是 **10075** —— 不处理会被抽屉整块盖住（现象：点图片"没反应"）。修法是 `App.vue` 的 `#ifdef H5` 块里一条全局规则（选择器认「fixed + 内联 z-index:999 + 子树含 `uni-swiper`」）。**检验单的图片预览走同一个覆盖层、一并覆盖**。
- **附件**：入口 `v-if="form.uploadFile == '1'"`（值来自 `ld_line_detail.upload_file`，与 `checked`/`reworked` 同链路，都是字符串故写 `== "1"`）。组件 `components/TraceAttachUpload.vue`，**直接复用 `form.images`**（提交那两行 `params.fileUrl`/`params.fileName` 一行不用改）。
  - ⚠️ **附件是「选传」**：开关只控入口显隐、不做必传校验；但**一旦选了就必须传完** —— `preSubmit` 里 `if (form.uploadFile == "1" && form.images.some(i => i.status != "success"))` 拦下，挡的是「把本地临时路径当附件路径提交」（上传中/失败时 `item.url` 还是本机路径，落库就是脏数据）。闸门**带开关条件**。
  - **能选什么按端分流**：**H5 走 `uni.chooseFile`（任意文件）**；**App 走 `uni.chooseImage`（只图片）**。**上传落库的是相对路径**：磁盘名用「时间戳 + 随机数」的**纯 ASCII 唯一名**（避免中文名/重名进 URL），**原始文件名留给 `file_name` 列**（磁盘名 ≠ 展示名）。失败可重试（`status: uploading/success/fail`）。
- **附件地址口径：库里只存相对路径、展示时拼 base**：`util/common.ts` 的 **`genFileUrl(path)`**（展示，带守卫：已是 `http(s):`/`data:`/`blob:`/`/` 开头不拼）/ **`genFilePath(url)`**（入库），与 web 的 `fileUrl()`/`filePath()` 同口径；**不再追加 `?token2=fujianhuichuan`**（后端零消费方）。⚠️ **配对约定**：上传组件列表里存「展示地址」的，提交前必须过 `genFilePath` 还原成相对路径（`MediaUpload.vue` 那条链）；存「相对路径」的不需要转换（`TraceAttachUpload.vue` 那条链刻意如此）。
  - ⚠️ **升级顺序约束**：升级链路是「**旧 App** 读**新库**值」，所以 `app_version.url`（`util/app.ts` 的 `startUpdate` 走 `genFileUrl`）必须**先发新版 App、再清洗库里的老绝对地址**，否则老 App 拿到相对路径会下载失败。

### 其它
- **条码校验失败提示是多行文本**：后端 `MsgVO.checkCodeMsg` 回 `\n` 分隔的六行（首行「XXX校验失败」+ 段名称/位置/类型/期望值/实际值）。两模板只是**原样**塞进 `setCustomModal({ content })`、不解析不拆分，**要改格式只改后端**。条码「总数」额度校验也走同一条通路，**app 侧零改动**。⚠️ **`CustomModal.vue` 的 `.content` 必须保留 `white-space: pre-wrap`**（配 `word-break: break-all`）：`{{ customModalStore.content }}` 是单个插值，没有这条样式 `\n` 会**塌成一个空格**、六行糊成一行。
- **返工提交链路**：`reworked=1` 时出「是否返工：是/否」（`'2'`=是 / `'1'`=否）。提交落库后老 `ld_trace` 行置 `del=1`、新记录 `submit_type=2`，流水号复用老记录的（不消耗新流水号）。⚠️ **顺序约束**：`codeRuleScanSuccess()` 在条码填满时**直接调 `submit()`**，而 `submitType` 是提交那一刻才读 `form.submitType` 的 —— **工人必须先选返工再扫码**，先扫已有条码会当场被重复校验拦下、改「是」也来不及。

## 关键坑

- **`uni-pagination` 的 `@change` 不能直接绑 `searchList()`**：分页组件会回传 `{ current }`，直接调 `searchList()` 会丢掉页码，`searchParam.currentPage` 永远是 1，翻页始终查第一页（`TraceLinePicker`、`TraceFailureModePicker` 曾中招）。统一绑 `pageSearch(page)`：先 `searchParam.value.currentPage = page.current`，再 `searchList()`。
- ⚠️ **别用 `page.goto` 打开 h5**：`http://localhost:5173/h5` 会把**已登录会话踢回** `/h5/pages/login/index`。点测时先登一次，之后一律用页面内导航（`.grid-item` 点击 / `history.back()`）。
- **H5 输入框主题色 + 空值呼吸光晕**（`App.vue` 的 `#ifdef H5` 块）：有边框的输入框边框与文字统一主题蓝 `#549df8`（= `store/theme.ts` 的 `globalColor.primary`，**不是** uview-plus 的 `$u-primary` `#3c9cff`），且**只在空值时**外圈 `box-shadow` 呼吸。⚠️ **别想拿 `border-color` 做动画**：`common.scss` 里 `.u-border` 的 `border-color` 带 `!important`，优先级高于 `@keyframes`，动画是死的 → 呼吸落在 `box-shadow` 上。⚠️ **判空不能用 `:placeholder-shown`**：uni-app 的 H5 **没给原生 input 挂 placeholder 属性**（占位是它自己另画的 div），该伪类**永远匹配不上**。实际信号是那个 div 的**内联 style**（空值 `"color: ...;"`、有值才追加 `display: none;`），故用 `:has([class*="placeholder"]:not([style*="display: none"])…)` 反向选中。`:has()` 老浏览器不认会整条跳过、降级成「没有光晕」。
- **报工页 PC（宽屏浏览器）兼容层**（`traceInfo/index.vue` 的 `<style>`，整段在 `/* #ifdef H5 */` 内、由 `.report-page` 包住）。⚠️ **页面 `<style>` 块不写 `scoped` 也会被自动加作用域**（`[data-v-xxx]`），表单/按钮/表格都在子组件里，**必须 `:deep()` 才穿透得到**。⚠️ **`up-button` 在 H5 上渲染成 `uni-button`**，uni-app 的全局 base 样式带 `margin-left/right: auto`，固定宽度前要显式清掉。⚠️ **垂直居中的位置别搞混**：`.u-form-item` 是**纵向** flex，要在它上面加 `justify-content: center`（纵向主轴）+ `.u-form-item__body { align-items: center }`；**不能在 `.u-form-item` 上加 `align-items: center`**（那是交叉轴 = 横向，会把内容横向居中）。
- **表单按语义分块**：P014/P015 的 `up-form` 分成 基础信息 / 自定义条码 / 数量 / 是否合格 四块独立卡片。⚠️ **块级 `v-if` 必须跟着块内子项的条件走**，否则渲染成一张只有 2px 边框的空卡片。

## 已下线（勿再找）

- **仓储管理整块**（12 个页面 + 9 个 `*DefaultSetPage` + 入库/出库/调拨/退货/扫码检验链路 + `api/{business,checkVouch,deliveryMaterial,purchaseArrival}.ts` + 20 个专用组件 + 11 个仓储宫格图标）；`pages.json` 的「仓库管理」块摘除、**只保留块内的 `board`（TV 看板）**。⚠️ **保留的易混项**：`api/trace.ts` 的 `codeCheckInfoApi` 与删掉的 `api/checkVouch.ts`/`codeCheck` 页**不是一回事**，它被报工模板 P014/P015 使用；`board` 页借用的 `static/home/out_sr_doc_upload.svg` 也保留。`UpInputScan`/`UpInputDatePicker`/`MediaUpload` 等被保留页继续使用，不属仓储孤儿。
- **报工模板两段死逻辑**：首末件检查（`checkHeadTail` + `headTailCheck()` + `firstNum/finalNum`，后端 `ld_check_ff_set`/`ld_check_ff_audit` 已 DROP）；`resetPlc`（`if (form.value.resetPlc)` 调 `traceResetPlc` —— **该端点从未存在**、只会打 404）。
- **打包页「生成托车码 / 重打印」第二组按钮**（`BoxBarcodePrinter1`/`BoxBarcodeRePrinter1` 两文件 + `templateP015.vue` 里 `v-if="form.printed == 1"` 整块 + `util.ts` 的 `printBoxBarcode1`）—— 与上半组调同一端点 `ldPrintBarcode/add2`、数据链早已停用。⚠️ **`printBoxBarcode`（箱码，上半组在用）不动**。`ld_line_detail.printed` 列**两库均已 DROP**（43 → 42 列）。
- **设备维护重构的接口契约**（⚠️ 这批 h5 改动只做过静态检查、未实机实测）：`/trace/findEquipment` 返回体字段是 **`equipmentCode`/`equipmentName`**（不是 `moldCode`/`moldName`）；`ldEquipment/findCardByUrl` 端点不存在，h5 没有「扫工模卡片二维码自动换出设备编码/工装编码」逻辑。**代价（用户已拍板接受）**：扫到网址串时条码值就是**网址本身**。
