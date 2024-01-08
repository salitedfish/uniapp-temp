<script setup lang="ts">
	import { onLaunch, onShow, onHide } from "@dcloudio/uni-app"
	import { savePrintPage, initPrintPage } from "@/store/print"
	import { routes, needLoginRoutes } from "@/store/route"
	import { logged } from "@/util/common"
	import { Env } from "@/type/env"
	import { Platform } from "@/util/env"
	import { authList, setUserInfo } from "@/store/auth"
	import type { RouteName } from "./type/route"

	onLaunch(async () => {
		try {
			// 初始化数据
			initPrintPage()
			// 生产模式隐藏测试页面
			if (process.env.NODE_ENV === Env.PROD) {
				uni.setTabBarItem({
					index: 1,
					visible: false
				})
			}

			// web
			if (Platform.isWeb()) {
				const path = location.hash.slice(1)
				if (needLoginRoutes.includes(path)) {
					// 如果是需要登录的
					if (logged()) {
						// 登录了获取用户信息
						await setUserInfo()
						let name : string = ""
						let key : RouteName
						for (key in routes) {
							if (routes[key].path === path) {
								name = key
								break
							}
						}
						if (!authList.value.includes(name)) {
							// 如果没权限就跳到首页
							uni.switchTab({
								url: routes.home.path
							})
						}
					} else {
						// 没登录就去登录
						uni.redirectTo({
							url: routes.login.path
						})
					}
				}
			}
			// app
			if (Platform.isApp()) {
				if (logged()) {
					await setUserInfo()
					// 如果已经登录了，则跳到首页
					uni.switchTab({
						url: routes.home.path
					})
				} else {
					// 如果没登录，则跳到登录页面
					uni.redirectTo({
						url: routes.login.path
					})
				}
			}
		} catch (err) {
			console.log(err)
		} finally {
			console.log("App Launch")
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