import { createSSRApp } from "vue"
import uviewPlus from "uview-plus"
import App from "./App.vue"
import { initInterceptor } from "./util/interceptor"
import directive from "./util/directive"
import "./assets/css/global.scss"

// 初始化导航拦截器
initInterceptor()

// uni.$u.setConfig({
// 	// 修改$u.config对象的属性
// 	config: {
// 		// 修改默认单位为rpx，相当于执行 uni.$u.config.unit = 'rpx'
// 		unit: 'rpx'
// 	},
// })

export function createApp() {
	const app = createSSRApp(App)
	app.use(uviewPlus)
	directive(app)
	return {
		app,
	}
}