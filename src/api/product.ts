import { uRequest } from "./instance"
import type { Return, ReturnList, Paging } from "@/type/common"

// 获取产品详情
export const getProductByCode = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "ldProduct/findByCode",
		data
	})
}

// 分页查询产品列表(报工页产品编码弹窗单选)
export const getProductList = async (data : Paging & Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "ldProduct/pageList",
		data
	})
}
