<script lang="ts" setup>
	import { computed } from "vue"
	import { ScanCode } from "@/fun/scanCode"
	import { token } from "@/store/auth"
	import { Platform } from "@/util/env"
	import { routes } from "@/store/route"

	const initScan = async () => {
		const res = await ScanCode.run() as string
		// 向子页面传递数据
		linkWindow.window.postMessage(res, routes.link.linkOrigin);
	}

	// 父页面监听子页面的消息
	window.addEventListener("message", (e : { origin : string, data : string }) => {
		if (e.origin === routes.link.linkOrigin) {
			// 目标地址的扫码操作
			if (e.data === "scanCode") {
				initScan()
			}
			// 目标地址的其他操作
		}
	})

	// 外链全路径包括传参
	const url = computed(() => {
		return `${routes.link.linkUrl}?token=${token.value}`
	})
</script>

<template>
	<view :class="{'iframe-box': Platform.isIosWeb() && Platform.isInDD()}" v-if="token">
		<iframe name="linkWindow" :src="url" style="width: 100vw; height: 100vh; border: none;"></iframe>
	</view>
</template>

<style>
	.iframe-box {
		padding-top: 40px;
	}
</style>