// 基础请求返回的类型
export type Return<T> = {
	status : number;
	data : T;
	msg : string;
};

// 分页返回的列表类型
export type ReturnList<T> = {
	data : T[];
	dataSize : number;
	end : number;
	hasNextPage : boolean;
	hasPrePage : boolean;
	pageNumber : number;
	pageSize : number;
	start : number;
	totalPage : number;
	totalSize : number;
};

// 分页请求参数类型
export type Paging = {
	page : number;
	size : number;
}

// 设置所有进程的通用状态
export enum ProcessStatus {
	INIT,
	RUNING,
	SUCCESS,
	FAIL
}