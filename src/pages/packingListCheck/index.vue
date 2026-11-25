<script lang="ts" setup>
	import { computed, ref } from "vue"
	import CustomNavBar from "@/components/CustomNavBar.vue"
	import UpInputScan from "@/components/UpInputScan.vue"
	import { routes } from "@/store/route"
	import {
		previewPackingListCheckApi,
		submitPackingListCheckApi
	} from "@/api/packingListCheck"
	import type {
		PackingListCheckCodeRow,
		PackingListCheckPartRow,
		PackingListCheckPreview
	} from "@/api/packingListCheck"

	// 扫描前异常快照：零件号 → 状态 + 已扫数量
	type AnomalySnapshot = { [partNo : string] : { status : number; scanned : number } }
	// 扫描前的完整预览状态，取消添加时原样恢复
	type PreviewSnapshot = {
		rows : PackingListCheckPartRow[]
		codes : PackingListCheckCodeRow[]
		scanCodes : string[]
		palletCount : number
		boxCount : number
		diffCount : number
		pass : boolean
		alreadyCheckedCodes : string[]
	}
	// 本次扫码新引入的异常
	type ScanAnomaly = {
		partNo : string
		partName ?: string
		status : number
		expected : number
		scanned : number
	}

	// 装箱单（扫 TO # 码后带出）
	const record = ref<Obj | null>(null)
	// 零件对比行
	const rows = ref<PackingListCheckPartRow[]>([])
	// 服务端返回的已扫码（含托码展开说明）
	const codes = ref<PackingListCheckCodeRow[]>([])
	// 实际扫描的码序列，每次预览都整单提交给后端重算
	const scanCodes = ref<string[]>([])
	const palletCount = ref(0)
	const boxCount = ref(0)
	const diffCount = ref(0)
	const pass = ref(false)
	// 当前装箱单自己已校验过的码（允许继续使用，扫码时提示）
	const alreadyCheckedCodes = ref<string[]>([])
	const submitting = ref(false)
	// 已提交后锁定本次校验，只能重新开始
	const submitted = ref(false)
	// 已扫码列表默认展开，码多时可收起
	const codesOpen = ref(true)
	// 只看差异（缺件 / 多件 / 装箱单外）
	const diffOnly = ref(false)

	const toNoInput = ref("")
	const codeInput = ref("")

	// 当前展示的零件行：可切换只看差异
	const displayRows = computed(() => {
		if (!diffOnly.value) return rows.value
		return rows.value.filter(row => row.status == 2 || row.status == 3 || row.status == 4)
	})

	// 差异项数量（缺件 / 多件 / 装箱单外）
	const diffRowCount = computed(() => {
		if (!scanCodes.value.length) return 0
		return rows.value.filter(row => row.status == 2 || row.status == 3 || row.status == 4).length
	})

	// 汇总区结果样式
	const resultClass = computed(() => {
		if (!scanCodes.value.length) return "res-wait"
		return pass.value ? "res-pass" : "res-fail"
	})

	// 汇总区结果文案
	const resultText = computed(() => {
		if (!scanCodes.value.length) return "待扫码"
		return pass.value ? "校验通过" : "存在差异"
	})

	// 应用一次预览结果
	const applyPreview = (data : PackingListCheckPreview) => {
		record.value = data.record
		rows.value = data.list || []
		codes.value = data.codes || []
		scanCodes.value = codes.value.map(item => item.code)
		palletCount.value = data.palletCount || 0
		boxCount.value = data.boxCount || 0
		diffCount.value = data.diffCount || 0
		pass.value = !!data.pass
		alreadyCheckedCodes.value = data.alreadyCheckedCodes || []
	}

	// 扫装箱单 TO # 码：带出单据并初始化对比
	const loadPackingList = async (code : string) => {
		const toNo = (code || "").trim()
		if (!toNo) return
		try {
			const res = await previewPackingListCheckApi({ toNo, codes: [] })
			applyPreview(res.data)
			submitted.value = false
			diffOnly.value = false
			codesOpen.value = true
			toNoInput.value = ""
		} catch (err) {
			// 接口异常已由请求封装统一弹窗
			console.log(err)
		}
	}

	// 用当前扫描序列重新预览；失败返回 false
	const refreshPreview = async () => {
		if (!record.value) return false
		try {
			const res = await previewPackingListCheckApi({
				toNo: record.value.toNo,
				codes: scanCodes.value
			})
			applyPreview(res.data)
			return true
		} catch (err) {
			// 接口异常已由请求封装统一弹窗
			console.log(err)
			return false
		}
	}

	// 记录扫码前的完整状态，取消添加时直接恢复，不再多发一次预览请求
	const snapshotPreview = () : PreviewSnapshot => {
		return {
			rows: [...rows.value],
			codes: [...codes.value],
			scanCodes: [...scanCodes.value],
			palletCount: palletCount.value,
			boxCount: boxCount.value,
			diffCount: diffCount.value,
			pass: pass.value,
			alreadyCheckedCodes: [...alreadyCheckedCodes.value]
		}
	}

	// 恢复扫码前状态
	const restorePreview = (state : PreviewSnapshot) => {
		rows.value = state.rows
		codes.value = state.codes
		scanCodes.value = state.scanCodes
		palletCount.value = state.palletCount
		boxCount.value = state.boxCount
		diffCount.value = state.diffCount
		pass.value = state.pass
		alreadyCheckedCodes.value = state.alreadyCheckedCodes
	}

	// 记录扫码前已有的异常，避免同一个异常反复提示
	const snapshotAnomalies = () => {
		const snapshot : AnomalySnapshot = {}
		for (const row of rows.value) {
			if (row.status == 3 || row.status == 4) {
				snapshot[row.partNo] = {
					status: row.status,
					scanned: Number(row.scannedQuantity) || 0
				}
			}
		}
		return snapshot
	}

	// 找出本次扫码新引入的异常：新出现的装箱单外零件、新出现或数量继续增加的多件
	const collectNewAnomalies = (before : AnomalySnapshot) => {
		const list : ScanAnomaly[] = []
		for (const row of rows.value) {
			if (row.status != 3 && row.status != 4) continue
			const prev = before[row.partNo]
			if (row.status == 4) {
				if (!prev || prev.status != 4) {
					list.push({
						partNo: row.partNo,
						partName: row.partName,
						status: row.status,
						expected: Number(row.expectedQuantity) || 0,
						scanned: Number(row.scannedQuantity) || 0
					})
				}
			} else if (!prev || prev.status != 3 || Number(row.scannedQuantity) > prev.scanned) {
				list.push({
					partNo: row.partNo,
					partName: row.partName,
					status: row.status,
					expected: Number(row.expectedQuantity) || 0,
					scanned: Number(row.scannedQuantity) || 0
				})
			}
		}
		return list
	}

	// 拼确认提示文案
	const buildAnomalyMessage = (list : ScanAnomaly[]) => {
		const outside = list.filter(item => item.status == 4)
		const over = list.filter(item => item.status == 3)
		const lines : string[] = []
		if (outside.length) {
			lines.push("装箱单外零件：" + outside.map(item =>
				`${item.partNo}（${fmtQty(item.scanned)} 件）`).join("、"))
		}
		if (over.length) {
			lines.push("超出应装数量：" + over.map(item =>
				`${item.partNo} 应装 ${fmtQty(item.expected)}，已扫 ${fmtQty(item.scanned)}`).join("；"))
		}
		return lines.join("\n") + "\n是否继续添加该码？"
	}

	// 添加前确认：用户取消则不加这个码
	const confirmAdd = (list : ScanAnomaly[]) => {
		return new Promise<boolean>((resolve) => {
			uni.showModal({
				title: "确认添加",
				content: buildAnomalyMessage(list),
				confirmText: "继续添加",
				cancelText: "取消",
				success: (res) => resolve(!!res.confirm),
				fail: () => resolve(false)
			})
		})
	}

	// 扫托码/箱码
	const onScan = async (code : string) => {
		const value = (code || "").trim()
		codeInput.value = ""
		if (!value) return
		if (!record.value) {
			await loadPackingList(value)
			return
		}
		if (submitted.value) return
		const beforeState = snapshotPreview()
		const before = snapshotAnomalies()
		scanCodes.value.push(value)
		const ok = await refreshPreview()
		if (!ok) {
			restorePreview(beforeState)
			return
		}
		// 当前装箱单自己已校验过的码仍可使用，提示一下；其他装箱单校验过的码由后端拦截弹窗
		if (alreadyCheckedCodes.value.includes(value)) {
			uni.showToast({
				icon: "none",
				title: `该码已由当前装箱单 ${record.value ? record.value.toNo : ""} 校验，可继续使用`
			})
		}
		const anomalies = collectNewAnomalies(before)
		if (!anomalies.length) return
		const confirmed = await confirmAdd(anomalies)
		if (!confirmed) {
			restorePreview(beforeState)
		}
	}

	// 删除某个已扫码（提交前）
	const removeCode = async (index : number) => {
		if (submitted.value) return
		scanCodes.value.splice(index, 1)
		await refreshPreview()
	}

	// 提交校验：后端重算一遍并落库
	const submit = async () => {
		if (submitting.value || !record.value) return
		if (!scanCodes.value.length) {
			uni.showToast({
				icon: "none",
				title: "请先扫码"
			})
			return
		}
		try {
			submitting.value = true
			const res = await submitPackingListCheckApi({
				toNo: record.value.toNo,
				codes: scanCodes.value
			})
			const result = res.data as Obj
			submitted.value = true
			uni.showModal({
				title: "校验结果",
				content: result && result.checkResult == 1
					? "校验通过，记录已保存"
					: "存在差异，记录已保存",
				showCancel: false,
				success: () => {
					// 记录已保存，回到扫装箱单（TO #）的初始页，继续校验下一张
					resetAll()
				}
			})
		} catch (err) {
			// 接口异常已由请求封装统一弹窗
			console.log(err)
		} finally {
			submitting.value = false
		}
	}

	// 重新开始（换一张装箱单）
	const resetAll = () => {
		record.value = null
		rows.value = []
		codes.value = []
		scanCodes.value = []
		palletCount.value = 0
		boxCount.value = 0
		diffCount.value = 0
		pass.value = false
		alreadyCheckedCodes.value = []
		submitted.value = false
		diffOnly.value = false
		codesOpen.value = true
		toNoInput.value = ""
		codeInput.value = ""
	}

	// 没扫码时所有零件都是「待扫」，不显示成缺件
	const rowStatus = (row : PackingListCheckPartRow) => {
		return scanCodes.value.length ? row.status : 0
	}

	const statusText = (status : number) => {
		if (status == 1) return "一致"
		if (status == 2) return "缺件"
		if (status == 3) return "多件"
		if (status == 4) return "单外"
		return "待扫"
	}

	const statusClass = (status : number) => {
		if (status == 1) return "st-same"
		if (status == 2) return "st-missing"
		if (status == 4) return "st-outside"
		if (status == 3) return "st-over"
		return "st-wait"
	}

	const fmtQty = (value : any) => {
		const num = Number(value)
		return isNaN(num) ? "-" : String(num)
	}

	// 差异数：未扫/一致不显示具体差异
	const diffText = (row : PackingListCheckPartRow) => {
		const status = rowStatus(row)
		if (!status) return "-"
		if (status == 1) return "0"
		return fmtQty(row.diffQuantity)
	}

	// 已扫码副标题：托码显示箱数，箱码显示数量和所属托码
	const codeSub = (item : PackingListCheckCodeRow) => {
		if (item.codeType == 1) return `托码 · ${item.boxCount} 箱`
		const segments = item.code.split(",")
		const qty = segments.length > 1 ? segments[1] : ""
		const owner = item.palletCode ? `所属 ${item.palletCode}` : "独立箱码"
		return qty ? `数量 ${qty} · ${owner}` : owner
	}
