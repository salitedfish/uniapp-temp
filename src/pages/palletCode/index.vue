<script lang="ts" setup>
	import { computed, nextTick, onMounted, ref } from "vue"
	import CustomNavBar from "@/components/CustomNavBar.vue"
	import UpInputScan from "@/components/UpInputScan.vue"
	import PrinterPicker from "@/components/PrinterPicker.vue"
	import { routes } from "@/store/route"
	import { findBoxBindingsApi, generatePalletCodeApi, printPalletCodeApi } from "@/api/palletCode"

	// 单次最多绑定箱码数，与后端一致
	const MAX_BOX_COUNT = 200

	type BoxRow = { key : number; code : string }

	let keySeed = 0
	const newRow = () : BoxRow => ({ key: keySeed++, code: "" })

	const rows = ref<BoxRow[]>([])
	// 当前需要聚焦的行下标
	const focusIndex = ref(-1)
	const generating = ref(false)
	const palletCode = ref("")
	const boundCount = ref(0)
	// 装箱清单打印结果：null 未打印 / true 完成 / false 失败
	const printOk = ref < boolean | null > (null)

	// 已扫描（非空）的箱码数，底部按钮上直接显示
	const filledCount = computed(() => rows.value.filter(row => (row.code || "").trim()).length)

	// 打印机（必选，选择一次后缓存，与报工打印共用同一个 key）
	const printerSelected = ref < string[] > ([])
	const printerName = ref("")
	onMounted(() => {
		const cached = uni.getStorageSync("printer") as string
		if (cached) {
			printerSelected.value = [cached]
			printerName.value = cached
		}
	})
	const printerSelect = (arr : string[]) => {
		if (arr && arr.length > 0) {
			printerName.value = arr[0]
			uni.setStorageSync("printer", arr[0])
		}
	}

	// 箱码格式：条码,数量,yyyy-MM-dd,流水号，必须与箱码生成页产出一致
	const isValidBoxCode = (code : string) => {
		const parts = (code || "").split(",")
		if (parts.length != 4) return false
		const [partNo, quantity, date, serial] = parts
		if (!partNo.trim() || !/^[1-9]\d*$/.test(quantity) || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
			!/^\d{4,}$/.test(serial)) return false
		const [year, month, day] = date.split("-").map(Number)
		const dt = new Date(year, month - 1, day)
		return dt.getFullYear() == year && dt.getMonth() == month - 1 && dt.getDate() == day
	}

	// 添加一个箱码输入框并自动聚焦
	const addRow = () => {
		if (rows.value.length >= MAX_BOX_COUNT) {
			uni.showToast({
				icon: "none",
				title: `单次最多绑定 ${MAX_BOX_COUNT} 个箱码`
			})
			return
		}
		rows.value.push(newRow())
		nextTick(() => {
			focusIndex.value = rows.value.length - 1
		})
	}

	// 重新聚焦到指定行
	const refocus = (index : number) => {
		focusIndex.value = -1
		nextTick(() => {
			focusIndex.value = index
		})
	}

	// 扫码结果回填到对应输入框；格式不对、本次内重复、已绑定托码都直接清掉
	const onScan = async (index : number, code : string) => {
		const row = rows.value[index]
		if (!row) return
		const value = (code || "").trim()
		if (!value) {
			row.code = ""
			return
		}
		row.code = value
		if (!isValidBoxCode(value)) {
			row.code = ""
			refocus(index)
			uni.showToast({
				icon: "none",
				title: "箱码格式不正确"
			})
			return
		}
		for (let i = 0; i < rows.value.length; i++) {
			if (i != index && (rows.value[i].code || "").trim() == value) {
				row.code = ""
				refocus(index)
				uni.showToast({
					icon: "none",
					title: `箱码重复: ${value}`
				})
				return
			}
		}
		// 已绑定托码的箱码不能再绑其他托码，必须先把原托码删掉
		try {
			const res = await findBoxBindingsApi([value])
			const current = rows.value[index]
			if (!current || (current.code || "").trim() != value) return
			const bound = (res.data || []).find(item => item.boxCode == value)
			if (!bound) return
			current.code = ""
			refocus(index)
			uni.showModal({
				title: "不能重复绑定",
				content: `箱码已绑定托码 ${bound.palletCode || ""}，不能重复绑定。如需重新组托，请先删除原托码。`,
				showCancel: false,
				confirmText: "知道了"
			})
		} catch (err) {
			// 接口异常已由请求封装统一弹窗，清掉本行避免带着未知状态提交
			const current = rows.value[index]
			if (current && (current.code || "").trim() == value) {
				current.code = ""
				refocus(index)
			}
			console.log(err)
		}
	}

	// 删掉一行；只剩一行时清空即可
	const removeRow = (index : number) => {
		if (rows.value.length <= 1) {
			rows.value[0].code = ""
			focusIndex.value = 0
			return
		}
		rows.value.splice(index, 1)
		focusIndex.value = -1
	}

	// 生成托码：箱码交后端绑定
	const generate = async () => {
		if (generating.value) return
		const codes = rows.value.map(row => (row.code || "").trim()).filter(Boolean)
		if (!codes.length) {
			uni.showToast({
				icon: "none",
				title: "请先添加箱码"
			})
			return
		}
		const seen = new Set<string>()
		for (const code of codes) {
			if (!isValidBoxCode(code)) {
				uni.showToast({
					icon: "none",
					title: `箱码格式不正确: ${code.length > 30 ? code.slice(0, 30) + "..." : code}`
				})
				return
			}
			if (seen.has(code)) {
				uni.showToast({
					icon: "none",
					title: `箱码重复: ${code}`
				})
				return
			}
			seen.add(code)
		}
		if (!printerName.value) {
			uni.showToast({
				icon: "none",
				title: "请选择打印机"
			})
			return
		}
		printOk.value = null
		try {
			generating.value = true
			const res = await generatePalletCodeApi({ boxCodes: codes })
			palletCode.value = res.data
			boundCount.value = codes.length
			rows.value = []
			focusIndex.value = -1
			// 生成成功后自动打印装箱清单；打印失败不影响已生成的托码
			try {
				await printPalletCodeApi({
					palletCode: res.data,
					printerName: printerName.value
				})
				printOk.value = true
				uni.showToast({
					icon: "none",
					title: "托码已生成，打印完成"
				})
			} catch (err) {
				printOk.value = false
				// 打印异常已由请求封装统一弹窗
				console.log(err)
			}
		} catch (err) {
			// 接口异常已由请求封装统一弹窗
			console.log(err)
		} finally {
			generating.value = false
		}
	}
