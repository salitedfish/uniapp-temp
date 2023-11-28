import { createSSRApp } from "vue"
import uviewPlus from "uview-plus"
import App from "./App.vue"
import { initInterceptor } from "./util/interceptor"
import "./assets/css/global.scss"

// 初始化导航拦截器
initInterceptor()

export function createApp() {
	const app = createSSRApp(App)
	app.use(uviewPlus)
	return {
		app,
	}
}