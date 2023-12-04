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
	 * 是否显示照相机，只有在web环境下才需要显示
	 */
	const showWebCamera = ref(false)

	/**
	 * 初始化扫描
	 */
	const initScan = async () => {
		if (Platform.isWeb()) {
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
		<image class="scan_icon" src="../assets/scanCode_primary.svg" alt="" />
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
		color: $u-primary;

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