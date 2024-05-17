import { uRequest } from "./instance"
import type { Return, ReturnList, Paging } from "@/type/common"

// 打卡提交
export const submitClockIn = async (data : Obj) => {
	return await uRequest.post<Return<string>>({
		url: "ldOnDuty/add",
		data
	})
}

// 打卡提交记录查询
export const getClockInList = async (data : Paging & Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "ldOnDuty/pageList",
		data
	})
}