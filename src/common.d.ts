// 懒得每个类型都定义了，所有都定义为Obj
type Obj<T = any> = Record<string, T>

declare const jWeixin : {
	config : any,
	scanCode : any
}