import { createSSRApp } from "vue"
import uviewPlus from "uview-plus"
import App from "./App.vue"
import { initInterceptor } from "./util/interceptor"
import directive from "./util/directive"
import defineGlobalComponents from "./util/defineGlobalComponents"
import "./assets/css/global.scss"

// #ifndef MP
// 处理 wx.connectSocket promisify 兼容问题，强制返回 SocketTask
uni.connectSocket = (function (connectSocket : Obj) {
	return function (options : Obj) {
		console.log(options)
		options.success = options.success || function () { }
		// @ts-ignore
		return connectSocket.call(this, options)
	}
})(uni.connectSocket)
// #endif

// 初始化导航拦截器
initInterceptor()

// uni.$u.setConfig({
// 	// 修改$u.config对象的属性
// 	config: {
// 		// 修改默认单位为rpx，相当于执行 uni.$u.config.unit = 'rpx'
// 		unit: 'rpx'
// 	},
// })

export const createApp = () => {
	const app = createSSRApp(App)
	app.use(uviewPlus)
	directive(app)
	defineGlobalComponents(app)
	return {
		app,
	}
}