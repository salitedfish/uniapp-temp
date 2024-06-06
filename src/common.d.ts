
// 懒得每个类型都定义了，所有都定义为Obj
type Obj<T = any> = Record<string, T>

type DingDing = typeof import("dingtalk-jsapi")
type WeiXin = typeof import("weixin-js-sdk").default

declare const linkWindow : Obj

declare const dingding : DingDing

declare const weixin : WeiXin

declare interface Window {
	dingding : DingDing;
	weixin : WeiXin;
}