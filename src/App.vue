<script setup lang="ts">
	import { onLaunch, onShow, onHide } from "@dcloudio/uni-app"
	import { savePrintPage, initPrintPage } from "@/store/print"
	import { routes, needLoginRoutes } from "@/store/route"
	import { logged } from "@/util/common"
	import { Env } from "@/type/env"
	import { Platform } from "@/util/env"
	import { authList, setUserInfo } from "@/store/auth"
	import { blueTooth } from "@/store/blueTooth"
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
				const path = location.pathname.slice(3)

				// 判断页面是否存在
				let name : string = ""
				let key : RouteName
				let exit = false
				for (key in routes) {
					if (routes[key].path === path) {
						exit = true
						name = key
						break
					}
				}
				// 页面不存在则跳到登录页（结束）
				if (!exit) {
					uni.redirectTo({
						url: routes.login.path
					})
					return
				}

				// 页面存在，并且是需要登录的
				if (needLoginRoutes.includes(path)) {
					// 如果已经登录
					if (logged()) {
						// 登录了获取用户信息
						await setUserInfo()
						if (!authList.value.includes(name)) {
							// 如果没权限就跳到首页
							uni.switchTab({
								url: routes.home.path
							})
						}
						// 没登录就去登录
					} else {
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
			// 这里的错误一般是已经登录了，但是获取用户信息的时候，网络异常啥的
			uni.switchTab({
				url: routes.home.path
			})
			uni.showToast({
				title: "网络异常",
				icon: "none",
				duration: 3000
			})
		} finally {
			console.log("App Launch")
			// app
			if (Platform.isApp()) {
				//如果之前有连接过蓝牙，则自动连接蓝牙
				const blueToothDeviceId = uni.getStorageSync("blueToothDeviceId")
				if (blueToothDeviceId) {
					blueTooth.autoConnect(blueToothDeviceId)
				}
			}
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

	uni-modal {
		z-index: 999999 !important;
	}
</style>