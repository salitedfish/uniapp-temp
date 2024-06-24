import { needLoginRoutes, routes } from "@/store/route"
import { logged } from "@/util/common"
import { Platform } from "@/util/env"
import { setWxConfig } from "@/util/initInWX"

// 需要添加拦截器的方法功能说明
// navigateBack先不加拦截器
const list = ["navigateTo", "redirectTo", "reLaunch", "switchTab"];

export const initInterceptor = () => {
	// 循环添加拦截器
	list.forEach(item => {
		uni.addInterceptor(item, {
			invoke(e) {
				console.log("interceptor", e)
				let url = e.url.split('?')[0]
				// 判断要打开的页面是否需要验证登录
				if (needLoginRoutes.includes(url) && !logged()) {
					// uni.showToast({
					// 	title: '该页面需要登录才能访问，请先登录',
					// 	icon: 'none'
					// })
					uni.showModal({
						title: '提示',
						content: '该页面需要登录才能访问，请先登录',
					});
					uni.navigateTo({
						url: routes.login.path
					})
					return false
				}
				// 如果是微信内嵌的浏览器，路由改变需要重新配置wx（页面回退效果待确认）
				if (Platform.isInWx()) {
					const rootPath = import.meta.env.VITE_BASE_PAGE_PATH_WEB ? `/${import.meta.env.VITE_BASE_PAGE_PATH_WEB}` : ""
					setWxConfig({ url: `${window.location.origin}${rootPath}${e.url}` })
				}
				return true
			},
			fail(err) { // 失败回调拦截 
				console.log(err);
			},
		})
	})
}