</script>

<template>
	<view class="common-page-container pallet-page page-with-fixed-bar">
		<CustomNavBar :title="routes.PalletCodeGenerate.style.navigationBarTitleText"></CustomNavBar>

		<!-- 顶部说明 -->
		<view class="pallet-hero">
			<view class="hero-top">
				<view class="hero-mark">托</view>
				<view class="hero-text">
					<text class="hero-title">托码生成</text>
					<text class="hero-desc">扫描箱码组托，生成托码并打印装箱清单</text>
				</view>
			</view>
			<view class="hero-steps">
				<view class="hero-step">
					<text class="hero-step-no">1</text>
					<text class="hero-step-text">扫箱码</text>
				</view>
				<view class="hero-step-line"></view>
				<view class="hero-step">
					<text class="hero-step-no">2</text>
					<text class="hero-step-text">生成托码</text>
				</view>
				<view class="hero-step-line"></view>
				<view class="hero-step">
					<text class="hero-step-no">3</text>
					<text class="hero-step-text">打印清单</text>
				</view>
			</view>
		</view>

		<!-- 打印设置 -->
		<view class="card">
			<view class="card-head">
				<view class="head-left">
					<text class="card-title">打印设置</text>
					<text class="card-sub">装箱清单打印到这台打印机</text>
				</view>
				<text class="required-tag">必填</text>
			</view>
			<view class="field-box">
				<PrinterPicker v-model:selected="printerSelected" @select="printerSelect"></PrinterPicker>
			</view>
		</view>

		<!-- 箱码列表 -->
		<view class="card">
			<view class="card-head">
				<view class="head-left">
					<text class="card-title">箱码列表</text>
					<text class="count-badge">{{ filledCount }}</text>
				</view>
				<text class="card-sub">最多 {{ MAX_BOX_COUNT }} 个</text>
			</view>

			<view v-if="rows.length" class="code-list">
				<view v-for="(row, index) in rows" :key="row.key" class="code-row">
					<text class="code-index" :class="{ 'is-filled': (row.code || '').trim() }">{{ index + 1 }}</text>
					<view class="code-input-box">
						<up-input-scan v-model="row.code" :focus="focusIndex == index" @scanSuccess="onScan(index, $event)"
							placeholder="请扫描箱码" clearable class="input-item" border="none"></up-input-scan>
					</view>
					<view class="row-del" @click="removeRow(index)">
						<up-icon name="trash" color="#f56c6c" size="19"></up-icon>
					</view>
				</view>
			</view>

			<view v-else class="code-empty">
				<view class="empty-icon">托</view>
				<text class="empty-title">还没有箱码</text>
				<text class="empty-sub">点击下方「添加箱码」开始扫描</text>
			</view>

			<view v-if="rows.length" class="add-line" @click="addRow">
				<up-icon name="plus" color="#2979ff" size="16"></up-icon>
				<text class="add-line-text">添加箱码</text>
			</view>
		</view>

		<!-- 生成结果 -->
		<view v-if="palletCode" class="card result-card">
			<view class="result-head">
				<view class="result-icon">✓</view>
				<view class="result-head-text">
					<text class="result-title">托码生成成功</text>
					<text class="result-sub">已绑定 {{ boundCount }} 个箱码</text>
				</view>
			</view>
			<view class="pallet-code">{{ palletCode }}</view>
			<view class="print-line">
				<text class="print-dot" :class="printOk ? 'dot-ok' : printOk == false ? 'dot-fail' : ''"></text>
				<text class="print-text" :class="printOk ? 'text-ok' : printOk == false ? 'text-fail' : ''">
					{{ printOk ? "装箱清单已打印" : printOk == false ? "装箱清单打印失败，可到 web 端重新打印" : "装箱清单打印中..." }}
				</text>
			</view>
			<view class="result-tip">该托码各箱码已绑定，不能再次组托</view>
		</view>

		<!-- 固定在页面底部 -->
		<view class="tool-bar">
			<up-button type="primary" text="添加箱码" icon="plus" shape="circle" custom-style="flex: 1"
				:disabled="generating" @click="addRow"></up-button>
			<up-button type="success" :text="filledCount ? `生成托码（${filledCount}）` : '生成托码'" shape="circle"
				custom-style="flex: 1; margin-left: 20rpx" :loading="generating" :disabled="generating"
				@click="generate"></up-button>
		</view>
	</view>
