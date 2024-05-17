import { uRequest } from "./instance"
import type { Return, ReturnList, Paging } from "@/type/common"


// 工作计划查询
export const getWorkPlanList = async (data : Paging & Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "ldPlan/pageListWorkPlan",
		data
	})
}

// 获取计划
export const getWorkPlan = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "trace/findPlan",
		data
	})
}