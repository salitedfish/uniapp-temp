import { RouteType } from '../type/route'

// 路由配置
export const routes = {
	login: {
		path: "/pages/login/index",
		needLogin: false,
		type: RouteType.NAV
	},
	// 下面是tab
	blueTooth: {
		path: "/pages/blueTooth/index",
		needLogin: false,
		type: RouteType.TAB
	},
	home: {
		path: "/pages/home/index",
		needLogin: false,
		type: RouteType.TAB
	}
}