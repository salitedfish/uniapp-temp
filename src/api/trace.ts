import { uRequest } from "./instance"
import type { Return, ReturnList, Paging } from "@/type/common"

// 查询产线列表
export const getLineList = async (data : Paging & Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "ldLine/pageList",
		data,
	})
}

// 追溯查询
export const getTraceList = async (data : Obj = {}) => {
	return await uRequest.post<Return<Objs>>({
		url: "trace/search",
		data,
	})
}

// 获取追溯产线列表
export const getTraceLineList = async (data : Obj) => {
	return await uRequest.post<Return<Objs>>({
		url: "ldLine/listLineAll",
		data,
	})
}

// 获取追溯产线详情
export const getTraceLineDetail = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "ldLine/findDetailByLineId",
		data,
	})
}

// 获取流程
export const getProcessDetail = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "trace/findProcess",
		data,
	})
}

// 获取产线详情
export const getLineDetail = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "ldLine/findDetailByLineDetailId",
		data,
	})
}

// 获取报工列表
export const getTracePageList = async (data : Paging & Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "trackBack/pageList",
		data,
	})
}

// 获取设备信息
export const getEquipmentByLineDetailId = async (data : Obj) => {
	return await uRequest.post<Return<Objs>>({
		url: "trace/findEquipment",
		data,
	})
}

// 获取失效模式
export const getFailureModList = async (data : Paging & Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "ldFailureMode/pageList",
		data,
	})
}

// 获取检验单列表
export const getCheckItemListApi = async (data : Obj) => {
	return await uRequest.post<Return<Objs>>({
		url: "ldCheckItem/checkList",
		data,
	})
}

// 报工提交
export const productJobSubmit = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "trackBack/submit",
		data,
		header: {
			"Content-Type": "application/json",
		},
	})
}

// 获取历史报工记录
export const getProductJobHistory = async (data : Paging & Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		// url: "productJob/list",
		url: "trace/pageList",
		data,
	})
}

// 获取报工详情
export const getProductJobDetail = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "trace/findDetail",
		data,
	})
}

// 报工打印
export const printProductJob = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "tracePrint/print",
		data,
	})
}

// 码规则、重码、上到工序及返工校验
export const codeCheckInfoApi = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "trace/checkBarcode",
		data,
		header: {
			"Content-Type": "application/json",
		},
	})
}

export const getEquipmentDataApi = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "trackBack/obtainEquipmentData",
		data,
	})
}

export const getProductSubmitDataApi = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "trace/findTotalNum",
		data,
	})
}

export const getBoxInfoApi = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "trace/",
		data,
	})
}