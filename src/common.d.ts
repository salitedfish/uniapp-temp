// 懒得每个类型都定义了，所有都定义为Obj
type Obj<T = any> = Record<string, T>