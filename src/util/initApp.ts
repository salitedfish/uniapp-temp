import { initPrintPage } from "@/store/print"
import { routes } from "@/store/route"
import { logged } from "@/util/common"
import { Env } from "@/type/env"
import { setUserInfo } from "@/store/auth"

export const initApp = async () => {
	try {

		// 打包隐藏测试页面
		if (process.env.NODE_ENV === Env.PROD) {
			uni.setTabBarItem({
				index: 1,
				visible: false
			})
		}

		// 初始化数据
		initPrintPage()
		// 如果已经登录了，则跳到首页
		if (logged()) {
			await setUserInfo()
			uni.switchTab({
				url: routes.home.path
			})
		}
		// 如果没登录，则跳到登录页面
		else {
			uni.redirectTo({
				url: routes.login.path
			})
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
	}
}