</template>

<style lang="scss" scoped>
	.pallet-page {
		box-sizing: border-box;
		min-height: 100vh;
		background-color: #f5f6f8;
	}

	// 底部内容给固定栏留出空间（含 iOS 安全区）
	.page-with-fixed-bar {
		padding-bottom: calc(180rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(180rpx + env(safe-area-inset-bottom));
	}

	/* 顶部说明 */
	.pallet-hero {
		margin-top: 24rpx;
		padding: 36rpx 32rpx 30rpx;
		border-radius: 24rpx;
		background: linear-gradient(135deg, #1e88e5 0%, #26c6da 100%);
		box-shadow: 0 12rpx 30rpx rgba(30, 136, 229, 0.25);
	}

	.hero-top {
		display: flex;
		align-items: center;
	}

	.hero-mark {
		flex-shrink: 0;
		width: 88rpx;
		height: 88rpx;
		line-height: 88rpx;
		text-align: center;
		border-radius: 24rpx;
		background-color: rgba(255, 255, 255, 0.2);
		color: #ffffff;
		font-size: 40rpx;
		font-weight: bold;
	}

	.hero-text {
		display: flex;
		flex: 1;
		flex-direction: column;
		margin-left: 22rpx;
		min-width: 0;
	}

	.hero-title {
		color: #ffffff;
		font-size: 42rpx;
		font-weight: bold;
		line-height: 1.3;
	}

	.hero-desc {
		margin-top: 8rpx;
		color: rgba(255, 255, 255, 0.84);
		font-size: 24rpx;
		line-height: 1.5;
	}

	.hero-steps {
		display: flex;
		align-items: center;
		margin-top: 30rpx;
		padding-top: 24rpx;
		border-top: 1rpx solid rgba(255, 255, 255, 0.22);
	}

	.hero-step {
		display: flex;
		align-items: center;
	}

	.hero-step-no {
		width: 32rpx;
		height: 32rpx;
		line-height: 32rpx;
		margin-right: 8rpx;
		text-align: center;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.92);
		color: #1e88e5;
		font-size: 20rpx;
		font-weight: bold;
	}

	.hero-step-text {
		color: #ffffff;
		font-size: 24rpx;
	}

	.hero-step-line {
		flex: 1;
		height: 2rpx;
		margin: 0 14rpx;
		background-color: rgba(255, 255, 255, 0.3);
	}

	/* 卡片通用 */
	.card {
		margin-top: 20rpx;
		padding: 28rpx;
		background-color: #ffffff;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 18rpx rgba(0, 0, 0, 0.03);
	}

	.card-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 18rpx;
	}

	.head-left {
		display: flex;
		align-items: center;
		min-width: 0;
	}

	.card-title {
		color: #303133;
		font-size: 30rpx;
		font-weight: bold;
	}

	.card-sub {
		margin-left: 12rpx;
		color: #909399;
		font-size: 22rpx;
	}

	.required-tag {
		flex-shrink: 0;
		padding: 4rpx 14rpx;
		border-radius: 20rpx;
		background-color: #ecf5ff;
		color: #2979ff;
		font-size: 20rpx;
	}

	.count-badge {
		min-width: 36rpx;
		height: 36rpx;
		line-height: 36rpx;
		margin-left: 12rpx;
		padding: 0 10rpx;
		text-align: center;
		border-radius: 18rpx;
		background-color: #ecf5ff;
		color: #2979ff;
		font-size: 20rpx;
	}

	.field-box {
		padding: 4rpx 18rpx;
		border: 2rpx solid #e4e7ed;
		border-radius: 14rpx;
		background-color: #fafbfc;
	}

	.field-box :deep(.u-input) {
		border: none;
		background-color: transparent;
	}

	/* 箱码列表 */
	.code-list {
		margin-top: 4rpx;
	}

	.code-row {
		display: flex;
		align-items: center;
		padding: 10rpx 0;
	}

	.code-row + .code-row {
		border-top: 1rpx solid #f5f6f8;
	}

	.code-index {
		flex-shrink: 0;
		width: 40rpx;
		height: 40rpx;
		line-height: 40rpx;
		margin-right: 14rpx;
		text-align: center;
		border-radius: 50%;
		background-color: #f4f4f5;
		color: #909399;
		font-size: 22rpx;
		font-weight: bold;
	}

	.code-index.is-filled {
		background-color: #e8f5e9;
		color: #2e9e4f;
	}

	.code-input-box {
		flex: 1;
		min-width: 0;
		padding: 4rpx 16rpx;
		border: 2rpx solid #c6e2ff;
		border-radius: 12rpx;
		background-color: #f7fbff;
	}

	.code-input-box :deep(.u-input) {
		border: none;
		background-color: transparent;
	}

	.row-del {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 64rpx;
		height: 64rpx;
		margin-left: 10rpx;
		border-radius: 12rpx;
		background-color: #fef0f0;
	}

	.code-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40rpx 0 30rpx;
	}

	.empty-icon {
		width: 96rpx;
		height: 96rpx;
		line-height: 96rpx;
		text-align: center;
		border-radius: 28rpx;
		background-color: #f4f7ff;
		color: #c6e2ff;
		font-size: 44rpx;
		font-weight: bold;
	}

	.empty-title {
		margin-top: 20rpx;
		color: #606266;
		font-size: 26rpx;
	}

	.empty-sub {
		margin-top: 6rpx;
		color: #c0c4cc;
		font-size: 22rpx;
	}

	.add-line {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 18rpx;
		padding: 18rpx 0;
		border: 2rpx dashed #c6e2ff;
		border-radius: 12rpx;
		background-color: #f7fbff;
	}

	.add-line-text {
		margin-left: 8rpx;
		color: #2979ff;
		font-size: 26rpx;
	}

	/* 生成结果 */
	.result-head {
		display: flex;
		align-items: center;
	}

	.result-icon {
		flex-shrink: 0;
		width: 64rpx;
		height: 64rpx;
		line-height: 64rpx;
		text-align: center;
		border-radius: 50%;
		background-color: #e8f5e9;
		color: #2e9e4f;
		font-size: 36rpx;
		font-weight: bold;
	}

	.result-head-text {
		display: flex;
		flex-direction: column;
		margin-left: 18rpx;
	}

	.result-title {
		color: #2e9e4f;
		font-size: 32rpx;
		font-weight: bold;
	}

	.result-sub {
		margin-top: 4rpx;
		color: #909399;
		font-size: 22rpx;
	}

	.pallet-code {
		margin-top: 20rpx;
		padding: 22rpx 18rpx;
		border-radius: 14rpx;
		background-color: #f7f8fa;
		color: #303133;
		font-size: 40rpx;
		font-weight: bold;
		line-height: 1.4;
		text-align: center;
		word-break: break-all;
	}

	.print-line {
		display: flex;
		align-items: center;
		margin-top: 18rpx;
	}

	.print-dot {
		flex-shrink: 0;
		width: 14rpx;
		height: 14rpx;
		margin-right: 10rpx;
		border-radius: 50%;
		background-color: #c0c4cc;
	}

	.dot-ok {
		background-color: #2e9e4f;
	}

	.dot-fail {
		background-color: #f56c6c;
	}

	.print-text {
		color: #909399;
		font-size: 24rpx;
	}

	.text-ok {
		color: #2e9e4f;
	}

	.text-fail {
		color: #f56c6c;
	}

	.result-tip {
		margin-top: 12rpx;
		padding-top: 14rpx;
		border-top: 1rpx solid #f2f3f5;
		color: #c0c4cc;
		font-size: 22rpx;
	}

	/* 底部固定栏 */
	.tool-bar {
		position: fixed;
		left: 20rpx;
		right: 20rpx;
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
