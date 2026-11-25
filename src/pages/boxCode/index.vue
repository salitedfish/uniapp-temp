<script lang="ts" setup>
	import { onMounted, ref } from "vue"
	import CustomNavBar from "@/components/CustomNavBar.vue"
	import UpInputScan from "@/components/UpInputScan.vue"
	import { routes } from "@/store/route"
	import { generateBoxCodeApi, todayBoxCodesApi } from "@/api/boxCode"
	import type { BoxCodeRecord } from "@/api/boxCode"
	import { printBoxQr } from "./util"

	// 同一个条码扫第二次时，从缓存里带出上次的数量
	const QTY_CACHE_KEY = "boxCodeQtyCache"

	const barcode = ref("")
	const qtyShow = ref(false)
	const qty = ref("")
	const currentBarcode = ref("")
	const qrValue = ref("")
	const printing = ref(false)
	const generating = ref(false)
	const historyList = ref<BoxCodeRecord[]>([])
	const historyLoading = ref(false)

	// 当天本人生成的箱码，进页面时查一次，生成成功后重查
	const loadHistory = async () => {
		try {
			historyLoading.value = true
			const res = await todayBoxCodesApi()
			historyList.value = res.data || []
		} catch (err) {
			// 接口异常已由请求封装统一弹窗
			console.log(err)
		} finally {
			historyLoading.value = false
		}
	}

	// 当天记录只展示时分秒，日期在标题里已限定
	const formatTime = (value : string) => {
		if (!value) return ""
		return value.length >= 19 ? value.slice(11, 19) : value
	}

	// 历史记录兼容老数据：partNo 为空时从码值第一段取
	const partNoOf = (code : string) => {
		const parts = (code || "").split(",")
		return parts[0] || "-"
	}

	// 箱码第二段是数量
	const qtyOf = (code : string) => {
		const parts = (code || "").split(",")
		return parts.length > 1 ? parts[1] : "-"
	}

	onMounted(() => {
		loadHistory()
	})

	// 扫码/扫码枪结果：带出缓存数量并打开数量弹窗
	const openQty = (code : string) => {
		const value = (code || "").trim()
		if (!value) return
		currentBarcode.value = value
		barcode.value = value
		const cache = uni.getStorageSync(QTY_CACHE_KEY) || {}
		qty.value = cache[value] ? String(cache[value]) : ""
		qtyShow.value = true
	}

	// 确定数量：流水号由后端发，成功后写数量缓存并展示码值
	const confirmQty = async () => {
		const num = Number(qty.value)
		if (!qty.value || !Number.isInteger(num) || num <= 0) {
			uni.showToast({
				icon: "none",
				title: "请输入正确的数量"
			})
			return
		}
		try {
			generating.value = true
			const res = await generateBoxCodeApi({
				barcode: currentBarcode.value,
				quantity: num
			})
			const cache = uni.getStorageSync(QTY_CACHE_KEY) || {}
			cache[currentBarcode.value] = num
			uni.setStorageSync(QTY_CACHE_KEY, cache)
			qrValue.value = res.data
			qtyShow.value = false
			barcode.value = ""
			await loadHistory()
		} catch (err) {
			// 接口异常已由请求封装统一弹窗
			console.log(err)
		} finally {
			generating.value = false
		}
	}

	// 生成中不允许关闭数量弹窗，避免请求回来后弹窗状态错位
	const closeQty = () => {
		if (!generating.value) qtyShow.value = false
	}

	const print = async () => {
		if (!qrValue.value || printing.value) return
		try {
			printing.value = true
			await printBoxQr(qrValue.value)
		} catch (err) {
			console.log(err)
			uni.showToast({
				icon: "none",
				title: "打印失败"
			})
		} finally {
			printing.value = false
		}
	}
</script>