</script>

<template>
	<view class="common-page-container check-page" :class="{ 'has-bar': record }">
		<CustomNavBar :title="routes.PackingListCheck.style.navigationBarTitleText"></CustomNavBar>

		<!-- 步骤一：扫装箱单 -->
		<template v-if="!record">
			<view class="start-hero">
				<view class="hero-mark">TO</view>
				<view class="hero-title">扫描装箱单</view>
				<view class="hero-desc">扫描标准装箱单右上角的 TO # 码，核对托码与箱码的零件总数</view>
				<view class="hero-scan">
					<up-input-scan key="toNoScan" v-model="toNoInput" @scanSuccess="loadPackingList"
						placeholder="扫描 / 输入 TO # 码" clearable focus></up-input-scan>
				</view>
			</view>

			<view class="steps-card">
				<view class="step-item">
					<text class="step-no">1</text>
					<view class="step-main">
						<text class="step-title">扫装箱单</text>
						<text class="step-desc">扫描单据右上角的 TO # 码，带出应装零件</text>
					</view>
				</view>
				<view class="step-item">
					<text class="step-no">2</text>
					<view class="step-main">
						<text class="step-title">扫托码 / 箱码</text>
						<text class="step-desc">扫多少算多少，重复的码和已扫托下的箱码会被拦下</text>
					</view>
				</view>
				<view class="step-item">
					<text class="step-no">3</text>
					<view class="step-main">
						<text class="step-title">提交校验</text>
						<text class="step-desc">按每种零件的总数量核对，结果保存到 web 校验记录</text>
					</view>
				</view>
			</view>

			<view class="rules-card">
				<view class="card-head">
					<text class="card-title">校验规则</text>
				</view>
				<view class="rule-item">只比对每种零件的总数量，不区分在哪一托、哪一箱</view>
				<view class="rule-item">同一托码 / 箱码不能重复扫描</view>
				<view class="rule-item">扫过托码后，不能再扫该托下的箱码；先扫箱码再扫托码可以</view>
				<view class="rule-item">扫到装箱单外零件或超出应装数量，会先弹窗确认再添加</view>
			</view>
		</template>

		<template v-else>
			<!-- 单据信息 -->
			<view class="doc-card">
				<view class="doc-main">
					<text class="doc-no">{{ record.toNo }}</text>
					<text class="doc-sub">ASN #：{{ record.asnNo || '-' }}</text>
					<text class="doc-sub">收货方：{{ record.consigneeFactory || '-' }}</text>
				</view>
				<text class="doc-switch" @click="resetAll">换单</text>
			</view>

			<!-- 步骤二：扫托码/箱码 -->
			<view v-if="!submitted" class="scan-card">
				<view class="card-head">
					<text class="card-title">扫描托码 / 箱码</text>
					<text class="card-sub">扫完自动核对</text>
				</view>
				<view class="scan-box">
					<up-input-scan key="codeScan" v-model="codeInput" @scanSuccess="onScan"
						placeholder="扫描托码或箱码" clearable focus></up-input-scan>
				</view>
				<view class="scan-tip">扫过托码后不能再扫该托的箱码；装箱单外 / 超量会先提示确认</view>
			</view>

			<!-- 提交结果 -->
			<view v-if="submitted" class="result-banner" :class="pass ? 'banner-pass' : 'banner-fail'">
				<text class="banner-title">{{ pass ? '校验通过' : '存在差异' }}</text>
				<text class="banner-sub">记录已保存，可在 web「标准装箱单 · 校验记录」查看</text>
			</view>

			<!-- 汇总 -->
			<view class="stat-card">
				<view class="stat">
					<text class="stat-num">{{ palletCount }}</text>
					<text class="stat-label">托码</text>
				</view>
				<view class="stat">
					<text class="stat-num">{{ boxCount }}</text>
					<text class="stat-label">箱码</text>
				</view>
				<view class="stat">
					<text class="stat-num" :class="{ 'num-fail': scanCodes.length && diffCount }">
						{{ scanCodes.length ? diffCount : 0 }}
					</text>
					<text class="stat-label">差异项</text>
				</view>
				<text class="stat-result" :class="resultClass">{{ resultText }}</text>
			</view>

			<!-- 零件对比 -->
			<view class="part-card">
				<view class="card-head">
					<view class="head-left">
						<text class="card-title">零件对比</text>
						<text class="card-count">{{ rows.length }} 种</text>
						<text v-if="diffRowCount" class="card-diff">差异 {{ diffRowCount }}</text>
					</view>
					<text v-if="scanCodes.length" class="head-toggle" @click="diffOnly = !diffOnly">
						{{ diffOnly ? '查看全部' : '只看差异' }}
					</text>
				</view>
				<view class="part-table">
					<view class="part-thead">
						<text class="col-part">零件</text>
						<text class="col-num">应装</text>
						<text class="col-num">已扫</text>
						<text class="col-num">差异</text>
						<text class="col-status">状态</text>
					</view>
					<view v-for="(row, index) in displayRows" :key="'part' + index" class="part-tr"
						:class="statusClass(rowStatus(row))">
						<view class="col-part">
							<text class="part-no">{{ row.partNo }}</text>
							<text class="part-name">{{ row.partName || '-' }}</text>
						</view>
						<text class="col-num">{{ fmtQty(row.expectedQuantity) }}</text>
						<text class="col-num">{{ rowStatus(row) ? fmtQty(row.scannedQuantity) : '-' }}</text>
						<text class="col-num col-diff">{{ diffText(row) }}</text>
						<text class="col-status">
							<text class="status-tag">{{ statusText(rowStatus(row)) }}</text>
						</text>
					</view>
					<view v-if="!displayRows.length" class="empty">
						{{ rows.length ? '暂无差异项' : '装箱单没有零件明细' }}
					</view>
				</view>
			</view>

			<!-- 已扫码 -->
			<view class="code-card">
				<view class="card-head" @click="codesOpen = !codesOpen">
					<view class="head-left">
						<text class="card-title">已扫码</text>
						<text class="card-count">{{ codes.length }} 个</text>
					</view>
					<text class="head-toggle">{{ codesOpen ? '收起' : '展开' }}</text>
				</view>
				<view v-if="codesOpen">
					<view v-for="(item, index) in codes" :key="'code' + index" class="code-row">
						<text class="code-tag" :class="item.codeType == 1 ? 'tag-pallet' : 'tag-box'">
							{{ item.codeType == 1 ? '托' : '箱' }}
						</text>
						<view class="code-main">
							<text class="code-value">{{ item.code }}</text>
							<text class="code-sub">{{ codeSub(item) }}</text>
						</view>
						<up-icon v-if="!submitted" name="trash" color="#f56c6c" size="18"
							class="code-del" @click.stop="removeCode(index)"></up-icon>
					</view>
					<view v-if="!codes.length" class="empty">还没有扫码</view>
				</view>
			</view>
		</template>

		<!-- 底部固定栏：提交后最新记录待审核，不允许再次校验，提交成功即返回上一页 -->
		<view v-if="record && !submitted" class="tool-bar">
			<up-button type="success" text="提交校验" shape="circle" style="flex: 1"
				:loading="submitting" :disabled="submitting || !scanCodes.length" @click="submit"></up-button>
		</view>
	</view>
