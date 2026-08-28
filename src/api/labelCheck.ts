import { uRequest } from "./instance"
import type { Return, ReturnList, Paging } from "@/type/common"

// 标签校验
export const labelCheckApi = async (data: Obj = {}) => {
	return await uRequest.post<Return<Obj>>({
		url: "ldLabelCheck/check",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}

// 分页查询-标签校验记录
export const getLabelCheckPageList = async (data: Paging & Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "ldLabelCheck/pageList",
		data
	})
}
