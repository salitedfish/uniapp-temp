import pagesJSON from "@/pages.json"
import type { Route, RouteName } from "@/type/route"

const pages = pagesJSON.pages

// 类型强行断言，实际路由包含的数据比看到的多，提供跳转的只有RouteName配置的
const routes = {} as Record<RouteName, Route>
for (const item of pages) {
	item.path = `/${item.path}`
	routes[item.name as RouteName] = item
}

export {
	routes
}