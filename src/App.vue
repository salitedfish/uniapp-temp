<script setup lang="ts">
	import { onLaunch, onShow, onHide } from "@dcloudio/uni-app"
	import { savePrintPage } from "@/store/print"
	import { updateAllDate } from "@/store/common"
	import { Platform } from "@/util/env"
	import { initInDD } from "@/util/initInDD"
	import { initInWX } from "@/util/initInWX"
	import { initWeb } from "@/util/initWeb"
	import { initApp } from "@/util/initApp"
	import { routes } from "@/store/route"

	onLaunch(async () => {
		console.log("App Launch")
		// 大屏则进入看板页面
		if (Platform.isBigScreen()) {
			uni.navigateTo({
				url: `${routes.board.path}?deviceId=${Platform.deviceId}`
			})
		}
		// 小屏则正常初始化
		else {
			// 钉钉内嵌H5要先初始化钉钉信息，才能初始化页面，否则页面判断会异常
			if (Platform.isInDD()) {
				initInDD()
			}
			// 如果是微信内嵌H5
			else if (Platform.isInWx()) {
				initInWX()
			}
			// 如果是H5
			else if (Platform.isWeb()) {
				initWeb()
			}
			// 如果是app
			else if (Platform.isApp()) {
				initApp()
			}
		}

	})
	onShow(() => {
		console.log("App Show")
		updateAllDate()

	})
	onHide(() => {
		console.log("App Hide")
		// 保存要缓存的数据
		savePrintPage()
	})
</script>

<style lang="scss">
	@import "uview-plus/index.scss";
	@import "@/static/iconfont.css";

	* {
		box-sizing: border-box;
	}

	uni-modal {
		z-index: 999999 !important;
	}
</style>