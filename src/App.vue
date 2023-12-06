<script setup lang="ts">
	import { onLaunch, onShow, onHide } from "@dcloudio/uni-app"
	import { savePrintPage, initPrintPage } from "@/store/print"
	import { routes } from "@/store/route"
	import { logged } from "@/util/common"
	import { Env } from "@/type/env"

	onLaunch(() => {
		console.log("App Launch")

		// 初始化数据
		initPrintPage()
		// 生产模式隐藏测试页面
		if (process.env.NODE_ENV === Env.PROD) {
			uni.setTabBarItem({
				index: 1,
				visible: false
			})
		}
		// 判断是否已经登录
		if (logged()) {
			uni.switchTab({
				url: routes.home.path
			})
		} else {
			uni.redirectTo({
				url: routes.login.path
			})
		}
	})
	onShow(() => {

		console.log("App Show")
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
</style>