<template>
	<view class="common-page-container box-page">
		<CustomNavBar :title="routes.BoxCodeGenerate.style.navigationBarTitleText"></CustomNavBar>

		<!-- 顶部说明 -->
		<view class="box-hero">
			<view class="hero-top">
				<view class="hero-mark">箱</view>
				<view class="hero-text">
					<text class="hero-title">箱码生成</text>
					<text class="hero-desc">扫描零件条码，输入数量，生成箱码并打印</text>
				</view>
			</view>
			<view class="hero-steps">
				<view class="hero-step">
					<text class="hero-step-no">1</text>
					<text class="hero-step-text">扫条码</text>
				</view>
				<view class="hero-step-line"></view>
				<view class="hero-step">
					<text class="hero-step-no">2</text>
					<text class="hero-step-text">填数量</text>
				</view>
				<view class="hero-step-line"></view>
				<view class="hero-step">
					<text class="hero-step-no">3</text>
					<text class="hero-step-text">生成打印</text>
				</view>
			</view>
		</view>

		<!-- 扫描区 -->
		<view class="scan-card">
			<view class="card-head">
				<view class="head-left">
					<text class="card-title">扫描条码</text>
					<text class="card-sub">扫码后输入数量</text>
				</view>
				<text class="required-tag">必填</text>
			</view>
			<view class="scan-box">
				<up-input-scan v-model="barcode" @scanSuccess="openQty" placeholder="请扫描条码或二维码" clearable
					class="input-item" focus></up-input-scan>
			</view>
			<view class="scan-tip">支持扫码枪和摄像头；同一根条码再次扫描会自动带出上次数量</view>
		</view>

		<!-- 生成结果 -->
		<view v-if="qrValue" class="result-card">
			<view class="result-head">
				<view class="result-icon">✓</view>
				<view class="result-head-text">
					<text class="result-title">箱码生成成功</text>
					<text class="result-sub">请打印并粘贴到箱体</text>
				</view>
			</view>
			<view class="qr-frame">
				<w-qrcode :options="{ code: qrValue, size: 220 }"></w-qrcode>
			</view>
			<view class="qr-value">{{ qrValue }}</view>
			<up-button type="primary" text="打印箱码" class="print-btn" shape="circle" :loading="printing"
				:disabled="printing" @click="print"></up-button>
		</view>

		<!-- 当天记录 -->
		<view class="history-card">
			<view class="card-head">
				<view class="head-left">
					<text class="card-title">今日生成记录</text>
					<text class="count-badge">{{ historyList.length }}</text>
				</view>
				<text class="card-sub">{{ historyLoading ? "加载中..." : "仅显示本人" }}</text>
			</view>
			<view v-if="historyList.length" class="history-list">
				<view v-for="(item, index) in historyList" :key="item.id" class="history-item">
					<text class="history-index">{{ index + 1 }}</text>
					<view class="history-main">
						<view class="history-top">
							<text class="history-part">{{ item.partNo || partNoOf(item.boxCode) }}</text>
							<text class="history-qty">数量：{{ qtyOf(item.boxCode) }}</text>
						</view>
						<text class="history-code">{{ item.boxCode }}</text>
						<view class="history-bottom">
							<text class="history-time">{{ formatTime(item.createTime) }}</text>
							<text class="bind-tag" :class="item.palletCode ? 'tag-bound' : 'tag-unbound'">
								{{ item.palletCode ? "已绑 " + item.palletCode : "未绑定" }}
							</text>
						</view>
					</view>
				</view>
			</view>
			<view v-else class="history-empty">
				<view class="empty-icon">箱</view>
				<text class="empty-title">{{ historyLoading ? "正在加载..." : "今天还没有生成记录" }}</text>
				<text class="empty-sub">扫描条码生成第一张箱码</text>
			</view>
		</view>

		<!-- 数量弹窗 -->
		<up-popup :show="qtyShow" mode="center" :round="10" @close="closeQty">
			<view class="qty-popup">
				<view class="qty-head">
					<text class="qty-title">输入数量</text>
					<text class="qty-close" @click="closeQty">×</text>
				</view>
				<view class="qty-barcode">{{ currentBarcode }}</view>
				<view class="qty-input-wrap">
					<up-input v-model="qty" type="number" placeholder="请输入数量" clearable class="input-item" focus
						border="surround" :disabled="generating"></up-input>
				</view>
				<view class="qty-btns">
					<up-button type="info" text="取消" size="small" shape="circle" plain style="flex: 1"
						:disabled="generating" @click="closeQty"></up-button>
					<up-button type="primary" text="确定生成" size="small" shape="circle"
						style="flex: 1; margin-left: 20rpx" :loading="generating" :disabled="generating"
						@click="confirmQty"></up-button>
				</view>
			</view>
		</up-popup>
	</view>
