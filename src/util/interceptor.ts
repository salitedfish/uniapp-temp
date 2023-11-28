import { routes } from "../store/route"
import { logged } from "./common"

const needLoginRoutes : string[] = []

// 遍历生成需要登录的路径
let key : keyof typeof routes
for (key in routes) {
	if (routes[key].needLogin) {
		needLoginRoutes.push(routes[key].path)
	}
}

// 需要添加拦截器的方法功能说明：支持手持设备（PDA扫码枪）使用，输入账号、密码并配置相关系统配置项，点击登录，登录成功后即可使用。
const list = ["navigateTo", "redirectTo", "reLaunch", "switchTab"];


export const initInterceptor = () => {
	// 循环添加拦截器
	list.forEach(item => {
		uni.addInterceptor(item, {
			invoke(e) {
				let url = e.url.split('?')[0]
				// 判断要打开的页面是否需要验证登录
				if (needLoginRoutes.includes(url) && !logged()) {
					uni.showToast({
						title: '该页面需要登录才能访问，请先登录',
						icon: 'none'
					})
					uni.navigateTo({
						url: routes.login.path
					})
					return false
				}
				return true
			},
			fail(err) { // 失败回调拦截 
				console.log(err);
			},
		})
	})
}