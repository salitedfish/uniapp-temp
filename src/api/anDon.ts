import { uRequest } from "./instance"
import type { Return, ReturnList, Paging } from "@/type/common"

// 查询按灯问题列表
export const getAnDonProblemTypeList = async () => {
	return await uRequest.post<Return<Obj>>({
		url: "ldAndonSet/problemTypeList",
	})
}

// 提交按灯
export const submitAnDon = async (data : Obj) => {
	return await uRequest.post<Return<Obj[]>>({
		url: "ldAndonMessage/add",
		data
	})
}

// 按灯列表查询
export const getAnDonList = async (data : Paging & Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "ldAndonMessage/pageList",
		data
	})
}