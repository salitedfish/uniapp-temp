<script lang="ts" setup>
	import { ref } from "vue"
	import { Platform } from "@/util/env"
	import { ScanCode } from "@/fun/scanCode"
	import { globalColor } from "@/store/theme"

	const props = defineProps<{
		label ?: string
	}>()
	const emit = defineEmits<{
		(event : "scanSuccess", result : string) : void;
	}>()

	/**
	 * 是否显示照相机，只有在web环境下才需要显示, app自动会显示
	 */
	const showWebCamera = ref(false)

	/**
	 * 初始化扫描
	 */
	const initScan = async () => {
		// 纯浏览器H5端才需要显示
		if (Platform.isWeb() && !Platform.isInDD()) {
			showWebCamera.value = true
		}
		try {
			const res = await ScanCode.run({
				container: "scan-dom"
			})
			emit("scanSuccess", res as string)
			showWebCamera.value = false
		} catch (err) {
			showWebCamera.value = false
		}

		// 微信
		// @ts-ignore
		// wx.scanQRCode({
		// 	desc: "scanQRCode desc",
		// 	needResult: 1, // 默认为0，扫描结果由企业微信处理，1则直接返回扫描结果，
		// 	scanType: ["qrCode"], // 可以指定扫二维码还是条形码（一维码），默认二者都有
		// 	success: (obj: Obj) => {
		// 		emit("scanSuccess", obj.resultStr)
		// 	},
		// 	error: function (err: Obj) {
		// 		if (err.errMsg.indexOf("function_not_exist") > 0) {
		// 			alert("版本过低请升级");
		// 		}
		// 	},
		// });
	}
	/**
	 * 取消扫描
	 */
	const cancelScan = () => {
		ScanCode.stop()
		showWebCamera.value = false
	}
</script>

<template>

	<view @click="initScan" class="scan_btn">
		<view class="scan_label" v-if="props.label">{{ props.label }}</view>
		<uni-icons custom-prefix="custom-icon" type="icon-saomiao" size="18" :color="globalColor.primary"></uni-icons>
		<!-- <image class="scan_icon" src="../assets/scanCode_primary.svg" alt="" /> -->
	</view>

	<view class="scan-container" v-if="showWebCamera">
		<!-- 导航栏 -->
		<u-navbar title="扫码" :safeAreaInsetTop="false" @leftClick="cancelScan">
			<template #left>
				<view class="u-nav-slot">
					<u-icon name="arrow-left" size="19"></u-icon>
				</view>
			</template>
		</u-navbar>
		<!-- 扫描框 -->
		<view id="scan-dom"></view>
	</view>
</template>

<style lang="scss" scoped>
	.scan_btn {
		display: flex;
		align-items: center;
		color: v-bind("globalColor.primary");

		.scan_label {
			margin-right: 3px;
		}

		.scan_icon {
			width: 20px;
			height: 20px;
		}
	}


	.scan-container {
		position: fixed;
		top: 0px;
		left: 0px;
		right: 0px;
		height: 100vh;
		background: v-bind("globalColor.default");
		z-index: 999;

		#scan-dom {
			top: 50%;
			left: 0;
			transform: translateY(-50%);
		}
	}
</style>