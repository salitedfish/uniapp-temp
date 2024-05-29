<script setup lang="ts">
	import { onLaunch, onShow, onHide } from "@dcloudio/uni-app"
	import { savePrintPage } from "@/store/print"
	import { updateAllDate } from "@/store/common"
	import { Platform } from "@/util/env"
	import { initInDD } from "@/util/initInDD"
	import { initInWX } from "@/util/initInWX"
	import { initPage } from "@/util/initPage"

	onLaunch(async () => {
		console.log("App Launch")
		// 钉钉内嵌H5要先初始化钉钉信息，才能初始化页面，否则页面判断会异常
		if (Platform.isInDD()) {
			initInDD()
		}
		// 如果是微信内嵌H5
		else if (Platform.isInWx()) {
			initInWX()
		}
		// 其他情况直接初始化页面
		else {
			initPage()
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