import pagesJSON from "@/pages.json"

const pages = pagesJSON.pages

// 实际路由数据从json中获取，但json无法获取类型，所以路由跳转类型能选哪些需要在这里配置
type TabRouteName = "login" | "home" | "blueTooth" | "demo" | "demoInside"

// 追溯管理的路由
type TraceManagerRouteName = "Trace" | "TraceProcess" | "TraceInfo" | "TraceSearch" | "HistorySearch"
// 外链路由
type LinkRouteName = "board"

export type RouteName = TabRouteName | TraceManagerRouteName | LinkRouteName
// 从json中获取路由类型
export type Route = typeof pages[0]

export enum RouteType {
	NAV = "nav",
	TAB = "tab"
}