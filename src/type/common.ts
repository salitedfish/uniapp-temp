// 基础请求返回的类型
export type Return<T> = {
	status : number;
	data : T;
	msg : string;
};

// 分页返回的列表类型
export type ReturnList<T> = {
	list : T[];
	currentPage : number;
	pageSize : number;
	totalCount : number;
	errMsg : string;
};

// 分页请求参数类型
export type Paging = {
	currentPage ?: number;
	pageSize ?: number;
}

// 设置所有进程的通用状态
export enum ProcessStatus {
	INIT,
	RUNING,
	SUCCESS,
	FAIL
}

export type PageListApi = (params : Obj) => Promise<Return<ReturnList<Obj>>>