</template>

<style lang="scss" scoped>
	.box-page {
		box-sizing: border-box;
		min-height: 100vh;
		padding-bottom: 40rpx;
		background-color: #f5f6f8;
	}

	/* 顶部说明 */
	.box-hero {
		margin-top: 24rpx;
		padding: 36rpx 32rpx 30rpx;
		border-radius: 24rpx;
		background: linear-gradient(135deg, #2979ff 0%, #5b9bff 100%);
		box-shadow: 0 12rpx 30rpx rgba(41, 121, 255, 0.25);
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
		color: #2979ff;
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
	.scan-card,
	.result-card,
	.history-card {
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

	.scan-box {
		padding: 4rpx 18rpx;
		border: 2rpx solid #c6e2ff;
		border-radius: 14rpx;
		background-color: #f7fbff;
	}

	.scan-box :deep(.u-input) {
		border: none;
		background-color: transparent;
	}

	.scan-tip {
		margin-top: 14rpx;
		color: #909399;
		font-size: 22rpx;
		line-height: 1.5;
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

	.qr-frame {
		display: flex;
		justify-content: center;
		margin-top: 24rpx;
		padding: 18rpx;
		border: 1rpx solid #ebeef5;
		border-radius: 16rpx;
		background-color: #ffffff;
	}

	.qr-value {
		margin-top: 18rpx;
		padding: 16rpx 18rpx;
		border-radius: 12rpx;
		background-color: #f7f8fa;
		color: #303133;
		font-size: 24rpx;
		line-height: 1.5;
		text-align: center;
		word-break: break-all;
	}

	.print-btn {
		width: 100%;
		margin-top: 24rpx;
	}

	/* 当天记录 */
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

	.history-list {
		margin-top: 4rpx;
	}

	.history-item {
		display: flex;
		align-items: flex-start;
		padding: 20rpx 0;
		border-top: 1rpx solid #f2f3f5;
	}

	.history-item:first-child {
		border-top: none;
	}

	.history-index {
		flex-shrink: 0;
		width: 40rpx;
		height: 40rpx;
		line-height: 40rpx;
		margin-right: 16rpx;
		text-align: center;
		border-radius: 50%;
		background-color: #f4f7ff;
		color: #2979ff;
		font-size: 22rpx;
		font-weight: bold;
	}

	.history-main {
		flex: 1;
		min-width: 0;
	}

	.history-top {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
	}

	.history-part {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		color: #303133;
		font-size: 28rpx;
		font-weight: bold;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.history-qty {
		flex-shrink: 0;
		margin-left: 16rpx;
		color: #2979ff;
		font-size: 26rpx;
		font-weight: bold;
	}

	.history-code {
		display: block;
		margin-top: 6rpx;
		color: #909399;
		font-size: 22rpx;
		line-height: 1.4;
		word-break: break-all;
	}

	.history-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 8rpx;
	}

	.history-time {
		color: #c0c4cc;
		font-size: 22rpx;
	}

	.bind-tag {
		flex-shrink: 0;
		padding: 2rpx 12rpx;
		border-radius: 18rpx;
		font-size: 20rpx;
	}

	.tag-bound {
		background-color: #e8f5e9;
		color: #2e9e4f;
	}

	.tag-unbound {
		background-color: #f4f4f5;
		color: #909399;
	}

	.history-empty {
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

	/* 数量弹窗 */
	.qty-popup {
		width: 80vw;
		padding: 32rpx;
	}

	.qty-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.qty-title {
		color: #303133;
		font-size: 34rpx;
		font-weight: bold;
	}

	.qty-close {
		padding: 0 8rpx;
		color: #c0c4cc;
		font-size: 44rpx;
		line-height: 1;
	}

	.qty-barcode {
		margin-top: 20rpx;
		padding: 14rpx 16rpx;
		border-radius: 10rpx;
		background-color: #f7f8fa;
		color: #606266;
		font-size: 22rpx;
		line-height: 1.5;
		word-break: break-all;
	}

	.qty-input-wrap {
		margin-top: 20rpx;
	}

	.qty-btns {
		display: flex;
		margin-top: 28rpx;
	}
</style>
