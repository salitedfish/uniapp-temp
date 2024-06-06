import pagesJSON from "@/pages.json"

const pages = pagesJSON.pages

// 实际路由数据从json中获取，但json无法获取类型，所以路由跳转类型能选哪些需要在这里配置
type TabRouteName = "login" | "home" | "blueTooth" | "demo" | "demoInside"
// 仓储管理的路由
type StockroomManagerName = "purchaseArrival" | "purchaseStockroom" | "materialOutStockroom" | "productionStockroom" | "deliveryMaterial" | "shelfChange" | "stockroomChange" | "codeCheck" | "otherStockDoc" | "otherOutStockDoc" |
	"refundDoc" | "outSrDocFlieUpload"
type DefaultSetRouteName = "pADefaultSetPage" | "pSDefaultSetPage" | "mOSDefaultSetPage" | "sCDefaultSetPage" | "prSDefaultSetPage" | "srCDefaultSetPage" | "oSDDefaultSetPage" | "oOSDDefaultSetPage" | "rDDefaultSetPage"
// 追溯管理的路由
type TraceManagerRouteName = "LdOnDuty" | "EquipmentCheck" | "LdWorkPlan" | "LdAndon" | "Trace" | "TraceProcess" | "TraceInfo" | "TraceSearch" | "ProductJobList" | "ProductJobPrinter"
// 外链路由
type LinkRouteName = "link"

export type RouteName = TabRouteName | StockroomManagerName | TraceManagerRouteName | DefaultSetRouteName | LinkRouteName
// 从json中获取路由类型
export type Route = typeof pages[0]

export enum RouteType {
	NAV = "nav",
	TAB = "tab"
}