</template>

<style lang="scss" scoped>
	.check-page {
		box-sizing: border-box;
		min-height: 100vh;
		background-color: #f5f6f8;
	}

	.check-page.has-bar {
		padding-bottom: calc(200rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(200rpx + env(safe-area-inset-bottom));
	}

	/* 步骤一：说明区 */
	.start-hero {
		margin-top: 24rpx;
		padding: 48rpx 36rpx 40rpx;
		border-radius: 20rpx;
		background: linear-gradient(135deg, #2979ff 0%, #5b9bff 100%);
		box-shadow: 0 12rpx 30rpx rgba(41, 121, 255, 0.25);
	}

	.hero-mark {
		width: 88rpx;
		height: 88rpx;
		line-height: 88rpx;
		text-align: center;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.2);
		color: #ffffff;
		font-size: 32rpx;
		font-weight: bold;
	}

	.hero-title {
		margin-top: 24rpx;
		color: #ffffff;
		font-size: 44rpx;
		font-weight: bold;
	}

	.hero-desc {
		margin-top: 12rpx;
		color: rgba(255, 255, 255, 0.82);
		font-size: 26rpx;
		line-height: 1.6;
	}

	.hero-scan {
		margin-top: 36rpx;
		padding: 4rpx 20rpx;
		border-radius: 16rpx;
		background-color: #ffffff;
	}

	.hero-scan :deep(.u-input),
	.scan-box :deep(.u-input) {
		border: none;
		background-color: transparent;
	}

	.steps-card,
	.rules-card {
		margin-top: 20rpx;
		padding: 28rpx;
		background-color: #ffffff;
		border-radius: 16rpx;
	}

	.step-item {
		display: flex;
		align-items: flex-start;
		padding: 14rpx 0;
	}

	.step-no {
		flex-shrink: 0;
		width: 44rpx;
		height: 44rpx;
		line-height: 44rpx;
		margin-right: 16rpx;
		text-align: center;
		border-radius: 50%;
		background-color: #ecf5ff;
		color: #2979ff;
		font-size: 24rpx;
		font-weight: bold;
	}

	.step-main {
		display: flex;
		flex: 1;
		flex-direction: column;
	}

	.step-title {
		color: #303133;
		font-size: 28rpx;
		font-weight: bold;
	}

	.step-desc {
		margin-top: 4rpx;
		color: #909399;
		font-size: 24rpx;
		line-height: 1.5;
	}

	.rule-item {
		position: relative;
		padding-left: 24rpx;
		color: #606266;
		font-size: 24rpx;
		line-height: 1.8;
	}

	.rule-item::before {
		position: absolute;
		top: 16rpx;
		left: 4rpx;
		width: 8rpx;
		height: 8rpx;
		border-radius: 50%;
		background-color: #c0c4cc;
		content: "";
	}

	/* 步骤二：卡片通用 */
	.doc-card,
	.scan-card,
	.stat-card,
	.part-card,
	.code-card,
	.result-banner {
		margin-top: 20rpx;
		padding: 24rpx 28rpx;
		background-color: #ffffff;
		border-radius: 16rpx;
	}

	.doc-card {
		display: flex;
		align-items: flex-start;
	}

	.doc-main {
		flex: 1;
		min-width: 0;
	}

	.doc-no {
		display: block;
		color: #303133;
		font-size: 40rpx;
		font-weight: bold;
	}

	.doc-sub {
		display: block;
		margin-top: 6rpx;
		overflow: hidden;
		color: #606266;
		font-size: 24rpx;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.doc-switch {
		flex-shrink: 0;
		margin-left: 16rpx;
		padding: 6rpx 18rpx;
		border: 1rpx solid #dcdfe6;
		border-radius: 24rpx;
		color: #606266;
		font-size: 22rpx;
	}

	.card-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16rpx;
	}

	.head-left {
		display: flex;
		align-items: baseline;
		min-width: 0;
	}

	.card-title {
		color: #303133;
		font-size: 30rpx;
		font-weight: bold;
	}

	.card-count {
		margin-left: 12rpx;
		color: #909399;
		font-size: 22rpx;
	}

	.card-diff {
		margin-left: 12rpx;
		color: #f56c6c;
		font-size: 22rpx;
	}

	.card-sub {
		color: #909399;
		font-size: 22rpx;
	}

	.head-toggle {
		flex-shrink: 0;
		margin-left: 16rpx;
		color: #2979ff;
		font-size: 24rpx;
	}

	.scan-box {
		padding: 4rpx 20rpx;
		border: 2rpx solid #c6e2ff;
		border-radius: 12rpx;
		background-color: #f7fbff;
	}

	.scan-tip {
		margin-top: 12rpx;
		color: #909399;
		font-size: 22rpx;
		line-height: 1.5;
	}

	/* 提交结果 */
	.result-banner {
		display: flex;
		flex-direction: column;
	}

	.banner-pass {
		background-color: #e8f5e9;
	}

	.banner-fail {
		background-color: #fdecea;
	}

	.banner-title {
		font-size: 36rpx;
		font-weight: bold;
	}

	.banner-pass .banner-title {
		color: #2e9e4f;
	}

	.banner-fail .banner-title {
		color: #f56c6c;
	}

	.banner-sub {
		margin-top: 8rpx;
		color: #606266;
		font-size: 24rpx;
	}

	/* 汇总条 */
	.stat-card {
		display: flex;
		align-items: center;
		padding-top: 20rpx;
		padding-bottom: 20rpx;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 108rpx;
	}

	.stat + .stat {
		border-left: 1rpx solid #f0f2f5;
	}

	.stat-num {
		color: #303133;
		font-size: 34rpx;
		font-weight: bold;
		line-height: 1.2;
	}

	.stat-num.num-fail {
		color: #f56c6c;
	}

	.stat-label {
		margin-top: 4rpx;
		color: #909399;
		font-size: 22rpx;
	}

	.stat-result {
		flex: 1;
		text-align: right;
		font-size: 30rpx;
		font-weight: bold;
	}

	.res-wait {
		color: #909399;
	}

	.res-pass {
		color: #2e9e4f;
	}

	.res-fail {
		color: #f56c6c;
	}

	/* 零件对比表 */
	.part-table {
		margin-top: 4rpx;
	}

	.part-thead,
	.part-tr {
		display: flex;
		align-items: center;
	}

	.part-thead {
		padding: 10rpx 0;
		border-bottom: 1rpx solid #ebeef5;
	}

	.part-thead text {
		color: #909399;
		font-size: 22rpx;
	}

	.part-tr {
		padding: 16rpx 0;
		border-bottom: 1rpx solid #f2f3f5;
	}

	.part-tr:last-child {
		border-bottom: none;
	}

	.col-part {
		flex: 1;
		min-width: 0;
	}

	.part-no {
		display: block;
		overflow: hidden;
		color: #303133;
		font-size: 28rpx;
		font-weight: bold;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.part-name {
		display: block;
		margin-top: 2rpx;
		overflow: hidden;
		color: #909399;
		font-size: 22rpx;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.col-num {
		flex-shrink: 0;
		width: 72rpx;
		text-align: right;
		color: #606266;
		font-size: 26rpx;
	}

	.part-thead .col-num,
	.part-thead .col-status {
		color: #909399;
		font-size: 22rpx;
	}

	.col-diff {
		color: #909399;
	}

	.st-missing .col-diff {
		color: #e6a23c;
	}

	.st-over .col-diff,
	.st-outside .col-diff {
		color: #f56c6c;
		font-weight: bold;
	}

	.col-status {
		flex-shrink: 0;
		width: 84rpx;
		text-align: right;
	}

	.status-tag {
		display: inline-block;
		padding: 2rpx 10rpx;
		border-radius: 6rpx;
		font-size: 20rpx;
	}

	.st-wait .status-tag {
		background-color: #f2f3f5;
		color: #909399;
	}

	.st-same .status-tag {
		background-color: #e8f5e9;
		color: #2e9e4f;
	}

	.st-missing .status-tag {
		background-color: #fdf6ec;
		color: #e6a23c;
	}

	.st-over .status-tag {
		background-color: #fdecea;
		color: #f56c6c;
	}

	.st-outside .status-tag {
		background-color: #f3ecff;
		color: #7c4dff;
	}

	.st-over .part-no,
	.st-outside .part-no {
		color: #f56c6c;
	}

	/* 已扫码 */
	.code-row {
		display: flex;
		align-items: center;
		padding: 14rpx 0;
		border-bottom: 1rpx solid #f2f3f5;
	}

	.code-row:last-child {
		border-bottom: none;
	}

	.code-tag {
		flex-shrink: 0;
		width: 40rpx;
		height: 40rpx;
		line-height: 40rpx;
		margin-right: 14rpx;
		text-align: center;
		border-radius: 8rpx;
		font-size: 22rpx;
	}

	.tag-pallet {
		background-color: #ecf5ff;
		color: #409eff;
	}

	.tag-box {
		background-color: #f4f4f5;
		color: #606266;
	}

	.code-main {
		flex: 1;
		min-width: 0;
	}

	.code-value {
		display: block;
		color: #303133;
		font-size: 24rpx;
		line-height: 1.4;
		word-break: break-all;
	}

	.code-sub {
		display: block;
		margin-top: 2rpx;
		color: #909399;
		font-size: 22rpx;
	}

	.code-del {
		flex-shrink: 0;
		margin-left: 16rpx;
		padding: 8rpx;
	}

	.empty {
		padding: 30rpx 0;
		text-align: center;
		color: #909399;
		font-size: 24rpx;
	}

	/* 底部固定栏 */
	.tool-bar {
		position: fixed;
		left: 24rpx;
		right: 24rpx;
		bottom: calc(20rpx + constant(safe-area-inset-bottom));
		bottom: calc(20rpx + env(safe-area-inset-bottom));
		z-index: 10;
		display: flex;
		padding: 16rpx 20rpx;
		background-color: #ffffff;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
	}
</style>
