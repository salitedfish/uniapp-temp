import pagesJSON from "@/pages.json"

const pages = pagesJSON.pages

// 实际路由数据从json中获取，但json无法获取类型，所以路由跳转类型能选哪些需要在这里配置
export type RouteName = "login" | "home" | "blueTooth" | "demo" | "demoInside" | "print"
// 从json中获取路由类型
export type Route = typeof pages[0]

export enum RouteType {
	NAV = "nav",
	TAB = "tab"
}